<?php

namespace App\Http\Controllers;

use App\Models\ThirteenthMonthLine;
use App\Models\ThirteenthMonthRun;
use App\Payroll\ThirteenthMonthRuns;
use App\Support\ActivityLogger;
use App\Support\PayslipPdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

/** 13th month pay batches: who they cover, generating one, finalizing it, and each employee's payslip PDF. Opened only once finalized for the PDF. */
class ThirteenthMonthController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => ThirteenthMonthRun::orderByDesc('year')->orderByDesc('id')->get()]);
    }

    public function lines(ThirteenthMonthRun $run): JsonResponse
    {
        return response()->json(['data' => $run->lines()->orderBy('id')->get()->map->toLine()]);
    }

    /** Who a batch with these settings would cover, as employee ids. */
    public function preview(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $p = ThirteenthMonthRuns::preview($request->user()->company_id, $data['year'], $data['selection']);
        $ids = fn (array $employees) => array_map('intval', array_column($employees, 'id'));

        return response()->json(['data' => ['coverage' => $p['coverage'], 'eligible_ids' => $ids($p['eligible']), 'included_ids' => $ids($p['included']), 'skipped_ids' => $ids($p['skipped'])]]);
    }

    public function generate(Request $request): JsonResponse
    {
        $data = $this->validated($request, withBatch: true);
        $result = ThirteenthMonthRuns::generate($request->user()->company_id, $data);
        ActivityLogger::log(module: '13th Month Pay', action: 'Generated', title: '13th month batch', description: "{$data['year']} · {$data['payout_period_label']}", subject: $result['run']);

        return response()->json(['data' => $result['run'], 'meta' => ['skipped_already_paid' => $result['skipped']]], 201);
    }

    public function finalize(Request $request, ThirteenthMonthRun $run): JsonResponse
    {
        $run = ThirteenthMonthRuns::finalize($run, $request->user());
        ActivityLogger::log(module: '13th Month Pay', action: 'Finalized', title: '13th month batch', description: "{$run->year} · {$run->payout_period_label}", subject: $run);

        return response()->json(['data' => $run]);
    }

    public function pdf(Request $request, ThirteenthMonthLine $line): Response
    {
        $user = $request->user();
        abort_unless($line->run()->value('status') === 'finalized', 404);
        abort_unless($user->can('thirteenth_month.view') || ($user->employee_id && $line->employee_id === $user->employee_id), 404);

        return response(PayslipPdf::render($line), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="'.PayslipPdf::fileName($line).'"']);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, bool $withBatch = false): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'selection' => ['required', 'array'],
            'selection.mode' => ['required', Rule::in(['all', 'employees', 'payroll_group', 'department', 'separated'])],
            'selection.employee_ids' => ['nullable', 'array', 'max:2000'],
            'selection.employee_ids.*' => ['integer', Rule::exists('employees', 'id')->where('company_id', $companyId)],
            'selection.payroll_group_id' => ['nullable', 'integer', Rule::exists('payroll_groups', 'id')->where('company_id', $companyId)],
            'selection.department' => ['nullable', 'string', 'max:120'],
            ...($withBatch ? ['generation_date' => ['required', 'date_format:Y-m-d'], 'payout_period_label' => ['required', 'string', 'max:120']] : []),
        ]);
    }
}
