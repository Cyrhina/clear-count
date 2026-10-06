<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Serves the frontend-ops pages. Each action only picks the page key; data still comes
 * from the frontend mock services until the matching module gets real controllers.
 * Permissions are enforced by the `permission:` middleware on each route.
 */
class OpsController extends Controller
{
    public function dashboard(Request $request): Response
    {
        return $this->page('dashboard', $request);
    }

    public function employees(Request $request): Response
    {
        return $this->page('employees.index', $request);
    }

    public function employee(Request $request): Response
    {
        return $this->page('employees.show', $request);
    }

    public function attendance(Request $request): Response
    {
        return $this->page('attendance', $request);
    }

    public function schedules(Request $request): Response
    {
        return $this->page('schedules', $request);
    }

    public function overtime(Request $request): Response
    {
        return $this->page('overtime', $request);
    }

    public function approvals(Request $request): Response
    {
        return $this->page('approvals', $request);
    }

    public function leave(Request $request): Response
    {
        return $this->page('leave', $request);
    }

    public function payrollIndex(Request $request): Response
    {
        return $this->page('payroll.index', $request);
    }

    public function payrollShow(Request $request): Response
    {
        return $this->page('payroll.show', $request);
    }

    public function payrollInputs(Request $request): Response
    {
        return $this->page('payroll.inputs', $request);
    }

    public function bonusesIndex(Request $request): Response
    {
        return $this->page('bonuses.index', $request);
    }

    public function bonusPayslip(Request $request): Response
    {
        return $this->page('bonuses.payslip', $request);
    }

    public function thirteenthIndex(Request $request): Response
    {
        return $this->page('thirteenth.index', $request);
    }

    public function thirteenthPayslip(Request $request): Response
    {
        return $this->page('thirteenth.payslip', $request);
    }

    public function payslipsIndex(Request $request): Response
    {
        return $this->page('payslips.index', $request);
    }

    public function payslipsShow(Request $request): Response
    {
        return $this->page('payslips.show', $request);
    }

    public function statutory(Request $request): Response
    {
        return $this->page('statutory', $request);
    }

    public function loans(Request $request): Response
    {
        return $this->page('loans', $request);
    }

    public function essHome(Request $request): Response
    {
        return $this->page('ess.home', $request);
    }

    public function essProfile(Request $request): Response
    {
        return $this->page('ess.profile', $request);
    }

    public function essPayslips(Request $request): Response
    {
        return $this->page('ess.payslips', $request);
    }

    public function essPayslipsShow(Request $request): Response
    {
        return $this->page('ess.payslips.show', $request);
    }

    public function essAttendance(Request $request): Response
    {
        return $this->page('ess.attendance', $request);
    }

    public function essOvertime(Request $request): Response
    {
        return $this->page('ess.overtime', $request);
    }

    public function essLeave(Request $request): Response
    {
        return $this->page('ess.leave', $request);
    }

    public function essLoans(Request $request): Response
    {
        return $this->page('ess.loans', $request);
    }

    public function notifications(Request $request): Response
    {
        return $this->page('notifications', $request);
    }

    public function reportsIndex(Request $request): Response
    {
        return $this->page('reports.index', $request);
    }

    public function reportsShow(Request $request): Response
    {
        return $this->page('reports.show', $request);
    }

    public function insights(Request $request): Response
    {
        return $this->page('insights', $request);
    }

    public function userAccess(Request $request): Response
    {
        return $this->page('user-access', $request);
    }

    public function companySettings(Request $request): Response
    {
        return $this->page('company-settings', $request);
    }

    public function onboarding(Request $request): Response
    {
        return $this->page('onboarding', $request);
    }

    public function branches(Request $request): Response
    {
        return $this->page('branches', $request);
    }

    public function subscription(Request $request): Response
    {
        return $this->page('subscription', $request);
    }

    public function integrations(Request $request): Response
    {
        return $this->page('integrations', $request);
    }

    public function platformCompanies(Request $request): Response
    {
        return $this->page('platform.companies', $request);
    }

    public function forbidden(Request $request): Response
    {
        return $this->page('forbidden', $request);
    }

    private function page(string $page, Request $request): Response
    {
        return Inertia::render('ops', [
            'page' => $page,
            'params' => $request->route()->parameters(),
        ]);
    }
}
