<?php

namespace App\Http\Controllers;

use App\Models\PayrollLine;
use App\Support\PayslipPdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A payslip is a finalized payroll line. Payroll and HR roles open any payslip of their company; anyone else (an employee) only their own.
 * A line of a run that is not finalized is not a payslip yet and answers 404.
 */
class PayslipController extends Controller
{
    /** The signed-in employee's own payslips, newest pay date first. */
    public function index(Request $request): JsonResponse
    {
        $lines = PayrollLine::where('employee_id', $request->user()->employee_id ?? 0)->whereHas('period', fn ($q) => $q->where('status', 'finalized'))->with('period')->get()
            ->sortByDesc(fn (PayrollLine $l) => $l->period->pay_date)->values();

        return response()->json(['data' => $lines->map(fn (PayrollLine $l) => ['line' => $l->toLine(), 'period' => $l->period])]);
    }

    public function show(Request $request, PayrollLine $line): JsonResponse
    {
        $this->authorizeLine($request, $line);

        return response()->json(['data' => $line->toLine()]);
    }

    public function pdf(Request $request, PayrollLine $line): Response
    {
        $this->authorizeLine($request, $line);

        return response(PayslipPdf::render($line), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="'.PayslipPdf::fileName($line).'"']);
    }

    private function authorizeLine(Request $request, PayrollLine $line): void
    {
        $user = $request->user();
        abort_unless($line->period()->value('status') === 'finalized', 404);
        abort_unless($user->can('payslips.view') || $user->can('payroll.view') || ($user->employee_id && $line->employee_id === $user->employee_id), 404);
    }
}
