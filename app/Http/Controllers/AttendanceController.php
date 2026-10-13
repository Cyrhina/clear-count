<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\WorkSchedule;
use App\Support\ActivityLogger;
use App\Support\AttendanceStatusResolver;
use App\Support\ImportKit;
use App\Support\ScheduleResolver;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Daily attendance: read by day or range, log by hand, and import punches the browser parsed from a biometrics file. */
class AttendanceController extends Controller
{
    private const MAX_RANGE_DAYS = 366;

    private const TIME = ['nullable', 'date_format:H:i'];

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'from' => ['nullable', 'required_with:to', 'date_format:Y-m-d'],
            'to' => ['nullable', 'required_with:from', 'date_format:Y-m-d', 'after_or_equal:from'],
            'employee_id' => ['nullable', 'integer'],
        ]);
        $from = $data['date'] ?? $data['from'] ?? null;
        $to = $data['date'] ?? $data['to'] ?? null;
        if ($from === null) {
            return response()->json(['message' => 'Give a date, or a from and to date.'], 422);
        }
        if (CarbonImmutable::parse($from)->diffInDays($to) > self::MAX_RANGE_DAYS) {
            return response()->json(['message' => 'Pick a range of a year or less.'], 422);
        }

        $records = AttendanceRecord::whereBetween('date', [$from, $to])
            ->when($data['employee_id'] ?? null, fn ($q, $id) => $q->where('employee_id', $id))
            ->orderBy('date')->get();

        return response()->json(['data' => $records]);
    }

    /** Dates an employee was late over the last two years: feeds the "Late #n" count, which the screen works out per policy. */
    public function lateDates(): JsonResponse
    {
        $rows = AttendanceRecord::where('status', 'late')->where('date', '>=', now()->subYears(2)->toDateString())->orderBy('date')->get(['employee_id', 'date']);

        return response()->json(['data' => $rows]);
    }

    /** One record per employee per working day in the range. Rest days, holidays and unscheduled days are skipped. */
    public function log(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'work_type' => ['required', Rule::in(['onsite', 'wfh', 'field'])],
            'time_in' => ['required', 'date_format:H:i'],
            'time_out' => self::TIME,
            'break_out' => self::TIME,
            'break_in' => self::TIME,
            'reason' => ['required', 'string', 'max:255'],
            'overwrite' => ['sometimes', 'boolean'],
        ]);
        $from = CarbonImmutable::parse($data['date_from']);
        $days = $from->diffInDays($data['date_to']) + 1;
        if ($days > 93 || $days * count($data['employee_ids']) > 5000) {
            return response()->json(['message' => 'That is too many days at once. Pick fewer employees or a shorter range.'], 422);
        }

        $result = ['created' => 0, 'updated' => 0, 'skipped' => 0];
        foreach (Employee::with(['workSchedule', 'payrollGroup.workSchedule'])->whereIn('id', $data['employee_ids'])->get() as $employee) {
            for ($i = 0; $i < $days; $i++) {
                $date = $from->addDays($i)->toDateString();
                $resolved = ScheduleResolver::for($employee, $date);
                if (! $resolved['schedule'] || $resolved['is_rest_day'] || AttendanceStatusResolver::isHoliday($employee, $date)) {
                    $result['skipped']++;

                    continue;
                }
                $existing = AttendanceRecord::where('employee_id', $employee->id)->whereDate('date', $date)->first();
                if ($existing && ! $existing->auto_recorded && ! ($data['overwrite'] ?? false)) {
                    $result['skipped']++;

                    continue;
                }

                $this->store($employee, $date, [
                    ...AttendanceStatusResolver::forEmployeeDay($employee, $date, $data['time_in'], $data['time_out'] ?? null, $resolved['schedule']),
                    'work_schedule_id' => $resolved['schedule']->id, 'time_in' => $data['time_in'], 'time_out' => $data['time_out'] ?? null,
                    'break_out' => $data['break_out'] ?? null, 'break_in' => $data['break_in'] ?? null,
                    'work_type' => $data['work_type'], 'source' => 'manual', 'remarks' => $data['reason'],
                ]);
                $result[$existing ? 'updated' : 'created']++;
            }
        }

        ActivityLogger::log(
            module: 'Attendance', action: 'Added', title: 'Logged attendance',
            description: 'Logged '.strtoupper($data['work_type']).' attendance for '.count($data['employee_ids']).' employee(s) ('.$data['date_from'].($data['date_to'] !== $data['date_from'] ? ' to '.$data['date_to'] : '').'): '.$data['reason'],
        );

        return response()->json(['data' => $result]);
    }

    /** Punches from a biometrics file. `dry_run` previews every row; otherwise the valid rows replace the day's record. */
    public function biometrics(Request $request): JsonResponse
    {
        $request->validate(['rows' => ['required', 'array', 'min:1', 'max:'.ImportKit::MAX_ROWS], 'dry_run' => ['sometimes', 'boolean']]);
        $schedules = WorkSchedule::pluck('id')->all();

        $report = ImportKit::run(
            $request->input('rows'),
            fn () => [
                'employee_id' => ['required', 'integer'],
                'date' => ['required', 'date_format:Y-m-d'],
                'time_in' => ['required', 'date_format:H:i'],
                'time_out' => self::TIME,
                'break_out' => self::TIME,
                'break_in' => self::TIME,
                'work_schedule_id' => ['nullable', 'integer', Rule::in($schedules)],
                // A schedule-based import has already settled the status on review.
                'status' => ['nullable', Rule::in(['present', 'late', 'undertime', 'absent'])],
            ],
            fn (array $row) => Employee::whereKey($row['employee_id'])->exists() ? [] : ['Employee not found.'],
            function (array $row): void {
                $employee = Employee::findOrFail($row['employee_id']);
                $schedule = isset($row['work_schedule_id']) ? WorkSchedule::find($row['work_schedule_id']) : null;
                $this->store($employee, $row['date'], [
                    ...AttendanceStatusResolver::forEmployeeDay($employee, $row['date'], $row['time_in'], $row['time_out'] ?? null, $schedule),
                    ...(isset($row['status']) ? ['status' => $row['status']] : []),
                    'work_schedule_id' => $schedule?->id ?? ScheduleResolver::for($employee, $row['date'])['schedule']?->id,
                    'time_in' => $row['time_in'], 'time_out' => $row['time_out'] ?? null,
                    'break_out' => $row['break_out'] ?? null, 'break_in' => $row['break_in'] ?? null,
                    'work_type' => 'onsite', 'source' => 'biometric', 'remarks' => null,
                ]);
            },
            (bool) $request->boolean('dry_run'),
        );

        if (! $request->boolean('dry_run') && $report['created'] > 0) {
            ActivityLogger::log(module: 'Attendance', action: 'Imported', title: 'Biometrics import', description: "{$report['created']} punch".($report['created'] === 1 ? '' : 'es').' imported');
        }

        return response()->json(['data' => $report]);
    }

    /** Creates or replaces the employee's record for the date; real punches take over a WFH auto-recorded day. */
    private function store(Employee $employee, string $date, array $fields): AttendanceRecord
    {
        return AttendanceRecord::updateOrCreate(
            ['employee_id' => $employee->id, 'date' => $date],
            [...$fields, 'company_id' => $employee->company_id, 'auto_recorded' => false, 'wfh_id' => null],
        );
    }
}
