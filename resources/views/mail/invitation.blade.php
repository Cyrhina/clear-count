@extends('mail.layout')

@section('title', 'Create your password')
@section('heading', 'Create Your Password')
@section('lead', 'Welcome to Clear Count! You are almost ready to access your employee portal.')
@section('button', 'Create Your Password')

@section('content')
    <p style="margin:0 0 12px;">Your account has been created as <strong>{{ $roleLabel }}</strong> and you are one step closer to managing your payroll information, viewing your payslips, and more.</p>
    <p style="margin:0;">To get started, please create your password by clicking the button below.</p>
@endsection

@section('panel')
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;border-radius:10px;">
        <tr>
            <td style="padding:18px 22px;font-size:13px;line-height:1.8;color:#4a6072;">
                <strong style="color:#1e3765;font-size:14px;">Password Requirements</strong><br>
                &bull; At least 8 characters<br>
                &bull; Upper and lowercase letters<br>
                &bull; At least one number<br>
                &bull; At least one special character
            </td>
        </tr>
    </table>
    <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#6b7d8c;">Button not working? Copy this link into your browser:<br><a href="{{ $url }}" style="color:#1e3765;word-break:break-all;">{{ $url }}</a></p>
@endsection

@section('footnote')
    <p style="margin:0;">This link expires in {{ $expires }}. If it has expired, ask your admin to resend the invite. If you did not expect this email, you can safely ignore it.</p>
@endsection
