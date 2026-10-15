@php
    $peso = fn ($n) => '₱'.number_format((float) $n, 2);
    $types = ['fixed_amount' => 'Fixed Amount', 'percentage' => 'Percentage of monthly basic pay', 'performance_based' => 'Performance-Based', 'output_based' => 'Output-Based'];
@endphp
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1f2d3a; }
    h1 { font-size: 18px; margin: 0; color: #0a4f3f; }
    h2 { font-size: 11px; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: .5px; color: #4a6072; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 5px 6px; border-bottom: 1px solid #e3e9ee; text-align: left; }
    td.r, th.r { text-align: right; }
    .muted { color: #6b7d8c; }
    .net { margin-top: 14px; padding: 10px; background: #eaf6f1; font-size: 14px; font-weight: bold; }
</style>
</head>
<body>
<h1>{{ $company->trade_name ?: $company->name }}</h1>
<div class="muted">{{ $company->addressLine() }}</div>
<p><strong>Bonus / Incentive payslip</strong> &middot; separate from the regular payroll</p>

<h2>Employee</h2>
<table>
    <tr><td>Name</td><td>{{ $employee->name }}</td><td>Employee ID</td><td>{{ $employee->employee_number }}</td></tr>
    <tr><td>Department</td><td>{{ $employee->department }}</td><td>Position</td><td>{{ $employee->employment['position'] ?? '' }}</td></tr>
</table>

<h2>Payout</h2>
<table>
    <tr><td>Payroll period</td><td>{{ $bonus->period_label }}</td><td>Bonus type</td><td>{{ $types[$bonus->bonus_type] ?? $bonus->bonus_type }}</td></tr>
    <tr><td>Tax treatment</td><td colspan="3">{{ $bonus->taxable ? 'Taxable' : 'Non-taxable' }}</td></tr>
</table>

<h2>Amount</h2>
<table>
    <tr>
        <td>{{ $bonus->name }}
            @if ($bonus->bonus_type === 'percentage')
                <span class="muted">{{ $bonus->amount }}% of monthly-equivalent basic pay</span>
            @endif
        </td>
        <td class="r">{{ $peso($row['grossBonus']) }}</td>
    </tr>
    <tr>
        <td>Less: withholding tax
            <span class="muted">
                @if (! $bonus->taxable)
                    Non-taxable, no withholding
                @elseif ($row['taxRate'] == 0)
                    Taxable, 0% bracket
                @else
                    Taxable, {{ round($row['taxRate'] * 100) }}% marginal rate
                @endif
            </span>
        </td>
        <td class="r">{{ $peso($row['withholdingTax']) }}</td>
    </tr>
</table>

<div class="net">NET BONUS PAY &nbsp; {{ $peso($row['netPay']) }}</div>
<p class="muted">Statutory contributions stay on the regular payroll payslip.</p>
<p class="muted" style="margin-top:18px;">This payslip is computer generated and confidential.</p>
</body>
</html>
