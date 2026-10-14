@extends('mail.layout')

@section('title', 'Your payslip is ready')
@section('heading', 'Your payslip is ready')
@section('lead', 'Hi '.$firstName.', your payslip for '.$periodLabel.' is attached.')
@section('button', 'View My Payslips')

@section('content')
    <p style="margin:0;">Your payslip for <strong>{{ $periodLabel }}</strong> is attached as a PDF. You can also open it any time from your employee portal.</p>
@endsection

@section('panel')
@endsection

@section('footnote')
    <p style="margin:0;">This email contains confidential pay information. If it was not meant for you, please delete it.</p>
@endsection
