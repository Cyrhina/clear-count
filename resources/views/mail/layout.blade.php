<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title')</title>
</head>
{{-- Table layout with inline styles only: the one thing every mail client renders the same. --}}
<body style="margin:0;padding:0;background:#eef3f6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#3f5365;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f6;padding:32px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;">
                <tr>
                    <td style="padding:28px 36px 0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #dce4ee;">
                            <tr>
                                <td style="padding-bottom:18px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding-right:10px;"><img src="{{ url('/brand/clear-count-light.png') }}" alt="" height="40" style="display:block;height:40px;border:0;"></td>
                                            <td style="line-height:1.3;">
                                                <strong style="font-size:18px;color:#1e3765;">Clear Count</strong><br>
                                                <span style="font-size:12px;color:#6b7d8c;">Simple. Accurate. On Time.</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td align="right" style="padding-bottom:18px;font-size:13px;font-weight:600;">
                                    <a href="{{ url('/login') }}" style="color:#1e3765;text-decoration:none;">Employee Portal &rarr;</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding:22px 36px 0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;border-radius:10px;">
                            <tr>
                                <td style="padding:30px 28px;">
                                    <h1 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#1e3765;">@yield('heading')</h1>
                                    <p style="margin:0;font-size:14px;line-height:1.7;color:#4a6072;">@yield('lead')</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding:26px 36px 0;font-size:15px;line-height:1.7;">
                        <h2 style="margin:0 0 12px;font-size:19px;color:#0f2a3d;">Hi {{ $name }},</h2>
                        @yield('content')
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding:26px 36px 8px;">
                        <a href="{{ $url }}" style="display:inline-block;background:#1e3765;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:15px 44px;border-radius:8px;">@yield('button') &rarr;</a>
                    </td>
                </tr>

                <tr>
                    <td style="padding:18px 36px 0;">@yield('panel')</td>
                </tr>

                <tr>
                    <td style="padding:22px 36px 0;font-size:13px;line-height:1.7;color:#5d7080;">
                        @yield('footnote')
                        <p style="margin:18px 0 0;">Best regards,<br><strong style="color:#0f2a3d;">Clear Count Team</strong></p>
                    </td>
                </tr>

                <tr>
                    <td style="padding:26px 36px 28px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #dce4ee;">
                            <tr>
                                <td style="padding-top:18px;font-size:12px;color:#6b7d8c;">
                                    <strong style="color:#0f2a3d;font-size:13px;">Clear Count</strong><br>Simple. Accurate. On Time.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
