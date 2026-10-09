<?php

namespace App\Support;

use App\Enums\CapabilityArea;

/**
 * Display metadata for every capability (label, description, area) and every role (description).
 * Mirrors resources/js/ops/features/user-access/permissionCatalog.ts, so the Permission Map API and the UI agree.
 * Access checks never read this: they use the permissions stored by RoleSeeder.
 */
final class CapabilityCatalog
{
    /** @var array<string, array{0: string, 1: string, 2: string}> name => [label, description, area] */
    public const CAPABILITIES = [
        'dashboard.view' => ['View dashboard', 'See the company dashboard, metrics, and quick actions.', 'overview'],
        'ess.view' => ['Employee self-service', 'Access the personal portal: own profile, schedule, attendance, work and output, overtime, leave, and payslips.', 'overview'],
        'employees.view' => ['View employees', 'Browse the employee directory and profiles.', 'workforce'],
        'employees.pay.view' => ['View pay & sensitive details', 'See pay rates, compensation history, benefits, government IDs, bank details, and documents on employee profiles. Without it, only personal and employment details are shown.', 'workforce'],
        'employees.edit' => ['Edit employees', 'Add employees and update their personal and employment details.', 'workforce'],
        'employees.government.edit' => ['Edit government IDs', 'Update SSS, PhilHealth, Pag-IBIG and TIN numbers on employee records.', 'workforce'],
        'employees.bank.edit' => ['Edit bank details', 'Update the bank account an employee is paid into.', 'workforce'],
        'employees.separate' => ['Separate & deactivate employees', 'Record resignations and terminations, and deactivate or reactivate employees (this affects final pay).', 'workforce'],
        'onboarding.manage' => ['Manage onboarding', 'Run the company onboarding checklist and setup steps.', 'workforce'],
        'branches.manage' => ['Manage branches', 'Create branches and assign or transfer employees between them.', 'workforce'],
        'attendance.view' => ['View attendance', 'See time logs, daily attendance, and biometric records.', 'time_attendance'],
        'attendance.adjust' => ['Adjust attendance', 'Correct time logs and file attendance adjustments.', 'time_attendance'],
        'attendance.import' => ['Import biometrics', 'Upload punch logs from a biometrics device and apply them to attendance.', 'time_attendance'],
        'attendance.approve' => ['Approve attendance adjustments', 'Approve or reject attendance correction requests.', 'time_attendance'],
        'schedules.view' => ['View schedules', 'See the shift roster, teams and supervisors, and shift templates. The Schedules module is part of the Professional Plus plan and above.', 'time_attendance'],
        'schedules.manage' => ['Manage schedules', 'Assign shifts and rest days, copy the roster, and assign team supervisors. The Schedules module is part of the Professional Plus plan and above.', 'time_attendance'],
        'overtime.view' => ['View overtime', 'See overtime and night differential records.', 'time_attendance'],
        'overtime.log' => ['Log overtime', 'File overtime and night differential entries.', 'time_attendance'],
        'overtime.approve' => ['Approve overtime', 'Approve or reject overtime before it is paid in payroll.', 'time_attendance'],
        'leave.view' => ['View leave', 'See leave requests, balances, and the leave calendar.', 'leave'],
        'leave.request' => ['File leave', 'Submit leave requests on behalf of employees.', 'leave'],
        'leave.approve' => ['Approve leave', 'Approve or reject leave requests.', 'leave'],
        'leave.manage_types' => ['Manage leave types', 'Configure leave types, credits, and paid/unpaid rules.', 'leave'],
        'profile.view' => ['My Profile', 'Open your own account page — your details, role, and access.', 'overview'],
        'payroll.view' => ['View payroll runs', 'See payroll periods, computations, and totals.', 'payroll'],
        'payroll.run' => ['Run payroll', 'Create payroll periods and calculate employee pay.', 'payroll'],
        'payroll.approve' => ['Approve payroll', 'Review and approve calculated payroll runs.', 'payroll'],
        'payroll.inputs.view' => ['View payroll inputs', 'See the approved time, output, leave and adjustment records that payroll runs are built from.', 'payroll'],
        'payroll.finalize' => ['Finalize payroll', 'Lock payroll runs, issue payslips, and post loan deductions.', 'payroll'],
        'statutory.view' => ['View statutory contributions', 'See SSS, PhilHealth, Pag-IBIG, and withholding tax tables.', 'payroll'],
        'statutory.edit' => ['Edit statutory contributions', 'Update contribution brackets, rates, and tax tables.', 'payroll'],
        'payslips.view' => ['View payslips', 'Open and print employee payslips.', 'payroll'],
        'payslips.generate' => ['Generate & send payslips', 'Generate payslips and email them to employees.', 'payroll'],
        'employees.compensation.edit' => ['Edit compensation', 'Change pay rates, allowances, and pay rate types.', 'compensation_benefits'],
        'compensation_approvals.manage' => ['Manage work-log approvals', 'Approve hourly timecards and output submissions used for pay.', 'compensation_benefits'],
        'loans.view' => ['View benefits, loans & deductions', 'See employee benefits, loans, balances, repayment schedules, and deductions.', 'compensation_benefits'],
        'loans.manage' => ['Manage benefits, loans & deductions', 'Add, edit, and end employee benefits, loans, and deductions.', 'compensation_benefits'],
        'bonuses.view' => ['View bonuses & incentives', 'See bonus and incentive configurations.', 'compensation_benefits'],
        'bonuses.manage' => ['Manage bonuses & incentives', 'Create, submit, and approve bonuses and incentives.', 'compensation_benefits'],
        'thirteenth_month.view' => ['View 13th month pay', 'See 13th month pay batches and computations.', 'compensation_benefits'],
        'thirteenth_month.manage' => ['Manage 13th month pay', 'Generate, finalize, and issue 13th month payslips.', 'compensation_benefits'],
        'reports.view' => ['View reports', 'Open, export, and print workforce and payroll reports.', 'analytics_reports'],
        'reports.workforce.view' => ['View workforce reports', 'Open employee, compensation, benefits, statutory, and tax reports. Without it (and without payroll reports), only team reports — attendance, leave, overtime, hours, and output — are available.', 'analytics_reports'],
        'reports.payroll.view' => ['View payroll & tax reports', 'Open payroll, statutory, tax and compensation reports. Without it, only workforce reports (employee list, compensation, benefits, statutory contributions, tax & compliance, headcount, attendance, leave) are available.', 'analytics_reports'],
        'insights.view' => ['View insights', 'See analytics and decision-support insights.', 'analytics_reports'],
        'approvals.view' => ['Approvals inbox', 'See pending requests that need action.', 'analytics_reports'],
        'notifications.view' => ['View notifications', 'Receive in-app notifications.', 'communication'],
        'notifications.send' => ['Send notifications', 'Send announcements and notifications to employees.', 'communication'],
        'users.manage' => ['Manage users & access', 'Invite users, change roles, suspend or deactivate accounts, and reset passwords.', 'settings_administration'],
        'settings.company.edit' => ['Edit company settings', 'Update company profile, holidays, and branding.', 'settings_administration'],
        'settings.payroll.edit' => ['Edit payroll settings', 'Configure payroll groups, earnings, deductions, rules, and rates.', 'settings_administration'],
        'integrations.manage' => ['Manage integrations', 'Configure API keys, webhooks, and connected apps.', 'settings_administration'],
        'subscription.manage' => ['Manage subscription', 'Change plan, billing, and subscription details.', 'settings_administration'],
        'platform.admin' => ['Platform administration', 'Administer all companies on the platform.', 'platform'],
    ];

