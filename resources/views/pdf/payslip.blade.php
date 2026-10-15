@php
    $peso = fn ($n) => '₱'.number_format((float) $n, 2);
    $date = fn ($d) => \Illuminate\Support\Carbon::parse($d)->format('M j, Y');
    $deductions = [
        ['SSS Contribution', $line['sssEmployeeShare'] ?? 0],
        ['PhilHealth Contribution', $line['philhealthEmployeeShare'] ?? 0],
        ['Pag-IBIG Contribution', $line['pagibigEmployeeShare'] ?? 0],
        ['Withholding Tax', $line['withholdingTax'] ?? 0],
        ...array_map(fn ($d) => [$d['label'], $d['amount']], $line['loanDeductions'] ?? []),
        ...array_map(fn ($d) => [$d['label'], $d['amount']], $line['otherDeductions'] ?? []),
    ];
    $deductions = array_values(array_filter($deductions, fn ($d) => $d[1] > 0));
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
    .total td { font-weight: bold; border-top: 1px solid #1f2d3a; }
    .net { margin-top: 14px; padding: 10px; background: #eaf6f1; font-size: 14px; font-weight: bold; }
</style>
</head>
<body>
<h1>{{ $company->trade_name ?: $company->name }}</h1>
<div class="muted">{{ $company->addressLine() }}</div>

<h2>Employee</h2>
<table>
    <tr><td>Name</td><td>{{ $employee->name }}</td><td>Employee ID</td><td>{{ $employee->employee_number }}</td></tr>
    <tr><td>Department</td><td>{{ $employee->department }}</td><td>Position</td><td>{{ $employee->employment['position'] ?? '' }}</td></tr>
</table>

<h2>Pay period</h2>
<table>
    <tr><td>Payroll No.</td><td>{{ $period->payroll_number }}/{{ $period->payroll_year }}</td><td>Pay Date</td><td>{{ $date($period->pay_date) }}</td></tr>
    <tr><td>Pay Period</td><td colspan="3">{{ $period->label }} ({{ $date($period->start_date) }} – {{ $date($period->end_date) }})</td></tr>
</table>

<h2>Earnings</h2>
<table>
    @foreach ($line['earnings'] as $e)
        <tr><td>{{ $e['label'] }}</td><td class="r">{{ $peso($e['amount']) }}</td></tr>
    @endforeach
    <tr class="total"><td>Gross Pay</td><td class="r">{{ $peso($line['grossPay']) }}</td></tr>
</table>

<h2>Deductions</h2>
<table>
    @foreach ($deductions as $d)
        <tr><td>{{ $d[0] }}</td><td class="r">{{ $peso($d[1]) }}</td></tr>
    @endforeach
    <tr class="total"><td>Total Deductions</td><td class="r">{{ $peso($line['totalDeductions']) }}</td></tr>
</table>

@if (! empty($line['benefitsProvided']))
    <h2>Benefits provided by the company</h2>
    <table>
        @foreach ($line['benefitsProvided'] as $b)
            <tr><td>{{ $b['label'] }}</td><td class="r">{{ $peso($b['amount']) }}</td></tr>
        @endforeach
    </table>
@endif

<div class="net">NET PAY &nbsp; {{ $peso($line['netPay']) }}</div>
<p class="muted" style="margin-top:18px;">This payslip is computer generated and confidential.</p>
</body>
</html>
