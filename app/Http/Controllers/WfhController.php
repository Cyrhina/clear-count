<?php

namespace App\Http\Controllers;

use App\Exceptions\ConflictException;
use App\Models\AttendanceRecord;
use App\Models\Company;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\WfhArrangement;
use App\Support\ActivityLogger;
use App\Support\Approval;
use App\Support\AttendanceStatusResolver;
use App\Support\ScheduleResolver;
use App\Support\WfhPlanner;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Work-from-home arrangements. People who can adjust attendance (HR, admins, managers for their team) save them as approved;
 * an employee asking for themselves saves a pending request for them to decide. Approved ones fill attendance (WfhPlanner).
 */
class WfhController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => WfhArrangement::with(['requester:id,name', 'decider:id,name'])->orderByDesc('id')->get(),
            'meta' => ['monthly_limit' => $this->limit($request)],
        ]);
    }

    /** Who a WFH input would change, and how many working days, before anything is saved. */
    public function preview(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $limit = $this->limit($request);
        $from = CarbonImmutable::parse($data['date_from']);
        $to = CarbonImmutable::parse($data['date_to'] ?? $from->addDays(WfhPlanner::PREVIEW_DAYS));
        if ($from->diffInDays($to) > 400) {
            return response()->json(['message' => 'Pick a range of about a year or less.'], 422);
        }
        $probe = new WfhArrangement(['date_from' => $from, 'date_to' => $data['date_to'] ?? null, 'days_of_week' => $data['days_of_week'] ?? []]);
        $today = CarbonImmutable::today()->toDateString();

        $rows = [];
        foreach (Employee::with(['workSchedule', 'payrollGroup.workSchedule'])->whereIn('id', $data['employee_ids'])->get() as $employee) {
            $skipped = ['leave' => 0, 'holiday' => 0, 'rest' => 0, 'punches' => 0];
            $workDays = 0;
            $perMonth = [];
            $punched = AttendanceRecord::where('employee_id', $employee->id)->where('auto_recorded', false)->whereBetween('date', [$from->toDateString(), min($to->toDateString(), $today)])
                ->get()->map(fn ($r) => $r->date->toDateString())->flip();

            for ($d = $from; $d <= $to; $d = $d->addDay()) {
                $date = $d->toDateString();
                if (! WfhPlanner::covers($probe, $date)) {
                    continue;
                }
                if (ScheduleResolver::for($employee, $date)['is_rest_day']) {
                    $skipped['rest']++;
                } elseif (LeaveRequest::approvedOn($employee->id, $date)) {
                    $skipped['leave']++;
                } elseif (AttendanceStatusResolver::isHoliday($employee, $date)) {
                    $skipped['holiday']++;
                } elseif ($punched->has($date)) {
                    $skipped['punches']++;
                } else {
                    $workDays++;
                    $perMonth[$d->format('Y-m')] = ($perMonth[$d->format('Y-m')] ?? 0) + 1;
                }
            }

            $approved = WfhArrangement::where('employee_id', $employee->id)->where('status', 'approved')->get();
            $overLimit = [];
            foreach ($limit ? $perMonth : [] as $month => $added) {
                $start = CarbonImmutable::parse("{$month}-01");
                $existing = 0;
                for ($d = $start; $d <= $start->endOfMonth(); $d = $d->addDay()) {
                    $existing += WfhPlanner::ownerFor($approved, $d->toDateString()) ? 1 : 0;
                }
                if ($existing + $added > $limit) {
                    $overLimit[] = $month;
                }
            }

            $rows[] = [
                'employee_id' => $employee->id, 'work_days' => $workDays, 'skipped' => $skipped, 'over_limit' => $overLimit,
                'overlap_ids' => $this->overlapping($employee->id, $data['kind'], $probe)->pluck('id')->all(),
            ];
        }

        return response()->json(['data' => $rows]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([...$this->rules(), 'replace_overlaps' => ['sometimes', 'boolean']]);
        $canApprove = $request->user()->can('attendance.adjust');
        // Someone who cannot adjust attendance can only ask for themselves.
        $ids = $canApprove ? $data['employee_ids'] : array_filter([$request->user()->employee_id]);
        $batch = (string) Str::uuid();
        $probe = new WfhArrangement(['date_from' => $data['date_from'], 'date_to' => $data['date_to'] ?? null]);

        $created = [];
        $skipped = [];
        foreach (Employee::whereIn('id', $ids)->get() as $employee) {
            $overlapping = $this->overlapping($employee->id, $data['kind'], $probe);
            if ($overlapping->isNotEmpty() && ! ($data['replace_overlaps'] ?? false)) {
                $skipped[] = ['employee_id' => $employee->id, 'reason' => 'Already has a WFH arrangement in these dates'];

                continue;
            }
            if ($overlapping->isNotEmpty()) {
                $this->cancelAll($overlapping->pluck('id')->all());
            }
            $created[] = WfhArrangement::create([
                'company_id' => $employee->company_id, 'employee_id' => $employee->id, 'kind' => $data['kind'],
                'date_from' => $data['date_from'], 'date_to' => $data['date_to'] ?? null, 'days_of_week' => $data['days_of_week'] ?? [],
                'times' => $data['times'], 'custom' => $data['times'] === 'custom' ? $data['custom'] : null, 'reason' => trim($data['reason']),
                'status' => $canApprove ? 'approved' : 'pending', 'requested_by' => $request->user()->id,
                'decided_by' => $canApprove ? $request->user()->id : null, 'decided_at' => $canApprove ? now() : null, 'batch_id' => $batch,
            ]);
        }

        if ($canApprove) {
            foreach ($created as $a) {
                WfhPlanner::materialize($a);
            }
        }
        if ($created) {
            ActivityLogger::log(
                module: 'Attendance', action: $canApprove ? 'Added' : 'Requested', title: 'Work from home',
                description: ($canApprove ? 'Applied ' : 'Requested ').$data['kind'].' WFH for '.count($created).' employee(s) ('.$data['date_from'].($data['date_to'] ?? null ? ' to '.$data['date_to'] : ' on').'): '.trim($data['reason']),
            );
        }

        return response()->json(['data' => ['created' => count($created), 'skipped' => $skipped]], 201);
    }

    /** Cancels arrangements and removes the days they filled in. */
    public function cancel(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array', 'min:1', 'max:500'], 'ids.*' => ['integer']])['ids'];
        $mine = WfhArrangement::whereIn('id', $ids)->whereIn('status', ['pending', 'approved'])->pluck('id')->all();
        $this->cancelAll($mine);
        if ($mine) {
            ActivityLogger::log(module: 'Attendance', action: 'Cancelled', title: 'Work from home', description: 'Cancelled '.count($mine).' WFH arrangement(s)');
        }

        return response()->json(['data' => ['changed' => count($mine)]]);
    }

    /** Stops approved arrangements after `last_day`; days they filled in after it are removed. */
    public function end(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1', 'max:500'], 'ids.*' => ['integer'], 'last_day' => ['required', 'date_format:Y-m-d']]);
        $mine = WfhArrangement::whereIn('id', $data['ids'])->where('status', 'approved')->get()
            ->filter(fn (WfhArrangement $a) => ! $a->date_to || $a->date_to->toDateString() > $data['last_day']);
        foreach ($mine as $a) {
            $a->update(['date_to' => max($data['last_day'], $a->date_from->toDateString())]);
        }
        WfhPlanner::removeAutoDays($mine->pluck('id')->all(), $data['last_day']);
        if ($mine->isNotEmpty()) {
            ActivityLogger::log(module: 'Attendance', action: 'Updated', title: 'Work from home', description: "Ended {$mine->count()} WFH arrangement(s) after {$data['last_day']}");
        }

        return response()->json(['data' => ['changed' => $mine->count()]]);
    }

    public function decide(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1', 'max:200'], 'ids.*' => ['integer'], 'decision' => ['required', Rule::in(['approved', 'rejected'])]]);

        $decided = 0;
        foreach (WfhArrangement::whereIn('id', $data['ids'])->where('status', 'pending')->get() as $a) {
            try {
                Approval::decide($a, $data['decision'], $request->user(), fn (WfhArrangement $done) => WfhPlanner::materialize($done));
            } catch (ConflictException) {
                continue;
            }
            $decided++;
        }
        if ($decided === 0) {
            throw new ConflictException('Nothing to decide: those requests were already decided.');
        }
        ActivityLogger::log(module: 'Attendance', action: ucfirst(rtrim($data['decision'], 'd')).'d', title: 'Work from home', description: "{$data['decision']} {$decided} WFH request(s)");

        return response()->json(['data' => ['decided' => $decided]]);
    }

    public function setLimit(Request $request): JsonResponse
    {
        $limit = $request->validate(['monthly_limit' => ['required', 'integer', 'min:0', 'max:31']])['monthly_limit'];
        Company::whereKey($request->user()->company_id)->update(['wfh_monthly_limit' => $limit]);
        ActivityLogger::log(module: 'Attendance', action: 'Updated', title: 'WFH monthly limit', description: $limit ? "Set to {$limit} day(s) per employee" : 'Limit removed');

        return response()->json(['data' => ['monthly_limit' => $limit]]);
    }

    /** @return array<string, mixed> */
    private function rules(): array
    {
        return [
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'kind' => ['required', Rule::in(['standing', 'temporary'])],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => [Rule::requiredIf(fn () => request('kind') === 'temporary'), 'nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'days_of_week' => ['sometimes', 'array', 'max:7'],
            'days_of_week.*' => ['integer', 'between:0,6', 'distinct'],
            'times' => ['required', Rule::in(['default', 'custom', 'self_log'])],
            'custom' => ['required_if:times,custom', 'nullable', 'array'],
            'custom.timeIn' => ['required_if:times,custom', 'nullable', 'date_format:H:i'],
            'custom.timeOut' => ['required_if:times,custom', 'nullable', 'date_format:H:i'],
            'custom.breakOut' => ['nullable', 'date_format:H:i'],
            'custom.breakIn' => ['nullable', 'date_format:H:i', 'after:custom.breakOut'],
            'reason' => ['required', 'string', 'max:255'],
        ];
    }

    /** Pending or approved arrangements of the same kind that overlap the dates. */
    private function overlapping(int $employeeId, string $kind, WfhArrangement $probe)
    {
        $to = $probe->date_to?->toDateString() ?? '9999-12-31';

        return WfhArrangement::where('employee_id', $employeeId)->where('kind', $kind)->whereIn('status', ['pending', 'approved'])
            ->where('date_from', '<=', $to)
            ->where(fn ($q) => $q->whereNull('date_to')->orWhere('date_to', '>=', $probe->date_from->toDateString()))
            ->get();
    }

    private function limit(Request $request): int
    {
        return (int) Company::whereKey($request->user()->company_id)->value('wfh_monthly_limit');
    }

    private function cancelAll(array $ids): void
    {
        WfhArrangement::whereIn('id', $ids)->update(['status' => 'cancelled']);
        WfhPlanner::removeAutoDays($ids);
    }
}
