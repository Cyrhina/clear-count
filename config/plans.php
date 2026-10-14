<?php

/**
 * Subscription plans: the prices, what each includes and what it unlocks. The server enforces these (the `plan:` middleware and
 * `App\Support\Plans`) and shares them with the frontend through Inertia, so the two cannot drift apart. The marketing copy of
 * the plan cards (target audience, highlights) stays in the frontend (`lib/plans.ts`).
 *
 * `employee_limit` is what the base price includes: more employees are allowed and billed `extra_employee_price` each.
 * `user_limit` is a hard cap on active admin and manager accounts (employee self-service logins are free). `null` means no limit (Enterprise is quoted by hand).
 */
$standard = ['attendance', 'leave', 'overtime_night_diff', 'bonuses_incentives', 'thirteenth_month', 'loans_deductions', 'ess'];
$professional = [...$standard, 'flexible_compensation', 'advanced_reports', 'approvals', 'multi_branch'];
$professionalPlus = [...$professional, 'schedules'];

return [
    'order' => ['basic', 'standard', 'professional', 'professional_plus', 'enterprise'],

    'tiers' => [
        'basic' => ['label' => 'Basic', 'monthly_price' => 1500, 'extra_employee_price' => 75, 'employee_limit' => 25, 'user_limit' => 3, 'features' => []],
        'standard' => ['label' => 'Standard', 'monthly_price' => 3000, 'extra_employee_price' => 70, 'employee_limit' => 75, 'user_limit' => 8, 'features' => $standard],
        'professional' => ['label' => 'Professional', 'monthly_price' => 5000, 'extra_employee_price' => 65, 'employee_limit' => 150, 'user_limit' => 15, 'features' => $professional],
        'professional_plus' => ['label' => 'Professional Plus', 'monthly_price' => 6500, 'extra_employee_price' => 60, 'employee_limit' => 150, 'user_limit' => 15, 'features' => $professionalPlus],
        'enterprise' => ['label' => 'Enterprise', 'monthly_price' => null, 'extra_employee_price' => null, 'employee_limit' => null, 'user_limit' => null, 'features' => [...$professionalPlus, 'api_integrations', 'customization', 'dedicated_support']],
    ],

    'feature_labels' => [
        'attendance' => 'Attendance Tracking',
        'leave' => 'Leave Management',
        'overtime_night_diff' => 'Overtime & Night Differential',
        'bonuses_incentives' => 'Bonuses & Incentives',
        'thirteenth_month' => '13th Month Pay',
        'loans_deductions' => 'Benefits, Loans & Deductions',
        'ess' => 'Employee Self-Service',
        'multi_branch' => 'Multi-Branch Management',
        'schedules' => 'Schedules',
        'flexible_compensation' => 'Flexible Compensation & Multiple Payroll Groups',
        'advanced_reports' => 'Advanced Payroll Reports',
        'approvals' => 'Approvals',
        'api_integrations' => 'Integrations & API Access',
        'customization' => 'Customization Tools',
        'dedicated_support' => 'Dedicated Support Portal',
    ],
];
