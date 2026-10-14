<?php

namespace App\Http\Controllers;

use App\Exceptions\ConflictException;
use App\Jobs\SendPayslipEmail;
use App\Models\PayrollPeriod;
use App\Models\PayslipEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Delivery records of the payslip emails of a run, and the send: each email is a queued job, spaced a second apart so a bulk send does not flood the mail server. */
class PayslipEmailController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['kind' => ['required', Rule::in(['payroll'])], 'source_id' => ['required', 'integer']]);

        return response()->json(['data' => PayslipEmail::where('kind', $data['kind'])->where('source_id', $data['source_id'])->get()]);
    }

    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(['payroll'])],
            'source_id' => ['required', 'integer'],
            'targets' => ['required', 'array', 'min:1', 'max:500'],
            'targets.*.employee_id' => ['required', 'integer'],
            'targets.*.subject' => ['required', 'string', 'max:200'],
        ]);
        $period = PayrollPeriod::findOrFail($data['source_id']);
        if ($period->status !== 'finalized') {
            throw new ConflictException('Payslips can be emailed once the payroll run is finalized.');
        }
        $withPayslip = $period->lines()->whereIn('employee_id', array_column($data['targets'], 'employee_id'))->pluck('employee_id')->all();

        $records = [];
        foreach (array_filter($data['targets'], fn ($t) => in_array($t['employee_id'], $withPayslip, true)) as $i => $t) {
            $record = PayslipEmail::firstOrNew(['kind' => 'payroll', 'source_id' => $period->id, 'employee_id' => $t['employee_id']], ['company_id' => $period->company_id]);
            $record->fill(['subject' => $t['subject'], 'status' => 'queued', 'error' => null, 'sent_by' => $request->user()->id])->save();
            SendPayslipEmail::dispatch($record->id)->delay(now()->addSeconds($i));
            $records[] = $record;
        }

        return response()->json(['data' => $records], 202);
    }
}
