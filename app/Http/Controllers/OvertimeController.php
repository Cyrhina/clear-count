<?php

namespace App\Http\Controllers;

use App\Exceptions\ConflictException;
use App\Models\Employee;
use App\Models\OvertimeRate;
use App\Models\OvertimeRecord;
use App\Support\ActivityLogger;
use App\Support\Approval;
use App\Support\PayrollDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Overtime and night differential: file, list and approve. */
class OvertimeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $rows = OvertimeRecord::with(['requester:id,name', 'decider:id,name'])
            ->when($data['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($data['from'] ?? null, fn ($q, $d) => $q->whereDate('work_date', '>=', $d))
            ->when($data['to'] ?? null, fn ($q, $d) => $q->whereDate('work_date', '<=', $d))
            ->orderByDesc('work_date')->orderByDesc('id')->limit(2000)->get();

        return response()->json(['data' => $rows]);
    }

    public function store(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        PayrollDefaults::ensureOvertimeRates($companyId);
        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
            'work_date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'type' => ['required', 'string', Rule::exists('overtime_rates', 'key')->where('company_id', $companyId)],
            'reason' => ['nullable', 'string', 'max:255'],
            'source' => ['sometimes', Rule::in(['admin', 'ess'])],
        ]);
        if ($data['start_time'] === $data['end_time']) {
            return response()->json(['message' => 'The end time must differ from the start time.', 'errors' => ['end_time' => ['The end time must differ from the start time.']]], 422);
        }

        $employee = Employee::findOrFail($data['employee_id']);
        $overtime = OvertimeRecord::create([
            'company_id' => $employee->company_id, 'employee_id' => $employee->id, 'work_date' => $data['work_date'],
            'start_time' => $data['start_time'], 'end_time' => $data['end_time'], 'hours' => self::hours($data['start_time'], $data['end_time']),
            'type' => $data['type'], 'multiplier' => OvertimeRate::where('key', $data['type'])->value('multiplier'),
            'status' => 'pending', 'reason' => $data['reason'] ?? null, 'source' => $data['source'] ?? 'admin', 'requested_by' => $request->user()->id,
        ]);
        ActivityLogger::log(module: 'Overtime', action: 'Added', title: 'Overtime request', description: "{$overtime->hours} hr(s) on {$data['work_date']}", subject: $overtime);

        return response()->json(['data' => $overtime], 201);
    }

    /** Approve or reject several at once; the ones already decided are skipped. */
    public function decide(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1', 'max:200'], 'ids.*' => ['integer'], 'decision' => ['required', Rule::in(['approved', 'rejected'])]]);

        $decided = 0;
        foreach (OvertimeRecord::whereIn('id', $data['ids'])->where('status', 'pending')->get() as $overtime) {
            try {
                Approval::decide($overtime, $data['decision'], $request->user());
            } catch (ConflictException) {
                continue;
            }
            $decided++;
            ActivityLogger::log(module: 'Overtime', action: ucfirst($data['decision']), title: 'Overtime request', description: "{$overtime->hours} hr(s) on {$overtime->work_date->toDateString()}", subject: $overtime);
        }
        if ($decided === 0) {
            throw new ConflictException('Nothing to decide: those requests were already decided.');
        }

        return response()->json(['data' => ['decided' => $decided]]);
    }

    /** Hours between two HH:MM times, to a tenth. An end before the start crosses midnight (night differential). */
    public static function hours(string $start, string $end): float
    {
        [$sh, $sm] = array_map('intval', explode(':', $start));
        [$eh, $em] = array_map('intval', explode(':', $end));
        $minutes = $eh * 60 + $em - ($sh * 60 + $sm);
        if ($minutes <= 0) {
            $minutes += 24 * 60;
        }

        return round($minutes / 60, 1);
    }
}
