<?php

namespace App\Http\Controllers;

use App\Exceptions\ConflictException;
use App\Models\Employee;
use App\Models\WorkLog;
use App\Support\ActivityLogger;
use App\Support\Approval;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Hours and output of hourly and output-based employees, approved before payroll pays them. */
class WorkLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $rows = WorkLog::with('decider:id,name')
            ->when($data['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($data['from'] ?? null, fn ($q, $d) => $q->whereDate('work_date', '>=', $d))
            ->when($data['to'] ?? null, fn ($q, $d) => $q->whereDate('work_date', '<=', $d))
            ->orderByDesc('work_date')->orderByDesc('id')->limit(2000)->get();

        return response()->json(['data' => $rows]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
            'work_date' => ['required', 'date_format:Y-m-d'],
            'quantity' => ['required', 'numeric', 'gt:0', 'max:100000'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $employee = Employee::findOrFail($data['employee_id']);
        $payType = $employee->compensation['payType'] ?? null;
        if (! in_array($payType, ['hourly', 'output_based'], true)) {
            return response()->json(['message' => 'Only hourly and output-based employees file work logs.', 'errors' => ['employee_id' => ['Only hourly and output-based employees file work logs.']]], 422);
        }

        $rate = (float) ($employee->compensation['basicPay'] ?? 0);
        $log = WorkLog::create([
            'company_id' => $employee->company_id, 'employee_id' => $employee->id, 'type' => $payType === 'output_based' ? 'output' : 'hourly',
            'work_date' => $data['work_date'], 'quantity' => $data['quantity'],
            'unit_label' => $payType === 'output_based' ? ($employee->compensation['outputUnit'] ?? 'Per Unit') : 'hrs',
            'rate' => $rate, 'amount' => round((float) $data['quantity'] * $rate, 2),
            'status' => 'pending', 'description' => $data['description'] ?? null, 'requested_by' => $request->user()->id,
        ]);
        ActivityLogger::log(module: 'Work Logs', action: 'Added', title: 'Work log', description: "{$log->quantity} {$log->unit_label} on {$data['work_date']}", subject: $log);

        return response()->json(['data' => $log], 201);
    }

    /** Withdraws a log that is still pending. */
    public function destroy(WorkLog $workLog): JsonResponse
    {
        if ($workLog->status !== 'pending') {
            throw new ConflictException('Only a pending work log can be withdrawn.');
        }
        $workLog->delete();

        return response()->json(['data' => ['deleted' => true]]);
    }

    public function decide(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1', 'max:200'], 'ids.*' => ['integer'], 'decision' => ['required', Rule::in(['approved', 'rejected'])]]);

        $decided = 0;
        foreach (WorkLog::whereIn('id', $data['ids'])->where('status', 'pending')->whereNull('payroll_period_id')->get() as $log) {
            try {
                Approval::decide($log, $data['decision'], $request->user());
            } catch (ConflictException) {
                continue;
            }
            $decided++;
            ActivityLogger::log(module: 'Work Logs', action: ucfirst($data['decision']), title: 'Work log', description: "{$log->quantity} {$log->unit_label} on {$log->work_date->toDateString()}", subject: $log);
        }
        if ($decided === 0) {
            throw new ConflictException('Nothing to decide: those entries were already decided.');
        }

        return response()->json(['data' => ['decided' => $decided]]);
    }
}
