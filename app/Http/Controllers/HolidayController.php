<?php

namespace App\Http\Controllers;

use App\Enums\HolidayScope;
use App\Enums\HolidayType;
use App\Http\Requests\StoreHolidayRequest;
use App\Http\Requests\UpdateHolidayRequest;
use App\Http\Resources\HolidayResource;
use App\Models\Holiday;
use App\Support\ActivityLogger;
use App\Support\PhilippineHolidays;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Holidays tab of Company & Payroll Settings. Works on the signed-in user's own company calendar only
 * (the `{holiday}` route binding returns 404 for any other company's row); the route group requires `settings.company.edit`.
 */
class HolidayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'type' => ['nullable', Rule::enum(HolidayType::class)],
            'scope' => ['nullable', Rule::enum(HolidayScope::class)],
        ]);
        $year = (int) ($filters['year'] ?? now()->year);

        $holidays = Holiday::activeForCompany($request->user()->company_id)
            ->forYear($year)
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->where('type', $v))
            ->when($filters['scope'] ?? null, fn ($q, $v) => $q->where('scope', $v))
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        return HolidayResource::collection($holidays)->additional(['meta' => ['year' => $year, 'count' => $holidays->count()]])->response();
    }

    public function store(StoreHolidayRequest $request): JsonResponse
    {
        $holiday = Holiday::create([...$request->holidayData(), 'company_id' => $request->user()->company_id, 'is_default' => false]);
        ActivityLogger::log(module: 'Company Settings', action: 'Added', title: 'Holiday', description: "{$holiday->name} ({$holiday->date->format('M j, Y')})", subject: $holiday);

        return (new HolidayResource($holiday))->response()->setStatusCode(201);
    }

    public function update(UpdateHolidayRequest $request, Holiday $holiday): JsonResponse
    {
        // Editing a default holiday (say the proclaimed date moved) makes it the company's own: it stays, but is no longer reset by an import.
        $holiday->update([...$request->holidayData(), 'is_default' => false]);
        ActivityLogger::log(module: 'Company Settings', action: 'Updated', title: 'Holiday', description: "{$holiday->name} ({$holiday->date->format('M j, Y')})", subject: $holiday);

        return (new HolidayResource($holiday))->response();
    }

    /** Soft delete: the row is hidden everywhere but can be recovered from the database if it was a mistake. */
    public function destroy(Holiday $holiday): JsonResponse
    {
        $holiday->delete();
        ActivityLogger::log(module: 'Company Settings', action: 'Deleted', title: 'Holiday', description: "{$holiday->name} ({$holiday->date->format('M j, Y')})", subject: $holiday);

        return response()->json(null, 204);
    }

    /**
     * Copies the Philippine default calendar for a year into the company.
     *  mode=missing (default): add the defaults whose date is still free; nothing existing is touched.
     *  mode=reset: first remove the company's untouched default holidays for that year, then add them all again.
     *              Holidays the company added or edited itself are always kept.
     */
    public function bulkImportDefaults(Request $request): JsonResponse
    {
        $data = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'mode' => ['nullable', Rule::in(['missing', 'reset'])],
        ]);
        $year = (int) ($data['year'] ?? now()->year);
        $mode = $data['mode'] ?? 'missing';
        $companyId = $request->user()->company_id;

        $result = DB::transaction(function () use ($companyId, $year, $mode) {
            $defaults = PhilippineHolidays::ensureSystemDefaults($year);
            $removed = 0;

            if ($mode === 'reset') {
                $removed = Holiday::activeForCompany($companyId)->forYear($year)->where('is_default', true)->forceDelete();
            }

            $taken = Holiday::activeForCompany($companyId)->forYear($year)->pluck('date')->map(fn ($d) => $d->toDateString())->all();
            $added = 0;
            $skipped = 0;
            foreach ($defaults as $default) {
                if (in_array($default->date->toDateString(), $taken, true)) {
                    $skipped++;

                    continue;
                }
                Holiday::create([
                    'company_id' => $companyId,
                    'name' => $default->name,
                    'date' => $default->date,
                    'type' => $default->type,
                    'scope' => $default->scope,
                    'pay_rate_multiplier' => $default->pay_rate_multiplier,
                    'description' => $default->description,
                    'is_default' => true,
                ]);
                $taken[] = $default->date->toDateString();
                $added++;
            }

            return compact('added', 'skipped', 'removed');
        });

        ActivityLogger::log(module: 'Company Settings', action: 'Added', title: 'Default holidays', description: "{$year}: {$result['added']} added, {$result['removed']} reset");

        $holidays = Holiday::activeForCompany($companyId)->forYear($year)->orderBy('date')->orderBy('id')->get();

        return HolidayResource::collection($holidays)->additional(['meta' => ['year' => $year, 'count' => $holidays->count(), ...$result]])->response();
    }
}
