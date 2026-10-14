# Backend Integration Progress

The live state of [PLAN.md](PLAN.md). Update this file in every phase branch, at every commit that finishes a sub-step.

## How to resume

1. Find the first phase below whose status is not `merged`.
2. Read its handoff note: the branch, what is done, and the next step.
3. Open a Claude Code session in that phase's worktree (or create one from the pushed branch, see PLAN.md section 3) and say:
   `Resume backend integration phase Pxx from docs/PROGRESS.md.`

## Phase status

Status values: `not started`, `in progress`, `in review` (PR open), `merged`.

| Phase | Name | Status | Branch | PR | Merged on |
|---|---|---|---|---|---|
| P0 | Foundation and golden snapshot | merged | backend/p00-foundation | #3 | 2026-10-12 |
| P1 | Company setup wiring | merged | backend/p01-company-setup | #4 | 2026-10-13 |
| P2 | Branches, departments, onboarding | merged | backend/p02-branches-departments | #5 | 2026-10-13 |
| P3 | Employees (a, b) | done (merged #6, #7) | backend/p03-employees, backend/p03b-employees-bulk | #6, #7 | 2026-10-13 |
| P4 | Schedules and roster | done (merged #8) | backend/p04-schedules | #8 | 2026-10-13 |
| P5 | Attendance, adjustments, biometrics, WFH (a, b) | done (merged #9, #10) | backend/p05a-attendance, backend/p05b-wfh | #9, #10 | 2026-10-13 |
| P6 | Leave | done (merged #11) | backend/p06-leave | #11 | 2026-10-19 |
| P7 | Overtime, work logs, approvals inbox, notifications | done (merged #12) | backend/p07-overtime | #12 | 2026-10-20 |
| P8 | Statutory tables and withholding tax | done (merged #13) | backend/p08-statutory | #13 | 2026-10-21 |
| P9 | Benefits, loans, deductions, bonuses (a, b, c) | done (merged #14, #15, #16) | backend/p09-benefits-loans, backend/p09b-loans, backend/p09c-bonuses | #14, #15, #16 | 2026-10-24 |
| P10 | Payroll engine and runs (a: engine, b: runs) | done (merged #17, #18) | backend/p10a-payroll-engine, backend/p10b-payroll-runs | #17, #18 | 2026-10-26 |
| P11 | Payslips, PDF, email | done (merged #19, #20) | backend/p11-payslips, backend/fix-composer-lock | #19, #20 | 2026-10-27 |
| P12 | 13th month and separate bonus payslips | done (merged #21) | backend/p12-thirteenth-month | #21 | 2026-10-27 |
| P13 | Employee and manager self-service | done (merged #22) | backend/p13-self-service | #22 | 2026-10-28 |
| P14 | Dashboards, reports, tax compliance | in progress: in review | backend/p14-dashboards-reports | | |
| P15 | Platform and subscriptions | done: in review | backend/p15-platform | | |
| P16 | Integrations (API keys, webhooks) | not started | | | |
| P17 | Mock removal and hardening | not started | | | |

## Owner decisions

Decisions made during the phases (PLAN.md marks each one with **Confirm with the owner**). Add one row per answer.

| Date | Phase | Question | Answer |
|---|---|---|---|
| 2026-10-12 | plan | Where does payroll computation run? | Port to PHP; the server is the source of truth (D1). |
| 2026-10-12 | plan | What happens to mock data? | Delete it per module; demo data moves to seeders (D2). |
| 2026-10-12 | plan | How do phases map to git? | One branch, worktree and PR per phase, from `master` (D3). |
| 2026-10-12 | plan | Which later modules are in scope? | All: platform and subscriptions, integrations, payslip PDF and email, notifications (D4). |
| 2026-10-12 | P0 | Turn off open registration? | Yes. Fortify registration, the register page and CreateNewUser are removed. |
| 2026-10-12 | P1 | Payroll Groups: screen or backend leads? | Backend leads. Real cutoff and pay-date pickers, server calendar, 4 frequencies, group points at a Compensation Type record. |
| 2026-10-12 | P1 | What do the Assign employees actions do before P3/P4? | Disabled with a note; they come back with the Employees and Schedules modules. |
| 2026-10-13 | P2 | Department: foreign key now or in P3? | In P3. P2 keeps the department as a name on the employee; a rename updates the employees, a delete is blocked while any employee has the name. |
| 2026-10-13 | P6 | How do leave credits come in? | The full yearly credits are granted at once (at hire and at the start of each leave year). No monthly accrual, so there is no `leave:accrue`. |
| 2026-10-13 | P6 | How is the leave year counted, and mid-year hires? | Calendar year. A hire gets the credits pro-rated by the months left in the hire year (to the half day). |
| 2026-10-13 | P6 | What happens to unused credits at year end? | Carried over up to the leave type's max carry-over; the rest expires (an `expiry` ledger entry). No cash conversion. |
| 2026-10-25 | P10 | Apply the late policy as a deduction in the payroll engine? | Not yet. The PHP engine matches the browser engine, which ignores the late policy. It can be added as a separate step later. |
| 2026-10-12 | P0 | Give company_admin, super_admin and manager `profile.view`? | Yes, on the server and in the client copy. `ess.view` was not added to admins. |

## Mock-removal ledger

Mock code that a phase could not delete because a not-yet-migrated mock module still imports it (PLAN.md rule R1). Each row carries a `// mock: remove in Pxx` comment in the code. P17 must leave this table empty.

| Mock code (file:function) | Still imported by | Remove in | Added in |
|---|---|---|---|
| `companyService`: getCompany, getSchedules, getHolidays | attendance, onboarding, employees | P2 (company), P5 (schedules, holidays in attendance) | P1 |
| `mock-data/seed`: companies, payrollGroups, schedules, holidays, earningConfigs, deductionConfigs, compensationTypes, payrollRules, complianceDeadlines | the mock services above and the mock payroll engine | with the services above | P1 |
| `branchService`: getBranches; `branchDepartmentService`: addBranchDepartment, ensureBranchDepartment | integrations, `employeeService.createEmployee` | P16 (integrations) | P2 |
| `mock-data/generators/shiftAssignments.ts` (`db.shiftAssignments`) | nothing (kept until the mock db goes) | P16 | P4 |
| `wfhService` (mock): scheduleOn, defaultTimesFor, todayKey (default punch times from the mock schedules), materializeWfhRecords (reads `db.wfhArrangements`, which nothing fills); `db.attendanceRecords`, `db.attendanceAdjustments`, `db.wfhArrangements` | `LogAttendanceDialog`, `WfhPanel` (todayKey), the payroll browser helpers | P17 | P5a |
| `lib/leave/leaveDays.ts`; `db.leaveTypes`, `db.leaveRequests` | the payroll browser helpers (`payrollService`), the leave list (portion label) | P17 | P6 |
| `db.overtimeRecords`, `db.compensationApprovals`, `lib/payroll/rateBasis.ts` (the work log and rate basis display helpers) | the payroll browser helpers (`payrollService`), the work log card (rate basis) | P17 | P7 |
| `payrollService` (mock): computeLine (inside previewPayrollLine), previewPayrollLine, monthlyStatutoryFor, getStatutoryConfig, updateStatutoryConfig; the `getPayrollPeriods` and `getPayrollLines` wrappers (they call the API); `db.statutoryConfigs`; `mock-data/seed/statutoryConfig.ts`; `lib/payroll/*` (the browser engine's helpers: rate basis, pay frequency, bonus matching, withholding tax, computation breakdown) | the Computation drawer and PayslipCard (they explain a stored payroll line with these helpers), approvals and notifications (periods through the wrappers), the golden JS tests | P17 (the display helpers: the drawer should read the stored breakdown) | P8 |
| `db.employeeBenefits`, `db.employeeDeductions`, `db.benefitPlans`, `db.deductionPlans`, `db.loans`, `db.loanTypes` (mock-data generators) | the payroll browser helpers (`payrollService`) | P17 | P9a |
| `db.payrollPeriods`, `db.payrollLines`, `db.thirteenthMonthRuns`, `db.thirteenthMonthLines`, `db.bonuses`, `db.payslipEmails` (mock-data; nothing reads or writes them now) | nothing (kept until the mock db goes) | P17 | P10b |
| `Schedule.assignedEmployeeIds` on the mock `db.schedules` (read as the employee schedule) | `wfhService` default times, leave days | P17 | P4 |
| `employeeService.createEmployee` (writes the mock `db.employees`); `db.employees` is still read by the payroll browser helpers | the Integrations CSV import | P16 (createEmployee), P17 | P3a |

## Handoff notes

Newest first. One entry per working session or finished sub-step.

### Template

```
### Pxx - YYYY-MM-DD
- Branch: backend/pxx-<slug> (pushed: yes/no)
- Done: <sub-steps finished, with commit hashes>
- Next: <the exact next step>
- Gotchas: <anything the next session must know>
- Checks: php artisan test <pass/fail>, types:check <pass/fail>
```

### P15 - 2026-10-29
- Branch: backend/p15-platform
- Done:
  - Backend: `config/plans.php` (tiers, prices, limits, features; shared to the screens as the Inertia `plans` prop); `AppSupportPlans` (has, usage, quote, assertSeats). Migration: `companies.status` (active | suspended) and `plan_renews_on`, new `subscription_payments` table (upgrade payments, the receipt photo on the private `local` disk).
  - Middleware: `plan:<feature>[,writes]` (403 with "X is available in the Y plan"), `company` (a user with no company, the super admin, cannot write company data: 422 instead of a 500), and `active` now also signs out the users of a suspended company. `routes/web.php` wraps each module with them (a module map: attendance, leave, overtime, schedules, loans and benefits, bonuses, 13th month are gated on writes only, so reports and dashboards of a lower plan keep reading).
  - Seats: a hard limit on active admin and manager accounts (employee self-service logins are free), checked when inviting a user (`UserInvites::create`) and when turning an account back on. Employees above the plan's limit are allowed and billed as the add-on, like the existing estimate.
  - Routes (`routes/ops/platform.php`): company side `GET api/subscription` (usage, pending payment), `quote/{tier}`, `POST downgrade` (applies right away, refused when the accounts do not fit), `POST payments` (multipart: the amount is worked out by the server, one pending payment at a time), `GET payments/{payment}/proof`; super admin side `api/platform/dashboard`, `companies` (list, create with the first company admin and a head office, `status`, `plan`), `payments` and `payments/{payment}/decision` (through `Approval::decide`; confirming sets the plan and a month of renewal; both outcomes notify). `GET api/company` returns the own company for any role.
  - Frontend: `subscriptionService` on the API; `useSubscriptionUsage` and `useRefreshPlan` (TanStack `['subscription']` plus an Inertia reload of `auth`); `useActivePlanTier` reads the plan from the Inertia props (known on first render); `applyServerPlans` overwrites the prices, limits and features in `lib/plans.ts` with the server's; `useTenant` returns the real company (`['company']`, from `api/company`); `CompaniesPage` (create, suspend, set plan, verify or reject payments with the receipt) and `SuperAdminDashboard` on the endpoints; the upgrade dialog uploads the receipt file.
  - Deleted: `lib/demo/demoPlanStore.ts` and the Demo Portal tier switcher (Topbar, MobileDemoBar), mock `companyService`, the mock subscription store, the `PendingPlanChange` type.
  - Tests: `PlatformTest` (10 tests). `CompanyFactory` now defaults to the enterprise plan (everything unlocked, no seat limit) so older tests meet a plan rule only when they ask for one.
- Next: P16, integrations (API keys and webhooks) and `createEmployee`.
- Gotchas:
  - Not gated on the server: branches (multi_branch), approvals, advanced reports, flexible compensation and the Integrations page (api_integrations). The screens still lock them (`PlanGate`, sidebar); the API does not refuse them yet.
  - The platform actions of the super admin are not in the activity log (`ActivityLogger` skips a user with no company).
  - A suspended company's user can still sign in and is signed out on the next request (no message on the login page).
  - The notification of a new payment goes to every active super admin. Sales contact for Enterprise is still a mailto.
  - The session user in the topbar and the role switcher are still the mock until P17 (for example the topbar shows the mock name for a company created now).
  - The seeded demo company has no `plan_renews_on` (shows a dash); a company made by the super admin gets one month.
  - Not tested in the browser: the reject flow, suspend (covered by Pest), the downgrade dialog, and the Inertia reload after a plan change.
- Checks: php artisan test 308 (304 passed, 4 skipped); tsc and the build pass; route:cache passes.


### P14 - 2026-10-29
- Branch: backend/p14-dashboards-reports (pushed: no)
- Done:
  - Backend: `GET api/dashboard/overview` (head counts, today's attendance, leave and overtime, the pay cycle in progress taken from the active payroll groups, the last six months of finalized payroll, the five newest hires), `api/dashboard/payroll` (the run in progress, totals, counts by status, trend, deduction breakdown, exceptions) and `api/dashboard/workforce` (last seven working days and headcount by department). `GET api/reports/payroll-lines?from&to` returns the runs paid in a range with all their lines in one request (the last two years and this one by default; 422 above 50,000 lines). The branch list is readable by the report and payroll roles (their branch filters).
  - Frontend: `dashboardService` reads those endpoints (the fabricated figures, the default dashboard and `useDashboardData` are gone). The reminders are the Compliance Deadlines plus the cut-off of the cycle. `getEmployees`, `getAttendanceRecords`, `getAttendanceAdjustments`, `getApprovedLeavesInRange`, `getLeaveRequests`, `getOvertimeRecords`, `getCompensationApprovals` and `getWorkLogSummaryForPeriod` now read the API with the same signatures (a ten second memory in `lib/api/memo.ts`), so every report, dashboard card and notification uses real data. The payroll role gets the payroll directory where it may not list employees.
  - Reports: `reportService` (payroll lines, attendance and leave summaries) and `taxComplianceService` (bonuses, benefits, finalized 13th month lines) are on the API. The statutory, tax and accounting reports, the consolidated statutory data and the tax data use finalized runs only (`useFinalizedPayrollLines`); the payroll register, summary and history keep showing every run. The sample-data fallback of the statutory report is gone.
  - `useTenant` returns the real branches (the company is still the mock until P15). The deduction configs the loans and report screens read come from the API.
  - Deleted: `payrollSettingsService`, the mock overtime, leave, attendance and work log readers, `getDashboardStats`, `getHeadcountTrend`. Ledger updated.
  - Tests: `DashboardApiTest` (5 tests); `BranchTest` updated.
- Next: P15, platform and subscriptions (the Super Admin dashboard, Companies page, plan tier and the company in `useTenant`).
- Gotchas:
  - Deviation from PLAN.md: the report screens still add up their data in the browser (from the API reads above), and the tax compliance rules stay in `lib/payroll/taxCompliance.ts`; only the dashboards got server endpoints. There is no paginated report API. Limits: attendance of the last year, up to 2,000 overtime rows, 1,000 leave requests and 2,000 work logs per read (server caps), payroll lines of two years. A company larger than a few hundred employees needs server-side aggregates (`shortcut:` in `reportService`).
  - HR cannot read the Compliance Deadlines, so its reminders show only the payroll cut-off (and one 403 in the console).
  - The Super Admin dashboard and the Companies page still read the mock companies (P15).
  - The pay cycle shown on the dashboards is the active group whose next pay date comes first; a group whose rules cannot be read is skipped.
  - The 13th month and tax pages count only finalized 13th month batches as paid; a draft batch is a projection.
  - `LogAttendanceDialog` default punch times still come from the mock schedules (ledger, P17).
  - Not tested: BIR 1601-C and 2316, the Excel and PDF exports, the custom report builder, the advanced analytics tab, the Payroll Admin's reports, a company with several hundred employees.
- Checks: php artisan test 298 (294 passed, 4 skipped); tsc and the build pass.


### P13 - 2026-10-28
- Branch: backend/p13-self-service (pushed: no)
- Done:
  - Backend: `GET api/me` (the signed-in person's own record, with pay, bank, documents, history and the branch name; `data: null` when the account has no employee) and `PATCH api/me` (contact number, personal email and address only). `EmployeeResource::seesPay` lets an employee see their own pay and bank. `GET api/manager/dashboard` (team head counts, pending counts, upcoming leave, who needs attention; the model scopes cut it to the manager's branch).
  - Self-service access on routes that were staff-only: `attendance` list, `loans` list, `schedules/templates` and `schedules/roster` now take `ess.view` (the employee scope returns only the employee's own rows). Leave preview, filing and cancel take `ess.view`, but the controller refuses anyone who is not the employee unless they hold `leave.request` (so a manager cannot file or cancel for the team). New `GET api/overtime/rates` (the rates a request can use; the employee cannot open Payroll Settings) and `DELETE api/overtime/{overtime}` (withdraw a pending request).
  - Finalizing a run now also notifies the employee of each loan payment it took (a stored notification, link /ess/loans); the mock loan notice is gone.
  - Frontend: `useSelfEmployee` reads `api/me` (TanStack). ESS pages on the API: home, profile (`updateMe`), attendance (`useMyAttendance`), leave (types, requests, balances, file), loans, overtime (rates, file, withdraw), work output (file, withdraw), schedule (own roster; `useRoster` takes `self`), the WFH request dialog and withdraw. Manager dashboard and the team member Attendance tab (`managerApiService`).
  - Deleted: `managerService`, `loanService`, the ESS sample data, the ESS OT store, the mock leave hooks, the mock `useEmployee`, and the mock functions the ESS pages used (`getAttendanceForEmployee`, `getWfhArrangements`, `createWfhBatch`, `cancelWfh`, `submitLeaveRequest` and the leave planner, `submitWorkLog`, `withdrawWorkLog`, `getEmployee`, `updateEmployeeSelf`, `getEmployeeIdsOnLeaveToday`). The ledger is updated.
  - Tests: `SelfServiceTest` (7 tests). Three old tests that said an employee gets 403 on attendance, loans and the roster now say they read only their own and still cannot write.
- Next: P14, dashboards, reports and tax compliance (the admin, HR, payroll and workforce dashboards, the report screens, `taxComplianceService`).
- Gotchas:
  - Deviation from PLAN.md: no `GET api/ess/summary`. The ESS home puts its cards together from the existing endpoints (payslips, leave, loans, attendance, notifications).
  - The overtime request has no attachment any more (the mock only kept the file name; the API has no file store for it).
  - An employee who is not hourly or output-paid no longer sees the Log button on My Work & Output (the server refuses their entries).
  - The Attendance tab on a team member is built from the attendance and schedule endpoints in the browser; a member with no default work schedule shows "No work schedule assigned yet" (the mock fell back to the company default).
  - The profile form is filled through react-hook-form `values`; a `reset` in an effect left the fields empty with the React Compiler build.
  - Not tested: the manager screens other than the dashboard and the Attendance tab; the ESS pages as a manager with an employee link; a second WFH request right after the first (once the list did not refresh after sending, and could not be repeated).
- Checks: php artisan test 292 (288 passed, 4 skipped); tsc and the build pass.


### P12 - 2026-10-27
- Branch: backend/p12-thirteenth-month (pushed: no)
- Done:
  - 13th month: `thirteenth_month_runs` and `thirteenth_month_lines` (totals as columns, the whole line in `breakdown`: month by month earnings, the hourly and daily rates, the dates of undertime and unpaid absences). `App\Payroll\ThirteenthMonth` is the engine (coverage = the calendar year, active window, eligibility, who a batch covers, `basicEarningsByMonth`, undertime and unpaid absences with paid leave covering a day, the computation, tax above the 90,000 ceiling at the annual marginal rate); `ThirteenthMonthRuns` reads the database and does preview, generate and finalize. Generating replaces the draft with the same year and recipients; someone already in a finalized batch of the year is skipped, and a draft that lists someone paid meanwhile cannot be finalized (409); a finalized batch answers 409 to everything.
  - Endpoints (`routes/ops/thirteenth-month.php`): `GET api/thirteenth-month`, `{run}/lines`, `POST preview` (who a batch covers, as ids), `POST api/thirteenth-month` (generate), `{run}/finalize`, `GET lines/{line}/pdf` (payroll roles, or the employee it is about; 404 until finalized).
  - Separate bonus payslips: `App\Payroll\BonusPayslip` (gross by the bonus type, withheld at the employee's marginal rate on the table of their pay frequency; computed when asked, not stored), `GET api/bonuses/{bonus}/payslips` and `{bonus}/payslips/{employee}/pdf`. Only an approved bonus set to a separate payslip has any.
  - PDF and email: `PayslipPdf` renders three documents (`pdf.payslip`, `pdf.thirteenth-month`, `pdf.bonus-payslip`); the P11 email queue serves the kinds `payroll`, `thirteenth_month` and `bonus` (send needs `payslips.generate`, `thirteenth_month.manage` or `bonuses.manage`). `PayslipMail` now takes a PDF closure.
  - Parity: `ThirteenthMonthParityTest` rebuilds each of the 48 golden employee-years from their own numbers (the golden file keeps results, not inputs: the monthly basic is searched from the earned total, undertime minutes from the hours, one absent day per unpaid day) and every field matches the browser engine; the rest cover tax above the ceiling, paid leave, pro-rating, selection and the key.
  - Frontend: `thirteenthMonthApiService`, TanStack hooks, the 13th Month page (the Computation drawer and payslip read the stored breakdown, so the browser calculations are gone), a Download PDF button on both payslip pages, the bonus details dialog and bonus payslip page on the server's rows. The email service and hook are on the API for all three kinds (the mock relay, `bonusService` and the browser 13th month service are deleted). The Bonuses page and payslip page read employees from the payroll directory, so the Payroll Admin now sees the recipients (this closes the "0 recipients" gap).
  - Demo: a finalized 2025 batch and a draft 2026 batch (all active employees), and an approved Performance Incentive with its own payslip.
  - Also: the API route names of payroll and payslips are prefixed `api.` (they clashed with the web page names in the generated Wayfinder routes and broke `tsc`).
  - Tests: Pest 285 (281 pass, 4 skipped); `tsc` and the build pass.
  - Browser-tested as Payroll Admin: the 13th Month page (12 lines), a Computation drawer, finalize, and the line PDF download (200, `application/pdf`).
- Next: P13, employee and manager self-service (ESS pages that are still mock: WFH, leave, overtime, work output, loans; the manager screens).
- Gotchas:
  - The pay rate used for every month is the employee's current compensation, not the rate in force each month (`shortcut:` comment in `ThirteenthMonth`). A raise during the year is not reflected month by month.
  - The golden file has no inputs, so parity is on the arithmetic and the rebuilt inputs, not on a replay of the database.
  - Not checked visually: how the three PDFs look (the browser pane cannot render a PDF). Not tested: a real mail send; the bulk email buttons and the bonus payslip page as Payroll Admin in the browser; the 13th month payslip as an employee (an employee can download the PDF but has no page for it until P13).
  - The bonus tax rate uses the tables in force today, not the pay date of the period the bonus is tagged to.
- Checks: php artisan test 285 (281 passed, 4 skipped); tsc and the build pass.


### P11 - 2026-10-26
- Branch: backend/p11-payslips (pushed: no)
- Owner decision: PDF package is `barryvdh/laravel-dompdf` (pure PHP, no Chrome in the Docker image).
- Done:
  - `GET api/payslips` (the signed-in employee's own finalized lines with their runs), `GET api/payslips/{line}`, `GET api/payslips/{line}/pdf`. Payroll and HR roles (`payslips.view`, `payroll.view`) open any payslip of their company; an employee only their own; a line of a run that is not finalized answers 404.
  - The PDF is `resources/views/pdf/payslip.blade.php` rendered by `App\Support\PayslipPdf` (company header, employee, period, earnings, deductions, benefits, net pay).
  - `payslip_emails` (kind, source, employee, subject, recipient, status queued/sent/failed, attempts, error, sent time and sender), `App\Jobs\SendPayslipEmail` (one job per employee, delayed one second apart so a bulk send is throttled; a missing or invalid address fails the row with the reason, without trying) and `PayslipMail` (PDF attached). `GET api/payslip-emails?kind=payroll&source_id=` and `POST api/payslip-emails` (`payslips.generate`; 409 until the run is finalized). The recipient is the employee's `personalEmail`. The container already runs `queue:work` (s6 `queue-worker`).
  - Finalizing a run notifies each employee who has a login ("Your payslip for ... is now available", opens `/ess/payslips` and highlights the line); this replaces the mock payslip notices.
  - Frontend: `payslipEmailService` calls the API for the `payroll` kind (queued reads as "sending" and the hook polls every 3 s while any is queued); a Download PDF button on the payslip pages; the ESS payslips list, detail and home read `GET api/payslips`. The illustrative sample payslips and the preview dialog on the ESS page are gone (an employee with no finalized run now sees an empty list).
  - Demo: the login-page Employee account now has an employee record, so the ESS pages have data.
  - Tests: `PayslipTest` (3: finalize notice and 404 before finalization; PDF for payroll and own employee only; queued email, outcome record, missing address, permission). The run-test helpers moved to `tests/Pest.php`. Pest 270 (266 pass, 4 skipped); `tsc` and the build pass.
  - Browser-tested as the demo Employee: ESS payslips list (3 payslips), PDF download (200, `application/pdf`, named by run and employee), another employee's payslip 404.
- Next: P12, 13th month and separate bonus payslips (they reuse the payslip email table with kinds `thirteenth_month` and `bonus`, and the PDF view).
- Gotchas:
  - Not checked visually: how the PDF looks, and that the peso sign shows (DejaVu Sans has it; the browser pane could not render the PDF). Open one before sending real payslips.
  - Not tested end to end: a real send. `MAIL_MAILER` is `log` in `.env.example`; set a real mailer in Coolify. The PDF is about 880 KB because the font is embedded.
  - The mail's "View My Payslips" button points to `/ess/payslips` (the employee must log in).
  - The Payslip Report and the admin payslip list were not changed. The email preview text is still built in the browser (`lib/payroll/payslipEmail.ts`); the sent email's subject is the one the screen sends, the body is the server's `mail.payslip` view.
  - Not browser-tested: the bulk email buttons and the status column as Payroll Admin.
- Checks: php artisan test 270 (266 passed, 4 skipped); tsc and the build pass.


### P10b - 2026-10-25
- Branch: backend/p10b-payroll-runs (pushed: no)
- Scope: the payroll runs end to end. P10a (the engine) is merged (#17).
- Done:
  - Tables `payroll_periods` (group, cutoff, pay date, `PR001` number per pay-date year, status draft/review/approved/finalized, approver and finalizer, held employees) and `payroll_lines` (gross, deductions, net, tax and the six statutory shares as columns; the whole engine line in `breakdown`).
  - `App\Payroll\PayrollRun`: create, run, hold, release, approve, finalize. Each step locks the period row and checks the status, so a step out of order or on a finalized run is a 409. `run` replaces the lines and locks the approved work logs it paid (`work_logs.payroll_period_id`); hold frees an employee's logs, release computes their line again. `finalize`, in one transaction, posts each loan installment with `LoanLedger::repay`, settles the one-time deductions it took (`settled_in_period_id`) and locks the run.
  - Endpoints (`routes/ops/payroll.php`): `GET api/payroll`, `next-number`, `employees`, `lines/{line}`, `{period}/lines`, `{period}/records`; `POST api/payroll`, `{period}/run`, `hold`, `release` (`payroll.run`), `approve` (`payroll.approve`), `finalize` (`payroll.finalize`); `GET api/payroll-inputs/{period}` (`payroll.inputs.view`). The payroll role cannot open employee, attendance, overtime or work-log screens, so `employees` and `{period}/records` carry what the run screens read. The lines, employees and period list also open for `payslips.view`.
  - Frontend: `payrollApiService.ts` and TanStack hooks in `features/payroll/hooks/usePayroll.ts`. The Payroll Runs list, create dialog, period detail (run, hold, release, approve, finalize; a refused step shows the server's reason), Payroll Inputs page and payslip detail read the API. `usePayrollGroups` now reads the real groups (members from the employees' `payrollGroupId`), because the mock groups had ids the server does not know. The mock engine's run functions are deleted; `mock-data/payrollRuns.ts` and its seeding in `OpsPage` are gone.
  - Demo data: `DemoSeeder::seedPayrollRuns` makes 15 runs with the real steps (two earlier months finalized; last month approved, in review and draft; weekly runs).
  - Tests: `PayrollRunTest` (8: full cycle with loan, one-time deduction and lock; 409s; numbers per year; hold and release; work-log locking; permissions and company scoping; employee directory; period records). Pest 267 (263 pass, 4 skipped); `npx tsc --noEmit` and `npm run build` pass.
  - Browser-tested as Payroll Admin: the runs list, a run in review (lines, computation drawer), approve, finalize, the payslip, the Payroll Inputs page.
- Next: P11, payslips (PDF, email, delivery status). The payslip pages already read the lines from the API.
- Gotchas:
  - Until P11, P13 and P14 the ESS payslip pages, the dashboard payroll cards and the payslip notices read `db.payrollLines`, which is empty now. They show nothing; the ledger lists them. Reports read the runs through the `getPayrollPeriods` wrappers (the API), so they show the seeded runs.
  - The Computation drawer and PayslipCard explain a stored line by recomputing from the raw records with the browser helpers in `lib/payroll/*` (kept, in the ledger). They show the server's amounts; if the helpers and the server ever disagree the drawer text is what is off.
  - The run is computed inside the request (`shortcut:` comment in `PayrollRun`); move it to a queued job above about 300 employees.
  - Payroll notices: nothing is sent when a run is approved or finalized (PLAN.md suggested it). Add it with P11 when the payslips go out.
  - Not browser-tested: the create-period dialog, hold and release buttons, the HR admin and manager logins on the payroll pages.
- Checks: php artisan test 267 (263 passed, 4 skipped); tsc and the build pass.


### P10a - 2026-10-25
- Branch: backend/p10a-payroll-engine (pushed: no)
- Scope: P10 is split like P5. P10a is the engine (this PR); P10b is the runs (periods, lines, run, hold, release, approve, finalize, the endpoints and the frontend). P10a has no screen change: Payroll Runs, payslips and the Payroll Inputs page still use the browser engine until P10b.
- Done:
  - `App\Payroll\Num` (JavaScript-style rounding: halves go up), `PayFrequency` (pay schedule, cutoff index, the monthly split and the allocation methods), `RateBasis` (basic pay by rate type, daily and hourly rates, monthly equivalent, work logs of a period), `BonusMatching`, and `ComputeLine` (every step of `computeLine`: basic pay, absences, paid leave, overtime, bonuses, benefits, final-pay proration, loans, statutory shares, withholding tax with overtime and taxable bonuses at the marginal rate, the deduction waterfall so net pay never goes negative). They are pure: they take arrays in the shapes of `types/domain.ts` and return a line in the shape of `PayrollLine`.
  - `PayrollInputs` collects a period's inputs from the database in those shapes and runs the engine over the period's employees: `PayrollInputs::lines(companyId, period)`. Employees: active, plus anyone separated within the period (final pay), limited to the period's payroll group, without the held ones. The pay rate is the compensation row in force on the period's last day; the statutory tables are the ones in force on the pay date (P8, dated). Work schedules are mapped from the database's Monday 1 to Sunday 7 to the engine's Sunday 0; the database names SSS, PhilHealth and Pag-IBIG are mapped to the names the allocation settings use.
  - Parity: `PayrollParityTest` replays the 34 golden periods oldest first, finalizing the finalized ones so loans and one-time deductions carry over, and all 162 lines match the browser engine on every field (a test that changes one rule fails). `PayrollInputsTest` covers the database collector: salaried line with absence, overtime, bonus and loan; work logs (approved, not yet paid by another run); pay rate by date; benefits and deductions; final pay, held employees and settled one-time deductions. Tests: 259 (255 pass, 4 skipped).
  - `Notifier` no longer fails when the permissions are not seeded yet.
- Next: P10b, the runs. `payroll_periods` and `payroll_lines` (the line's earning and deduction lines in a `breakdown` JSON), the actions (create, run, hold, release, approve, finalize; finalize posts the loan repayments with `LoanLedger::repay`, settles the one-time deductions, locks the run), the endpoints, `GET api/payroll-inputs`, and the frontend (delete the engine in `lib/services/payrollService.ts` and `lib/payroll/*`; stop seeding the sample runs). PLAN.md P10.
- Gotchas:
  - Accepted difference from the browser engine: output-based pay now comes only from approved work logs. The browser engine paid an invented quantity (`mockOutputQuantity`) to an output-based employee with no logs; the PHP engine pays 0 and labels the line "Output / Piece-Rate Pay". The golden data has no such line, so the parity test shows none skipped.
  - The late policy is not applied (owner decision above).
  - The run's work logs are locked by P10b (`work_logs.payroll_period_id` exists since P7): `RateBasis::workLogsForPeriod` already pays only unlocked logs or the run's own.
  - The deduction schedule options (`lib/payroll/deductionSchedule.ts`) are only used by the group screens, not by the engine, so they were not ported. The engine allocates by the deduction types' own allocation settings.
  - Overtime types the three the browser knows (regular, night differential, rest day) get their own earning label; any other rate key of the company's table is labelled "Overtime Pay".
  - Not checked: a run on a big company (the engine runs one line at a time over arrays loaded for the whole period; fine for hundreds of employees; P10b should say when to move it to a queued job).
- Checks: php artisan test 259 (255 passed, 4 skipped); the golden parity passes on 162 lines.


### P9c - 2026-10-24
- Branch: backend/p09c-bonuses (pushed: no)
- Done:
  - Backend: `bonus_incentives` (type fixed amount, percentage, performance or output; target one employee, several, a department or everyone; amount, period label, taxable, one-time or recurring, payout through regular payroll or a separate payslip; status draft, pending, approved, rejected). A new bonus is a draft or goes straight to pending; submit moves a draft to pending; the decision uses the Approval kit (`Approval::decide`: locked row, only pending, 409 when already decided). Only a draft or pending bonus can be edited. The target must match its type and the employees must exist in the company (a percentage is at most 100). Endpoints `api/bonuses`: list, add, edit, submit, decision. `bonuses.view` to read and `bonuses.manage` to change and decide. Tests: 252 (248 pass, 4 skipped).
  - Frontend: `bonusApiService`; the Bonuses page (list, add, edit, submit, approve, reject) reads and writes the API with the real employees. The mock `bonusService` keeps only `getBonuses`. DemoSeeder: three bonuses (approved, pending, draft). `Notifier::decided` ignores a model it has no notice for (bonuses have no employee).
  - P9 is complete: benefits, deductions, loans and bonuses persist and the separation side effects run.
- Next: P10a, the payroll engine (`app/Payroll/`, port of `computeLine`, parity tests against `payroll-lines.json`). **Ask the owner first: apply the late policy as a deduction?** (It is configured but the TypeScript engine ignores it.) Then P10b, the runs. PLAN.md P10.
- Gotchas:
  - Bonuses send no notification yet: `Notifier` works per employee and a bonus often has many or none. Add it if the owner wants approvers told.
  - `payroll_admin` has no access to the employee records, so on the Bonuses page the recipients of a bonus show as 0 employees for that role (the employee list is empty for it). The company admin sees them. P10 can give payroll a slim employee list, as P8 did for statutory (`api/statutory/employees`).
  - The payroll engine still reads the mock bonuses by period label (see the ledger), so an approved bonus is not paid by a payroll run until P10.
  - Not browser-tested: the add, edit, submit and decision dialogs. Checked: the three demo bonuses load from the API.
- Checks: php artisan test 252 (248 passed, 4 skipped); tsc clean; build clean.


### P9b - 2026-10-23
- Branch: backend/p09b-loans (pushed: no)
- Done:
  - Backend: `loan_types` (the 7 built-in types are created on first use by `LoanDefaults`, as in the mock; a company can add its own, which gets a unique `custom_<label>` key; fixed or custom amounts; built-in types can be deactivated but not deleted, and a type a loan uses cannot be deleted either), `loans` (principal and monthly deduction, start date, status active, suspended, completed or cancelled) and `loan_repayments`, the ledger: the balance is the principal less the entries, nothing is edited in place. `LoanLedger::repay` takes an amount (never more than the balance) off a loan and completes it at zero; payroll calls it when a run finalizes (P10). Endpoints under `api/loans`: list with balance and repayment history, add one, add many of one type (a fixed type's amounts for everyone; skips anyone with a live loan of the type or a missing amount), edit terms (not the principal), pause, resume or cancel (completed and cancelled are final), and the type list, add, edit, delete. `loans.view` to read and `loans.manage` to change. Tests: 247 (243 pass, 4 skipped).
  - Frontend: `loanApiService`; the Loans and Loan Types tabs read and write the API with the real employees. The mock `loanTypeService` is deleted and the mock `loanService` keeps only `getLoans`. DemoSeeder: three loans, with four repayments between them.
- Next: P9c bonuses (`bonus_incentives`, the Approval kit: draft, pending, decided; payout through regular payroll or a separate payslip), then P10. PLAN.md P9.
- Gotchas:
  - No endpoint writes a repayment yet: payroll does (P10). Until then a loan's balance only changes through `LoanLedger::repay` (the seeder and the tests).
  - The payroll engine, payslips and the ESS loans page still read the mock loans (see the ledger), so the Loans tab and a payroll run disagree until P10.
  - A separation does not touch loans: the unpaid balance is for the final pay to settle (P10 or P3 follow-up).
  - Not browser-tested: the add, edit, pause and bulk dialogs. Checked: the Loans and Loan Types tabs load from the API.
- Checks: php artisan test 247 (243 passed, 4 skipped); tsc clean; build clean.


### P9a - 2026-10-22
- Branch: backend/p09-benefits-loans (pushed: no)
- Scope: P9 is split like P5. P9a is benefits and deductions; P9b is loans; P9c is bonuses. The PR is open after P9a, and P9b and P9c follow on a new branch from master.
- Done:
  - Backend: `benefit_plans` and `employee_benefits` (HMO is one plan per employee; a plan edit is copied onto the live enrolments, except a custom plan's per-employee amount; a transfer ends the old enrolment the day before the effective date and starts the new one on it; a plan with enrolled employees cannot be archived), `deduction_plans` and `employee_deductions` (recurring or one-time; `settled_in_period_id` is for the payroll run, P10). Endpoints `api/benefits` and `api/deductions`: list, add, edit or change status (pause, resume, cancel; a cancelled or completed record is final), plans (list, add, edit, archive), bulk enrol, bulk transfer. Permissions `loans.view` to read and `loans.manage` to change. `EndEmployeeBenefits` runs on a separation: benefits and recurring deductions end on the last day (history kept); one-time deductions stay for the final pay. Tests: 241 (237 pass, 4 skipped).
  - Frontend: `benefitsApiService` (same function names as the mock, no session argument) and TanStack hooks; the mock `benefitsService` is deleted. The Benefits, Allowances, Insurance, Other and Deductions tabs read and write the API. DemoSeeder: two HMO plans, a rice allowance, a cooperative savings plan and one one-time deduction.
- Next: P9b loans (`loan_types`, `loans`, `loan_repayments`, ledger pattern, the ESS loans page stays mock until P13), then P9c bonuses (Approval kit), then P10. PLAN.md P9.
- Gotchas:
  - Deduction plans are not versioned (the plan said versioned with `EffectiveDated`). The screens copy a plan edit to the live enrolments, so versions were not needed; add them if payroll needs the old amount for a past period.
  - The browser payroll engine (payroll runs, payslips, tax report) still reads the mock benefits and deductions (see the ledger), so a change here does not reach a payroll run until P10.
  - The Loans tab still reads the mock employees and loans (P9b).
  - Not browser-tested: enrol, transfer, edit and pause dialogs. Checked: the lists load from the API, the duplicate plan name is refused with the server message, and adding a plan works.
- Checks: php artisan test 241 (237 passed, 4 skipped); tsc clean; build clean.


### P8 - 2026-10-21
- Branch: backend/p08-statutory (pushed: no)
- Done:
  - Backend: four dated tables, `sss_brackets`, `philhealth_rates`, `pagibig_rates`, `tax_brackets` (one bracket table per pay period: annual, monthly, semi-monthly, weekly, daily). `company_id` null is the system default, created on first use (`StatutoryTables::ensureDefaults`, from the mock seed). `StatutoryTables::for(company, date)` resolves each table on its own: the company's latest row set starting on or before the date, else the system's. A save writes the company's rows for an effective date (today by default) and replaces a set saved for the same date, so an edit applies from its date and earlier dates keep their tables. `App\Payroll\Statutory\StatutoryCalculator` (port of `monthlyStatutoryFor`, same half-up rounding) and `App\Payroll\Tax\WithholdingTax` (port of `withholdingTax.ts`). Endpoints under `api/statutory`: show (tables for a date), update (any of the tables), preview (rows of monthly salary, frequency and periods per month to the figures), employees (active employees with pay only, because a payroll role cannot open the employee records). Tests: 233 (229 pass, 4 skipped): the calculator gives the browser engine's figures on all 68 golden rows, every golden tax table sample matches, and the seeded system tables equal the golden configuration.
  - Frontend: `statutoryApiService` and `useStatutoryConfig` (TanStack Query). The four cards save through the API, and the Employee Contributions tab asks the server to preview (it no longer calls `monthlyStatutoryFor`).
- Next: open the P8 PR, merge it, then start P9 (Benefits, loans, deductions, bonuses). PLAN.md P9.
- Gotchas:
  - **The seeded rates still have to be checked against the official 2026 SSS, PhilHealth, Pag-IBIG and BIR tables before release.** They are the mock's values (SSS 2025 schedule, PhilHealth 5% with a 10,000 floor and 100,000 ceiling, Pag-IBIG 2% up to 10,000, TRAIN tax tables).
  - The browser payroll engine (payroll runs, payslips) still reads the mock copy of the tables (see the ledger), so a table edit on the Statutory page does not change a payroll run until P10.
  - There is no effective date field on the Statutory screens yet: every save applies from today. The API already takes any date.
  - Not browser-tested: saving the SSS, PhilHealth or withholding tax cards (the Pag-IBIG save, the tables loading and the contributions tab were checked).
- Checks: php artisan test 233 (229 passed, 4 skipped); tsc clean; test:samples; test:golden 3 pass.


### P7 - 2026-10-20
- Branch: backend/p07-overtime (pushed: no)
- Done:
  - Backend: `overtime_records` (server computes the hours, also across midnight; the multiplier is copied from `overtime_rates` when filed, so a later rate edit does not change a filed record) and `work_logs` (hourly or output; the server sets rate and amount from the employee's pay; `payroll_period_id` locks a paid log). Both use the Approval kit and the employee scope, so a manager sees only their branch and an employee only their own. Endpoints: `api/overtime` (list, file, bulk decide) and `api/work-logs` (list, file, withdraw a pending one, bulk decide). Notifier: `notifications` table, `ApprovalNotice`, `Notifier`. A new pending request (leave, attendance adjustment, WFH, overtime, work log) notifies the people who can approve it (a manager only for their own branch, never the person who filed it); `Approval::decide` notifies whoever filed it and the employee after the commit. So P5 and P6 approvals are covered in one place. A WFH request of many dates notifies once. `api/notifications` (list with unread count, mark read, mark all read) and `api/approvals/summary` (pending count per type the user may approve). Tests: 226 (222 pass, 4 skipped).
  - Frontend: `overtimeApiService`, `workLogApiService`, `notificationApiService`. The Overtime page (list, file, approve, bulk, metric cards worked out from the loaded records, CSV export) and the Work and Output Approvals page read the API. The bell and the Notifications page show the stored notifications first (polled every 60 seconds, mark read and mark all read), then the few client-side reminders. The Approvals page has a "Waiting for you" strip: one tile per type with its count, linking to the screen. DemoSeeder: 4 overtime requests (2 pending), work logs for hourly or output employees if any exist, and the notices for the pending requests.
- Next: open the P7 PR, merge it, then start P8 (Statutory tables and withholding tax). PLAN.md P8.
- Gotchas:
  - The demo company has no hourly or output-based employee, so the work log list is empty until one is hired or edited that way.
  - Roles are seeded in the same process as DemoSeeder: the notices are sent at the end of `DemoSeeder::run` (users must belong to the company first, and the permission cache is cleared).
  - The period link ("Open Approvals" on a payroll period) still reads the mock payroll period (P10): it takes the date range from it and selects the real pending logs in that range, not by payroll group.
  - The ESS overtime page and the ESS work output page still use the mock (P13). An ESS application does not reach the API yet, but `api/overtime` and `api/work-logs` already accept an employee filing their own (404 for anyone else).
  - Overtime types in the new-request dialog are still the three that payroll can compute (regular, rest day, night differential). The API accepts any key of the company's rate table.
  - The "team absent" and "missing time" reminders still read the mock attendance.
  - Not browser-tested: filing overtime in the dialog, bulk decide, reject, the Approvals period link, a manager or employee login.
- Checks: php artisan test 226 (222 passed, 4 skipped); tsc clean; test:samples; test:golden 3 pass.


### P6 - 2026-10-19
- Branch: backend/p06-leave (pushed: no)
- Done:
  - Owner decisions (see the table): full credits at once, calendar year with pro-rating for the hire year, carry-over up to the type's maximum and the rest expires.
  - Backend: `leave_types` (paid or unpaid, default credits, max carry-over, credits per hierarchy tier), `leave_requests` (`days` computed by the server when filed), `leave_ledger` (grant, adjustment, used, reversal, expiry; balance = sum of entries; available = balance minus pending requests). `LeaveLedger` is the Ledger pattern; `LeavePlanner` works out the days (the employee's working days from `ScheduleResolver`, minus holidays; half days 0.5), overlaps (only an AM and a PM half day of one date may share it) and credits. Approving takes the days from the balance in the same transaction (Approval kit; refused with 409 when the balance is too low); cancelling an approved request writes a reversal. Endpoints under `api/leave`: types (list, add, edit), requests (list with range and status filters, preview, file, decide in bulk, cancel), balances, grant credits (add or set). Hiring grants the year's credits (also through the import); the employee's `benefits.leaveCreditsByType` is now read from the ledger, and editing it on the profile writes an adjustment. `leave:year-end` runs on 1 January 00:10 (carry-over, expiry, new year's credits; safe to repeat). Default leave types are created on first use (`LeaveDefaults`). Attendance: manual logging, WFH fill-in and the WFH preview now skip approved leave. Tests: 216 (212 pass, 4 skipped), including the year-end over three years.
  - Frontend: `leaveApiService` and `useLeaveData`; the Leave page (requests list with approve, reject, bulk and Cancel; file request with the server preview; Leave Types and Credits with Grant Credits; the team credits panel) and the leave overlay of Attendance, the roster and the biometrics import read the API. DemoSeeder: the default leave types, this year's credits for everyone and three requests.
- Next: open the P6 PR, merge it, then start P7 (Overtime, work logs, approvals inbox, notifications). PLAN.md P7.
- Gotchas:
  - The credits shown on a profile are the ledger balance (what is left), not the yearly allowance.
  - The ESS leave pages, dashboards, notifications, manager service, payroll and the leave reports still read the mock (see the ledger). An ESS request does not reach the API until P13.
  - Hierarchy tier still comes from the position title (Manager = executive; Supervisor or Team Lead = managerial; else rank and file), as the screens did.
  - A half-day leave also stops manual attendance logging for that date.
  - An approved leave does not change attendance records already logged; the attendance screens show On Leave from the leave data.
  - Not browser-tested: filing a request in the dialog, Cancel, Grant Credits, editing a leave type, the manager view.
- Checks: php artisan test 216 (212 passed, 4 skipped); tsc clean; test:samples 13 pass; test:golden 3 pass.


### P5b - 2026-10-18
- Branch: backend/p05b-wfh (pushed: no)
- Done:
  - Backend: `wfh_arrangements` (one row per employee; a bulk apply shares a batch id) and `companies.wfh_monthly_limit` (the old in-memory limit is now a company setting that only warns). `WfhPlanner` ports the rules: a temporary arrangement beats a standing one, the newest wins a tie; rest days, holidays and real punches are never changed. `WfhPlanner::materialize` fills the day's attendance (source wfh, auto-recorded) and takes over days an older arrangement filled when a newer one now decides them. Command `attendance:materialize-wfh` runs daily at 00:30 and also catches up the last 92 days; approving or applying an arrangement backfills at once. Endpoints: list, preview, apply (people with `attendance.adjust` save approved; an employee with `ess.view` can only ask for themselves, saved pending), cancel, end after a day, decide (approve or reject, on the Approval kit), set the monthly limit (`attendance.approve`). Tests: 203 (199 pass, 4 skipped).
  - Frontend: `wfhArrangementService` and `useWfh`; the WFH tab, Apply WFH dialog (server preview, overlaps, limit warning), approve and reject, End after, Cancel, the monthly limit field, the employee profile WFH card and the Import Biometrics WFH day lookup read the API. `wfhLimitStore` removed. DemoSeeder: two standing Wednesday arrangements.
- Next: open the P5b PR, merge it, then start P6 (Leave). PLAN.md P6.
- Gotchas:
  - The ESS WFH request page still uses the mock `wfhService`, so a request from ESS does not reach the API until Self-service (P13). The API already accepts it.
  - Leave is not checked yet when WFH is filled in or previewed (leave counts are 0 until P6).
  - A day that already has a real record (punch, hand-logged, adjustment) is never replaced by WFH, even by a later temporary arrangement.
  - Pending WFH decisions are gated on `attendance.adjust` (as the mock panel did), so a manager can decide their branch's requests.
  - Not browser-tested: Apply WFH dialog flow (the endpoints were driven with fetch), approve and reject, Cancel, the limit field, the manager view.
- Checks: php artisan test 203 (199 passed, 4 skipped); tsc clean; test:samples 13 pass; test:golden 3 pass.


### P5a - 2026-10-17
- Branch: backend/p05a-attendance (pushed: no)
- Done:
  - Backend: `attendance_records` (one row per employee per day; times, status, late and undertime minutes, work type, source, `auto_recorded` and `wfh_id` ready for P5b) and `attendance_adjustments`. `AttendanceStatusResolver` (port of `statusForPunch`, with night shifts handled; holiday check). The Approval kit: `Approval::decide` (locks the row, only a pending request can be decided) and `ConflictException` (409). `ApplyAttendanceAdjustment` rewrites the record in the same transaction and works the status out again from the schedule of that day. Endpoints: `GET api/attendance?date|from,to[,employee_id]`, `late-dates`, `POST log`, `POST biometrics` (rows as JSON on the Import kit, `dry_run`), adjustments list, store, bulk decide. Tests: 195 (191 pass, 4 skipped).
  - Frontend: `attendanceService` real functions (the old mock ones that other modules read stay); the Attendance page uses the real employees (`useAllEmployees`), branches, records, adjustments, late dates (the "Late #n" count now reads the API) and the real late policy; Log Attendance, File and Request Adjustment, approve and reject (single and bulk), and the Import Biometrics dialog (the browser still parses the files; the apply step posts normalized punches). `fetchSchedulesWithMembers` fills `assignedEmployeeIds` from each employee's default schedule so the review helpers work unchanged. The roster map for imports is now the API roster. DemoSeeder: ten days of punches.
- Next: open the P5a PR, merge it, then P5b (WFH): `wfh_arrangements` on the Approval kit, auto-approve for `attendance.adjust`, `attendance:materialize-wfh` and the backfill, the monthly limit as a company setting. PLAN.md P5b.
- Gotchas:
  - The WFH tab, Apply WFH and leave are still the mock, so WFH days and approved leave do not show on the page until P5b and P6.
  - The Daily table shows the records that exist; an employee with no record that day has no row (the mock did the same, except for leave).
  - The Import dialog compares against the last 366 days of records. The server takes 500 rows a request; the browser sends batches.
  - Night-shift undertime differs on purpose from the old client function: the end and an early-morning punch-out count on the next day.
  - Not browser-tested: the file picker and both import modes (the endpoint is covered by Pest), Request Adjustment from a row (hidden buttons in the pane), reject, bulk decide, the manager view, the Weekly and Monthly tab.
- Checks: php artisan test 195 (191 passed, 4 skipped); tsc clean; test:samples 13 pass; test:golden 3 pass.


### P4 - 2026-10-16
- Branch: backend/p04-schedules (pushed: no)
- Done:
  - Backend: `employees.work_schedule_id` (the default schedule) and a `shift_assignments` table (one row per employee per day; no schedule = rostered rest day; no row = not scheduled; unique on employee and date). `BelongsToEmployee` (first employee-owned scope, inherits the Employee scope: a manager's branch). `ScheduleResolver::for($employee, $date)`: roster entry, then the employee schedule, then the payroll group schedule; the last two rest on the days outside the schedule's working days. Endpoints: `GET api/schedules/templates|roster` (`schedules.view`), `POST api/schedules/roster`, `roster/clear`, `roster/copy-week` (`schedules.manage`; ids outside the user's scope are ignored; 20000 employee-days a request), `POST api/payroll-settings/work-schedules/{id}/employees` (default schedule, the same body as payroll group assign). A work schedule in use (employees, or upcoming roster days) cannot be deleted. Tests: 187 (183 pass, 4 skipped).
  - Frontend: `scheduleService` on the API; the roster hook reads the real employees (all pages), departments and branches; Assign shift, Clear and Copy last week write to the API; Teams tab sets supervisors through the Branches API; Work Schedules settings: Assign dialog (employees move between schedules) and real "N Assigned" counts. DemoSeeder: a default schedule per employee and this week's roster.
- Next: open the P4 PR, merge it, then start P5 (Attendance, adjustments, biometrics, WFH). PLAN.md P5.
- Gotchas:
  - Leave on the roster is still the mock, so approved leave does not show until Leave (P6).
  - The Teams tab shows no branch manager: the Branches API has no manager column yet.
  - The roster stores no per-day time overrides (PLAN had them as optional).
  - A schedule can be given to employees but not taken away without giving them another one (no "remove" in the Assign dialog).
  - `ScheduleResolver` is not called by anything yet; attendance (P5), working days (P6) and payroll (P10) use it.
  - Not browser-tested: copy last week, clearing a day, the manager view, deleting a schedule in use.
- Checks: php artisan test 187 (183 passed, 4 skipped); tsc clean; test:samples pass.


### P3b - 2026-10-15
- Branch: backend/p03b-employees-bulk (pushed: no)
- Done:
  - Backend: `POST api/employees/import` (rows as JSON, `dry_run`) on the new reusable `ImportKit` (validate, check, commit in one transaction, 500 rows max); bulk department, branch and status (`api/employees/bulk/*`); `employee_documents` table on the private disk (upload, delete, 5-minute signed link, `signed` download route; types and 5 MB limit); mixed compensation stored in `compensation.mixed` and in the pay-history row; hiring logic shared in `EmployeeHiring`. Tests: 174 pass, 4 skipped.
  - Frontend: Import dialog (the browser parses the CSV, the server does the dry-run preview and the duplicate check, then commits), bulk bar (department, branch, payroll group, deactivate, export) with row selection, Documents tab (upload, open, delete), mixed compensation read from the record (no more in-memory store), department supervisor picker on the Branches page, Assign employees for Payroll Groups (search the roster, assign; members removed from the group details).
- Next: open the P3b PR, merge it, then start P4 (Schedules and roster). PLAN.md P4.
- Gotchas:
  - Import now requires Birth Date, Contact Number and Address (the server needs them to hire); the sample file has them. Government and bank columns are dropped with a warning for roles that cannot edit them.
  - A mixed structure decides `basicPay` and `payType` (its base). A compensation update that does not send `mixed` keeps it; `mixed: null` clears it.
  - Bulk bar no longer has Assign Work Schedule, Add to Benefit Plan or Add to Recurring Deduction; they return with Schedules (P4) and Benefits (P9). Work schedule assign on the settings page is still disabled (P4).
  - The separation action sets the status and logs it. Ending recurring benefits and deductions on the last day is added in P9 (ledger: nothing to remove, it is new code).
  - Bulk payroll-group assign cannot clear a group (the endpoint assigns to one group); removal is per member in the group details.
  - Branch cards still show no employee lists and there is no branch manager column; the employee list filtered by branch does the job.
  - Not browser-tested: the file picker of the import dialog (the endpoint was driven with fetch: dry run, commit, duplicate), bulk branch, bulk deactivate, payroll group assign and remove dialogs, document delete, supervisor select change.
- Checks: php artisan test 174 passed, 4 skipped; tsc clean; test:samples 13 pass; test:golden 3 pass.

### P3a - 2026-10-14
- Branch: backend/p03-employees (pushed: no)
- Done:
  - Backend: `GET api/employees` (paginated, search, branch, department, status, payroll group, sort) with the new `ListQuery`; `GET api/employees/{id}` with change history and compensation history; `POST api/employees` (server hands out EMP-0001... under a row lock); one `PUT api/employees/{id}/{section}` per section behind its own capability (personal, employment, benefits: `employees.edit`; compensation, government, bank, status/separation: their own); `POST api/employees/{id}/account` (shares `UserInvites` with the Users tab). New `employee_compensations` table with the `EffectiveDated` trait (`effectiveOn($date)`), `companies.employee_sequence`, indexes on `employees`. Old `POST /employees` and `PUT /employees/{id}` removed. Tests: 162 pass, 4 skipped.
  - Frontend: list (server filters and paging), profile (all sections, status and separation, payroll group, create login, reset password), add dialog (now asks birth date, contact number and address because the server requires them), edit forms on the API. Branch transfer moved into the employment form.
  - Read access: `employees.view` can read branches, departments and payroll groups (the list filters and the profile need them).
- Next: open the P3a PR, merge it, then P3b in branch backend/p03b-employees-bulk (import kit with dry run, bulk department and status, documents on a private disk with signed URLs, mixed compensation into the record, SeparateEmployee ending benefits in P9, enable the Assign employees dialogs of Payroll Groups and Work Schedules).
- Gotchas:
  - Employee sections keep the camelCase of the stored JSON; only the top level is snake_case. `employeeService.toEmployee` converts with `camelizeKeys(..., SECTIONS)`.
  - Pay and bank fields are left out for roles without `employees.pay.view` (manager); `toEmployee` fills an empty shape so screens render.
  - A pay change needs a reason; effective date is today unless `effective_from` (never in the future) is sent; no change means no history row.
  - Department is still a name on the employee (decision in P2): a department rename updates the employees, a transfer creates the department in the new branch and drops the old supervisor seat.
  - The list drops "On Leave" and the Branch sort until Leave (P6) and a join are built; "Date hired" sort is "Date added" (created_at).
  - Other modules (attendance, payroll, reports ...) still read the mock employees, so their screens show nothing for the real employees until their phase. The Attendance tab and Work arrangement card on the profile are the same.
  - Import, bulk actions and the mixed-compensation store are not on the API yet (P3b); the Import button and the bulk bar are hidden.
  - Not browser-tested: separation dialog, reactivate, benefits, government and bank forms, branch transfer from the employment form, the manager view. Backend tests cover them.
- Checks: php artisan test 162 passed, 4 skipped; tsc clean; test:samples 13 pass; test:golden 3 pass.

### P2 - 2026-10-13
- Branch: backend/p02-branches-departments (pushed: no)
- Done:
  - Backend: `branch_departments` table, `BranchController` (list with headcount, create, update, delete blocked while employees exist, summaries), `BranchDepartmentController` (add, copy between branches, rename with cascade to employees, remove blocked while employees exist, set supervisor), `OnboardingController` (`GET api/onboarding`, computed). Routes in `routes/ops/branches.php`. Tests: 149 pass, 4 skipped.
  - Frontend: Branches page and Onboarding page on the API (`branchService`, `branchDepartmentService`, `onboardingService`, TanStack hooks in `features/branches/hooks/useBranches.ts`).
  - DemoSeeder: head office departments from the demo employees.
  - Checked in the browser as the demo company admin: list, add branch (and the duplicate-name 422), department remove refused with the server message, department rename with the employee count kept, onboarding checklist.
- Next: open the P2 PR, merge it, then start P3 (employees: list and record, sections, compensation history, import, lifecycle).
- Gotchas:
  - The Branches cards no longer list employees, and the branch manager, department supervisor, assign and transfer actions are gone from the screen until P3 (the mock employee IDs cannot be sent to the API). The backend supervisor endpoint (`PUT api/branch-departments/{id}/supervisor`) is done and tested; P3 adds the picker. There is no branch manager column yet (P3).
  - Onboarding `statutory` step is a stand-in: it checks that the government deductions exist and are on. P8 replaces it with the real statutory tables. `readyForPayroll` ignores the `users` step.
  - Consolidated Report gross and net pay are empty ("—") until payroll runs exist (P10).
  - Other screens (employee forms, schedules, import) still read departments and branches from the mock services, so a department added on the Branches page does not show there until P3.
- Checks: php artisan test 149 passed, 4 skipped; tsc clean; test:samples 13 pass; test:golden 3 pass.

### P1 - 2026-10-12
- Branch: backend/p01-company-setup (pushed: yes)
- Done:
  - Backend (commit 9ed1560): compensation types, compliance deadlines, payroll_admin read access, company info fields. Tests: 140 pass, 4 skipped.
  - Frontend: services, hooks and screens switched to the API (see the P1 section of PLAN.md). Rebuilt Payroll Group dialog, calendar from the server, Holidays tab with year selector and PH import, rates section on the API.
  - DemoSeeder: demo work schedules, 4 payroll groups, employees spread over the groups.
  - Checked in the browser as the demo company admin: company info save (and the 422 list), payroll group create, all payroll tabs, holidays import, calendar.
- Next: open the P1 PR, merge it, then start P2 (branches, departments, onboarding).
- Gotchas:
  - Settings now save to the database, but the mock payroll, attendance and reports modules still read the mock copy (ledger above). A setting changed here does not change what the mock payroll screens compute until their phase (P3 to P14). The overtime rates are the one exception: the mock store is filled from the saved rates.
  - Weekdays: the API uses 1 = Monday ... 7 = Sunday, the screens use 0 = Sunday ... 6 = Saturday. `payrollConfigService` converts both ways. The API calls two-week pay `bi_weekly`, the shared frontend types `biweekly`; the rules service converts the map keys.
  - Logo files need `php artisan storage:link` (public/storage) locally; the Dockerfile autorun already does it on deploy.
  - Company info: the server requires the company email and type; a company created by a seeder without an email must fill it before the first save.
  - Not browser-tested: weekly and bi-weekly group dialogs, work schedule dialog, compensation type and compliance dialogs, logo upload (covered by backend tests and tsc only).
- Checks: php artisan test 136 passed, 4 skipped; tsc clean; test:samples 13 pass; test:golden pass.

### P0 - 2026-10-12
- Branch: backend/p00-foundation (pushed: see PR column above)
- Done:
  - Route groups moved from routes/web.php into routes/ops/{employees,payroll-settings,holidays,company-info,activity-logs,permission-map,users}.php (46 api routes, same names). New module = new file plus one name in the list in web.php.
  - Pest helpers companyUser() and otherCompany() in tests/Pest.php. tests/Feature/RouteGuardTest.php fails if any api/* route lacks auth, active or a permission, or an ops page lacks a permission.
  - Model::preventLazyLoading outside production (no violations found).
  - Defects fixed: inactive users cannot log in (Fortify authenticateUsing) and settings/* has the active middleware; registration removed; profile.view added to company_admin, super_admin and manager (Capabilities.php and ops/lib/rbac/permissions.ts).
  - Frontend: @tanstack/react-query, one queryClient (lib/api/queryClient.ts), provider in OpsPage.tsx, useUsers.ts is the reference hook. usePermission, RequireCapability and the sidebar read auth.permissions through hooks/useCapabilities.ts.
  - Golden fixtures in tests/Fixtures/golden/ (statutory, payroll-runs with inputs, thirteenth-month), written by tests/js/golden/golden.test.ts with a pinned date (2026-10-12), TZ Asia/Manila and a counter for crypto.randomUUID. `npm run test:golden` checks the TS engine still reproduces them; refresh only with `GOLDEN_WRITE=1 npx vp test run` (rule R6: not after P0).
- Next: P1 (done: PR #3 merged to master).
- Gotchas:
  - Baseline lint debt that is NOT from P0: `vendor/bin/pint --test` fails on 15 older files, `vendor/bin/phpstan analyse` reports 81 errors, and `npm run check` reports formatting issues in all 502 files (CRLF checkout). The checks in the definition of done mean: no new issues in files the phase touches. Clean the rest in P17 or when a phase touches the file.
  - A fresh worktree has no vendor/, node_modules/, .env or public/build. Run: composer install, npm ci, copy .env from the main checkout, npm run build (Pest renders the Vite manifest).
  - Skipped tests: 4 two-factor tests (defect 5, P17). Wayfinder files in resources/js/actions are generated and git-ignored.
  - My Profile now shows for admins who have no employee record; P13 must handle the empty case.
- Checks: php artisan test 121 passed, 4 skipped; tsc clean; test:samples and test:golden pass; app clicked through (login, sidebar, Users and Permission Map tabs).

### Plan - 2026-10-12
- Branch: claude/backend-integration-plan-13abf5
- Done: PLAN.md and PROGRESS.md written from a scan of `master` at `7cac2ef`.
- Next: owner reviews D5 (TanStack Query) and D6 (resources emit the `domain.ts` shape), then start P0 in a new worktree.
- Gotchas: the TS payroll engine imports `@ops/*` aliases, so the P0 golden exporter must run through Vitest (`npx vp test`), not plain `node --test`.
