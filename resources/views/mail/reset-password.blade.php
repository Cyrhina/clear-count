@extends('mail.layout')

@section('title', 'Reset your password')
@section('heading', 'Reset Your Password')
@section('lead', 'We received a request to reset your password for your Clear Count account.')
@section('button', 'Reset Your Password')

@section('content')
    <p style="margin:0;">You can reset your password by clicking the button below. This link will expire in {{ $expires }} for your security.</p>
@endsection

@section('panel')
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;border-radius:10px;">
        <tr>
            <td style="padding:18px 22px;font-size:13px;line-height:1.7;color:#4a6072;">
                <strong style="color:#1e3765;font-size:14px;">Having trouble?</strong><br>
                If the button above doesn't work, copy and paste the link below into your browser:
                <div style="margin-top:10px;background:#ffffff;border:1px solid #cfdce7;border-radius:6px;padding:10px 12px;font-size:12px;word-break:break-all;"><a href="{{ $url }}" style="color:#1e3765;text-decoration:none;">{{ $url }}</a></div>
            </td>
        </tr>
    </table>
@endsection

@section('footnote')
    <p style="margin:0;">If you did not request a password reset, you can safely ignore this email or contact our support team.</p>
@endsection
