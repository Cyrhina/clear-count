<?php

namespace App\Http\Controllers;

use App\Models\BonusIncentive;
use App\Models\Employee;
use App\Payroll\BonusPayslip;
use App\Support\PayslipPdf;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/** The separate payslips of an approved bonus set to "Generate Separate Payslip": one per employee it covers, computed when asked. */
class BonusPayslipController extends Controller
{
    public function index(BonusIncentive $bonus): JsonResponse
    {
        return response()->json(['data' => BonusPayslip::rows($bonus)]);
    }

    public function pdf(BonusIncentive $bonus, Employee $employee): Response
    {
        $row = collect(BonusPayslip::rows($bonus))->firstWhere('employeeId', (string) $employee->id);
        abort_unless($row, 404);

        return response(PayslipPdf::renderBonus($bonus, $employee, $row), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="'.PayslipPdf::bonusFileName($bonus, $employee).'"']);
    }
}
