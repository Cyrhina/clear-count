<?php

namespace App\Http\Controllers;

use App\Exceptions\ConflictException;
use App\Jobs\SendPayslipEmail;
use App\Models\BonusIncentive;
use App\Models\PayrollPeriod;
use App\Models\PayslipEmail;
use App\Models\ThirteenthMonthRun;
use App\Payroll\BonusPayslip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Delivery records of the payslip emails of a payroll run, a 13th month batch or a separate bonus payslip, and the send: each email is a queued job, spaced a second
 * apart so a bulk send does not flood the mail server. Sending needs `payslips.generate` (payroll), `thirteenth_month.manage` (13th month) or `bonuses.manage` (bonus).
 */
class PayslipEmailController extends Controller
{
    private const KINDS = ['payroll', 'thirteenth_month', 'bonus'];

    private const SEND_PERMISSION = ['payroll' => 'payslips.generate', 'thirteenth_month' => 'thirteenth_month.manage', 'bonus' => 'bonuses.manage'];

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['kind' => ['required', Rule::in(self::KINDS)], 'source_id' => ['required', 'integer']]);

        return response()->json(['data' => PayslipEmail::where('kind', $data['kind'])->where('source_id', $data['source_id'])->get()]);
    }

    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(self::KINDS)],
            'source_id' => ['required', 'integer'],
            'targets' => ['required', 'array', 'min:1', 'max:500'],
            'targets.*.employee_id' => ['required', 'integer'],
            'targets.*.subject' => ['required', 'string', 'max:200'],
        ]);
        abort_unless($request->user()->can(self::SEND_PERMISSION[$data['kind']]), 403);

        if ($data['kind'] === 'bonus') {
            $source = BonusIncentive::findOrFail($data['source_id']);
            if (! BonusPayslip::isSeparate($source)) {
                throw new ConflictException('Only an approved bonus set to a separate payslip can be emailed.');
            }
            $withPayslip = array_map('intval', array_column(BonusPayslip::rows($source), 'employeeId'));
        } else {
            $source = $data['kind'] === 'thirteenth_month' ? ThirteenthMonthRun::findOrFail($data['source_id']) : PayrollPeriod::findOrFail($data['source_id']);
            if ($source->status !== 'finalized') {
                throw new ConflictException($data['kind'] === 'thirteenth_month' ? 'Payslips can be emailed once the 13th month batch is finalized.' : 'Payslips can be emailed once the payroll run is finalized.');
            }
            $withPayslip = $source->lines()->whereIn('employee_id', array_column($data['targets'], 'employee_id'))->pluck('employee_id')->all();
        }

        $records = [];
        foreach (array_filter($data['targets'], fn ($t) => in_array($t['employee_id'], $withPayslip, true)) as $i => $t) {
            $record = PayslipEmail::firstOrNew(['kind' => $data['kind'], 'source_id' => $source->id, 'employee_id' => $t['employee_id']], ['company_id' => $source->company_id]);
            $record->fill(['subject' => $t['subject'], 'status' => 'queued', 'error' => null, 'sent_by' => $request->user()->id])->save();
            SendPayslipEmail::dispatch($record->id)->delay(now()->addSeconds($i));
            $records[] = $record;
        }

        return response()->json(['data' => $records], 202);
    }
}
