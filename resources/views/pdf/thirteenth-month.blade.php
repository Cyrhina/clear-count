@php
    $peso = fn ($n) => '₱'.number_format((float) $n, 2);
    $date = fn ($d) => \Illuminate\Support\Carbon::parse($d)->format('M j, Y');
@endphp
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1f2d3a; }
    h1 { font-size: 18px; margin: 0; color: #1e3765; }
    h2 { font-size: 11px; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: .5px; color: #4a6072; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 5px 6px; border-bottom: 1px solid #e3e9ee; text-align: left; }
    td.r, th.r { text-align: right; }
    .muted { color: #6b7d8c; }
    .total td { font-weight: bold; border-top: 1px solid #1f2d3a; }
    .net { margin-top: 14px; padding: 10px; background: #eef2f7; font-size: 14px; font-weight: bold; }
</style>
</head>
<body>
<h1>{{ $company->trade_name ?: $company->name }}</h1>
<div class="muted">{{ $company->addressLine() }}</div>
<p><strong>13th Month Pay payslip</strong> &middot; separate from the regular payroll</p>

<h2>Employee</h2>
<table>
    <tr><td>Name</td><td>{{ $employee->name }}</td><td>Employee ID</td><td>{{ $employee->employee_number }}</td></tr>
    <tr><td>Department</td><td>{{ $employee->department }}</td><td>Position</td><td>{{ $employee->employment['position'] ?? '' }}</td></tr>
</table>

<h2>Coverage</h2>
<table>
    <tr><td>Calendar year</td><td>{{ $run->year }}</td><td>Payout</td><td>{{ $run->payout_period_label }}</td></tr>
    <tr><td>Active period counted</td><td colspan="3">{{ $date($line['activeFrom']) }} – {{ $date($line['activeTo']) }} ({{ $line['monthsCredited'] }} / 12 months)</td></tr>
</table>

<h2>Basic salary earned</h2>
<table>
    @foreach ($line['months'] as $m)
        <tr><td>{{ $m['label'] }} <span class="muted">{{ $m['detail'] }}</span></td><td class="r">{{ $peso($m['amount']) }}</td></tr>
    @endforeach
    <tr class="total"><td>Total</td><td class="r">{{ $peso($line['grossBasicEarned']) }}</td></tr>
</table>

@if ($line['undertimeDeduction'] > 0 || $line['absenceDeduction'] > 0)
    <h2>Deductions</h2>
    <table>
        @if ($line['undertimeDeduction'] > 0)
            <tr><td>Undertime ({{ $line['undertimeHours'] }} hr × {{ $peso($line['hourlyRate']) }})</td><td class="r">{{ $peso($line['undertimeDeduction']) }}</td></tr>
        @endif
        @if ($line['absenceDeduction'] > 0)
            <tr><td>Unpaid absence ({{ $line['unpaidAbsenceDays'] }} day × {{ $peso($line['dailyRate']) }})</td><td class="r">{{ $peso($line['absenceDeduction']) }}</td></tr>
        @endif
    </table>
@endif

<h2>Computation</h2>
<table>
    <tr><td>Total basic salary earned</td><td class="r">{{ $peso($line['annualBasicEarned']) }}</td></tr>
    <tr class="total"><td>13th Month Pay (÷ 12)</td><td class="r">{{ $peso($line['thirteenthMonthPay']) }}</td></tr>
    @if ($line['withholdingTax'] > 0)
        <tr><td>Less: withholding tax on {{ $peso($line['taxableExcess']) }} over the {{ $peso(\App\Payroll\ThirteenthMonth::TAX_EXEMPT_CEILING) }} ceiling</td><td class="r">{{ $peso($line['withholdingTax']) }}</td></tr>
    @endif
</table>

<div class="net">NET 13TH MONTH PAY &nbsp; {{ $peso($line['netPay']) }}</div>
<p class="muted" style="margin-top:18px;">This payslip is computer generated and confidential.</p>
</body>
</html>
