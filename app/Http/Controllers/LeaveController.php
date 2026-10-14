<?php

namespace App\Http\Controllers;

use App\Exceptions\ConflictException;
use App\Models\Employee;
use App\Models\LeaveLedgerEntry;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Support\ActivityLogger;
use App\Support\Approval;
use App\Support\LeaveDefaults;
use App\Support\LeaveLedger;
use App\Support\LeavePlanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Leave types, requests (file, preview, approve, cancel) and credit balances. Credits live in the ledger (LeaveLedger). */
class LeaveController extends Controller
{
    // ---- Types ---------------------------------------------------------------------------------------------------

    public function types(Request $request): JsonResponse
    {
        LeaveDefaults::ensure($request->user()->company_id);

        return response()->json(['data' => LeaveType::orderBy('name')->get()]);
    }

    public function storeType(Request $request): JsonResponse
    {
        $type = LeaveType::create([...$this->typeRules($request), 'company_id' => $request->user()->company_id]);
        ActivityLogger::log(module: 'Leave', action: 'Added', title: 'Leave type', description: $type->name, subject: $type);

        return response()->json(['data' => $type], 201);
    }

    public function updateType(Request $request, LeaveType $leaveType): JsonResponse
    {
        $leaveType->update($this->typeRules($request, $leaveType));
        ActivityLogger::log(module: 'Leave', action: 'Updated', title: 'Leave type', description: $leaveType->name, subject: $leaveType);

        return response()->json(['data' => $leaveType]);
    }