    /** @var array<string, string> */
    public const ROLE_DESCRIPTIONS = [
        'super_admin' => 'Platform administration across all companies, plus every Company Admin capability.',
        'company_admin' => 'Full access to everything in this company — people, time, schedules, payroll, users, settings, and billing.',
        'hr_admin' => 'Manages people and time — employee records (with pay details and government IDs), attendance and biometrics, schedules, leave and leave types, overtime, work-log approvals, benefits, loans and deductions, bonuses, branches, and announcements. Views payroll runs, payslips and 13th month; no payroll processing, pay-rate or bank-detail edits, or separations.',
        'payroll_admin' => 'Runs payroll from approved records — payroll runs and inputs, statutory contributions and tax, payslips, loans and deductions, bonuses, 13th month, payroll settings, and payroll reports. No employee records, attendance, or leave.',
        'manager' => 'Manages their team (their branch only) — views the team roster without pay details, views attendance and files adjustments, plans the team shift schedule, approves work and output, views leave requests and overtime (and files overtime for the team), and sees team reports. No biometrics import, attendance or leave approvals, pay details, or payroll.',
        'employee' => 'Self-service only — own profile, schedule, attendance, work and output, overtime, leave, payslips, and notifications.',
    ];

    public static function label(string $capability): string
    {
        return self::CAPABILITIES[$capability][0] ?? $capability;
    }

    public static function description(string $capability): ?string
    {
        return self::CAPABILITIES[$capability][1] ?? null;
    }

    public static function area(string $capability): CapabilityArea
    {
        return CapabilityArea::tryFrom(self::CAPABILITIES[$capability][2] ?? '') ?? CapabilityArea::Settings;
    }
}
