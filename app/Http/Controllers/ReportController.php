<?php

namespace App\Http\Controllers;

use App\Models\PayrollLine;
use App\Models\PayrollPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The data the multi-period payroll reports share: every run paid in a date range with its lines, in one request. */
class ReportController extends Controller
{
    /** Rows of lines one request may return; a wider range is asked for in pieces. */
    private const MAX_LINES = 50000;

    public function payrollLines(Request $request): JsonResponse
    {
        $range = $request->validate(['from' => ['nullable', 'date_format:Y-m-d'], 'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from']]);
        // By default, the previous calendar year and this one: enough for year-on-year comparisons.
        $from = $range['from'] ?? now()->subYear()->startOfYear()->toDateString();
        $to = $range['to'] ?? now()->endOfYear()->toDateString();

        $periods = PayrollPeriod::whereDate('pay_date', '>=', $from)->whereDate('pay_date', '<=', $to)->orderBy('start_date')->orderBy('id')->get();
        $lines = PayrollLine::whereIn('payroll_period_id', $periods->pluck('id'))->orderBy('id')->limit(self::MAX_LINES + 1)->get();
        if ($lines->count() > self::MAX_LINES) {
            return response()->json(['message' => 'That range has too many payroll lines. Pick a shorter one.'], 422);
        }

        return response()->json(['data' => ['periods' => $periods, 'lines' => $lines->map->toLine()->all()]]);
    }
}