    /** @return array<string, mixed> */
    private function typeRules(Request $request, ?LeaveType $current = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('leave_types', 'name')->where('company_id', $request->user()->company_id)->ignore($current?->id)],
            'description' => ['nullable', 'string', 'max:255'],
            'is_paid' => ['required', 'boolean'],
            'default_credits' => ['required', 'numeric', 'min:0', 'max:365'],
            'max_carry_over' => ['required', 'numeric', 'min:0', 'max:365'],
            'tier_credits' => ['nullable', 'array'],
            'tier_credits.executive' => ['nullable', 'numeric', 'min:0', 'max:365'],
            'tier_credits.managerial' => ['nullable', 'numeric', 'min:0', 'max:365'],
            'tier_credits.rank_and_file' => ['nullable', 'numeric', 'min:0', 'max:365'],
        ]);
    }

    // ---- Requests ------------------------------------------------------------------------------------------------

    public function requests(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected', 'cancelled'])],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
            'employee_id' => ['nullable', 'integer'],
        ]);

        $rows = LeaveRequest::with(['leaveType:id,name,is_paid', 'requester:id,name', 'decider:id,name'])
            ->when($data['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($data['employee_id'] ?? null, fn ($q, $id) => $q->where('employee_id', $id))
            // Overlapping a range (for the attendance and roster screens).
            ->when($data['from'] ?? null, fn ($q, $from) => $q->whereDate('date_to', '>=', $from))
            ->when($data['to'] ?? null, fn ($q, $to) => $q->whereDate('date_from', '<=', $to))
            ->latest('id')->limit(1000)->get();

        return response()->json(['data' => $rows]);
    }

    /** What a request would use and whether it can be filed, before filing. A problem comes back as `error`, not as a failure. */
    public function preview(Request $request): JsonResponse
    {
        $data = $this->filingRules($request);
        [$employee, $type] = $this->resolve($data);

        return response()->json(['data' => LeavePlanner::plan($employee, $type, $data['date_from'], $data['date_to'], $data['day_portion'] ?? 'full')]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->filingRules($request);
        [$employee, $type] = $this->resolve($data);
        $portion = $data['day_portion'] ?? 'full';

        $plan = LeavePlanner::plan($employee, $type, $data['date_from'], $data['date_to'], $portion);
        if (isset($plan['error'])) {
            return response()->json(['message' => $plan['error']], 422);
        }

        $leave = LeaveRequest::create([
            'company_id' => $employee->company_id, 'employee_id' => $employee->id, 'leave_type_id' => $type->id,
            'date_from' => $data['date_from'], 'date_to' => $portion === 'full' ? $data['date_to'] : $data['date_from'], 'day_portion' => $portion,
            'days' => $plan['days'], 'reason' => $data['reason'] ?? null, 'requested_by' => $request->user()->id,
        ]);
        ActivityLogger::log(module: 'Leave', action: 'Added', title: 'Leave request', description: "{$type->name}: {$plan['days']} day(s) from {$data['date_from']}", subject: $leave);

        return response()->json(['data' => $leave], 201);
    }

    /** Approve or reject several at once. An approval takes the days from the balance in the same transaction. */
    public function decide(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1', 'max:200'], 'ids.*' => ['integer'], 'decision' => ['required', Rule::in(['approved', 'rejected'])]]);

        $decided = 0;
        $skipped = [];
        foreach (LeaveRequest::with('leaveType')->whereIn('id', $data['ids'])->where('status', 'pending')->get() as $leave) {
            try {
                Approval::decide($leave, $data['decision'], $request->user(), function (LeaveRequest $done) use ($request): void {
                    $employee = Employee::findOrFail($done->employee_id);
                    $type = $done->leaveType;
                    if (LeaveLedger::isLimited($employee->id, $type) && LeaveLedger::balance($employee->id, $type->id) < $done->days) {
                        throw new ConflictException("Not enough {$type->name} credits to approve this request.");
                    }
                    LeaveLedger::record($employee, $type, 'used', -$done->days, 'Approved leave', $request->user(), $done, $done->date_from->toDateString());
                });
            } catch (ConflictException $e) {
                $skipped[] = ['id' => $leave->id, 'reason' => $e->getMessage()];

                continue;
            }
            $decided++;
            ActivityLogger::log(module: 'Leave', action: ucfirst(rtrim($data['decision'], 'd')).'d', title: 'Leave request', description: "{$leave->leaveType->name} {$data['decision']} ({$leave->days} day(s))", subject: $leave);
        }
        if ($decided === 0) {
            throw new ConflictException($skipped[0]['reason'] ?? 'Nothing to decide: those requests were already decided.');
        }

        return response()->json(['data' => ['decided' => $decided, 'skipped' => $skipped]]);
    }

    /** Cancels a pending or approved request. An approved one gives its days back with a reversal entry. */
    public function cancel(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $this->ownOrManaged($request, $leaveRequest->employee_id);
        if (! in_array($leaveRequest->status, ['pending', 'approved'], true)) {
            throw new ConflictException('This request can no longer be cancelled.');
        }

        $wasApproved = $leaveRequest->status === 'approved';
        $leaveRequest->update(['status' => 'cancelled']);
        if ($wasApproved) {
            LeaveLedger::record(Employee::findOrFail($leaveRequest->employee_id), $leaveRequest->leaveType, 'reversal', $leaveRequest->days, 'Approved leave cancelled', $request->user(), $leaveRequest);
        }
        ActivityLogger::log(module: 'Leave', action: 'Cancelled', title: 'Leave request', description: "{$leaveRequest->leaveType->name} ({$leaveRequest->days} day(s))", subject: $leaveRequest);

        return response()->json(['data' => $leaveRequest]);
    }

    // ---- Balances ------------------------------------------------------------------------------------------------

    /** Per employee and leave type with credits: balance, pending, used this year, and what is available to file. */
    public function balances(Request $request): JsonResponse
    {
        $employeeId = $request->validate(['employee_id' => ['nullable', 'integer']])['employee_id'] ?? null;
        $ids = Employee::when($employeeId, fn ($q) => $q->whereKey($employeeId))->pluck('id')->all();
        $year = now()->year;

        $used = LeaveLedgerEntry::whereIn('employee_id', $ids)->whereIn('entry_type', ['used', 'reversal'])->where('leave_year', $year)
            ->selectRaw('employee_id, leave_type_id, sum(days) as total')->groupBy('employee_id', 'leave_type_id')->get()
            ->mapWithKeys(fn ($r) => [$r->employee_id.'|'.$r->leave_type_id => -round((float) $r->total, 1)]);
        $pending = LeaveRequest::whereIn('employee_id', $ids)->where('status', 'pending')->selectRaw('employee_id, leave_type_id, sum(days) as total')->groupBy('employee_id', 'leave_type_id')->get()
            ->mapWithKeys(fn ($r) => [$r->employee_id.'|'.$r->leave_type_id => round((float) $r->total, 1)]);
        $types = LeaveType::get()->keyBy('id');

        $rows = [];
        foreach (LeaveLedger::balancesFor($ids) as $empId => $byType) {
            foreach ($byType as $typeId => $balance) {
                $key = $empId.'|'.$typeId;
                $held = $pending[$key] ?? 0.0;
                $usedYear = $used[$key] ?? 0.0;
                $rows[] = [
                    'employee_id' => $empId, 'leave_type_id' => $typeId, 'balance' => $balance, 'used' => $usedYear, 'pending' => $held,
                    // Credits the year started with: what is left plus what was used. Unpaid types are not capped.
                    'credits' => round($balance + $usedYear, 1),
                    'available' => ($types[$typeId]->is_paid ?? false) ? max(0, round($balance - $held, 1)) : null,
                ];
            }
        }

        return response()->json(['data' => $rows]);
    }

    /** HR adds to, or sets, the credits of one leave type for many employees. */
    public function grantCredits(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'leave_type_id' => ['required', 'integer', Rule::exists('leave_types', 'id')->where('company_id', $request->user()->company_id)],
            'days' => ['required', 'numeric', 'min:0', 'max:365'],
            'mode' => ['required', Rule::in(['add', 'set'])],
        ]);
        $type = LeaveType::findOrFail($data['leave_type_id']);

        $updated = 0;
        foreach (Employee::whereIn('id', $data['employee_ids'])->get() as $employee) {
            if ($data['mode'] === 'add') {
                LeaveLedger::record($employee, $type, 'adjustment', (float) $data['days'], "Added {$data['days']} day(s)", $request->user());
            } else {
                LeaveLedger::setBalance($employee, $type, (float) $data['days'], $request->user(), "Set to {$data['days']} day(s)");
            }
            $updated++;
        }
        ActivityLogger::log(module: 'Leave', action: 'Updated', title: 'Leave credits', description: "{$type->name} credits ".($data['mode'] === 'add' ? 'increased by' : 'set to')." {$data['days']} for {$updated} employee(s)");

        return response()->json(['data' => ['updated' => $updated]]);
    }

    // ---- Helpers -------------------------------------------------------------------------------------------------

    /** @return array<string, mixed> */
    private function filingRules(Request $request): array
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
            'leave_type_id' => ['required', 'integer', Rule::exists('leave_types', 'id')->where('company_id', $request->user()->company_id)],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d'],
            'day_portion' => ['sometimes', Rule::in(['full', 'half_am', 'half_pm'])],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);
        $this->ownOrManaged($request, (int) $data['employee_id']);

        return $data;
    }

    /** Self-service (`ess.view`) files and cancels only for themselves; anyone else needs `leave.request`. */
    private function ownOrManaged(Request $request, int $employeeId): void
    {
        abort_unless($request->user()->can('leave.request') || $request->user()->employee_id === $employeeId, 403);
    }

    /** @return array{0: Employee, 1: LeaveType} */
    private function resolve(array $data): array
    {
        return [Employee::findOrFail($data['employee_id']), LeaveType::findOrFail($data['leave_type_id'])];
    }
}
