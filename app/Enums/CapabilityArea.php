<?php

namespace App\Enums;

/** The functional areas the Permission Map groups capabilities under (the filter pills / accordion sections in the UI). */
enum CapabilityArea: string
{
    case Overview = 'overview';
    case Workforce = 'workforce';
    case TimeAttendance = 'time_attendance';
    case Leave = 'leave';
    case Payroll = 'payroll';
    case CompensationBenefits = 'compensation_benefits';
    case AnalyticsReports = 'analytics_reports';
    case Communication = 'communication';
    case Settings = 'settings_administration';
    case Platform = 'platform';

    public function label(): string
    {
        return match ($this) {
            self::Overview => 'Overview',
            self::Workforce => 'Workforce',
            self::TimeAttendance => 'Time & Attendance',
            self::Leave => 'Leave',
            self::Payroll => 'Payroll',
            self::CompensationBenefits => 'Compensation & Benefits',
            self::AnalyticsReports => 'Analytics & Reports',
            self::Communication => 'Communication',
            self::Settings => 'Settings & Administration',
            self::Platform => 'Platform',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Overview => 'Dashboards and the employee self-service portal.',
            self::Workforce => 'Employee records, onboarding, and branch assignment.',
            self::TimeAttendance => 'Attendance logs, adjustments, and overtime.',
            self::Leave => 'Leave requests, approvals, and leave type setup.',
            self::Payroll => 'Payroll runs, statutory contributions, and payslips.',
            self::CompensationBenefits => 'Pay rates, loans, bonuses, and 13th month pay.',
            self::AnalyticsReports => 'Reports, insights, and the approvals inbox.',
            self::Communication => 'In-app notifications and announcements.',
            self::Settings => 'Users, company and payroll settings, integrations, and billing.',
            self::Platform => 'Cross-company platform administration.',
        };
    }
}
