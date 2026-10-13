<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\PayrollGroup;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The setup checklist, computed from the company's own data (no table). The route requires `onboarding.manage`. */
class OnboardingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $steps = [
            'company_info' => filled($company->name) && filled($company->email) && filled($company->timezone) && filled($company->company_type),
            'branches' => Branch::exists(),
            'payroll_groups' => PayrollGroup::exists(),
            'work_schedule' => WorkSchedule::exists(),
            'holidays' => Holiday::activeForCompany($company->id)->forYear(now()->year)->exists(),
            // shortcut: stands in for the statutory tables (P8): the government deductions exist and are switched on.
            'statutory' => DeductionType::where('category', 'government')->where('is_active', true)->exists(),
            'employees' => Employee::exists(),
            'users' => User::where('company_id', $company->id)->count() > 1,
        ];

        // Inviting users does not block running payroll.
        $required = collect($steps)->except('users');

        return response()->json(['data' => ['steps' => $steps, 'ready_for_payroll' => $required->every(fn ($done) => $done)]]);
    }
}
