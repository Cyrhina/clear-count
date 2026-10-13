<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\ShiftAssignment;
use App\Models\WorkSchedule;
use App\Support\ActivityLogger;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The roster: shift templates (the work schedules) and who works which one on which day. Every employee list is cut down
 * to the employees the user can see (a manager's branch), so a stray id is ignored instead of written.
 */
class ShiftRosterController extends Controller
{
    private const MAX_DAYS = 366;

    /** Employees times days in one request; a bigger roster is done in several steps. */
    private const MAX_CELLS = 20000;

    public function templates(): JsonResponse
    {
        return response()->json(['data' => WorkSchedule::withCount('employees')->orderBy('name')->get()]);
    }

    public function index(Request $request): JsonResponse
    {
        $range = $request->validate(['from' => ['required', 'date_format:Y-m-d'], 'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from']]);
        if (CarbonImmutable::parse($range['from'])->diffInDays($range['to']) > self::MAX_DAYS) {
            return response()->json(['message' => 'Pick a range of a year or less.'], 422);
        }

        $rows = ShiftAssignment::whereBetween('date', [$range['from'], $range['to']])->get(['id', 'employee_id', 'date', 'work_schedule_id']);

        return response()->json(['data' => $rows]);
    }

    /** Sets the shift for every employee on every date; no `work_schedule_id` means a rest day. */
    public function assign(Request $request): JsonResponse
    {
        $data = $request->validate([
            ...$this->listRules(),
            'work_schedule_id' => ['nullable', 'integer', Rule::exists('work_schedules', 'id')->where('company_id', $request->user()->company_id)],
        ]);
        if ($tooBig = $this->tooBig($data)) {
            return $tooBig;
        }

        $rows = [];
        foreach ($this->visibleEmployees($data['employee_ids']) as $employeeId) {
            foreach (array_unique($data['dates']) as $date) {
                $rows[] = ['employee_id' => $employeeId, 'date' => $date, 'work_schedule_id' => $data['work_schedule_id'] ?? null];
            }
        }

        $this->write($request, $rows);
        $this->log('Roster updated', count($rows).' day'.(count($rows) === 1 ? '' : 's').' assigned for '.count($data['employee_ids']).' employees');

        return response()->json(['data' => ['changed' => count($rows)]]);
    }

    /** Takes the days back to "not yet scheduled". */
    public function clear(Request $request): JsonResponse
    {
        $data = $request->validate($this->listRules());
        if ($tooBig = $this->tooBig($data)) {
            return $tooBig;
        }

        $changed = ShiftAssignment::whereIn('employee_id', $this->visibleEmployees($data['employee_ids']))->whereIn('date', $data['dates'])->delete();
        $this->log('Roster cleared', "{$changed} day".($changed === 1 ? '' : 's').' cleared');

        return response()->json(['data' => ['changed' => $changed]]);
    }

    /** Copies the seven days from `from_start` onto the seven days from `to_start`. Days with no roster entry are left as they are. */
    public function copyWeek(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'from_start' => ['required', 'date_format:Y-m-d'],
            'to_start' => ['required', 'date_format:Y-m-d'],
        ]);
        $from = CarbonImmutable::parse($data['from_start']);
        $to = CarbonImmutable::parse($data['to_start']);

        $rows = ShiftAssignment::whereIn('employee_id', $this->visibleEmployees($data['employee_ids']))
            ->whereBetween('date', [$from->toDateString(), $from->addDays(6)->toDateString()])
            ->get()
            ->map(fn (ShiftAssignment $a) => [
                'employee_id' => $a->employee_id,
                'date' => $to->addDays((int) $from->diffInDays($a->date))->toDateString(),
                'work_schedule_id' => $a->work_schedule_id,
            ])->all();

        $this->write($request, $rows);
        $this->log('Roster copied', count($rows).' day'.(count($rows) === 1 ? '' : 's').' copied to the week of '.$to->toDateString());

        return response()->json(['data' => ['changed' => count($rows)]]);
    }

    /** @param  array{employee_ids: array<int>, dates: array<string>}  $data */
    private function tooBig(array $data): ?JsonResponse
    {
        return count($data['employee_ids']) * count($data['dates']) > self::MAX_CELLS
            ? response()->json(['message' => 'That is too many days at once. Pick fewer employees or a shorter range.'], 422)
            : null;
    }

    /** @return array<string, mixed> */
    private function listRules(): array
    {
        return [
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'dates' => ['required', 'array', 'min:1', 'max:'.self::MAX_DAYS],
            'dates.*' => ['date_format:Y-m-d'],
        ];
    }

    /**
     * @param  list<int>  $ids
     * @return list<int>
     */
    private function visibleEmployees(array $ids): array
    {
        return Employee::whereIn('id', $ids)->pluck('id')->all();
    }

    /** @param  list<array{employee_id: int, date: string, work_schedule_id: int|null}>  $rows */
    private function write(Request $request, array $rows): void
    {
        $now = now();
        foreach (array_chunk($rows, 150) as $chunk) {
            ShiftAssignment::upsert(
                array_map(fn (array $r) => [...$r, 'company_id' => $request->user()->company_id, 'is_rest_day' => $r['work_schedule_id'] === null, 'created_at' => $now, 'updated_at' => $now], $chunk),
                ['employee_id', 'date'],
                ['work_schedule_id', 'is_rest_day', 'updated_at'],
            );
        }
    }

    private function log(string $title, string $description): void
    {
        ActivityLogger::log(module: 'Schedules', action: 'Updated', title: $title, description: $description);
    }
}
