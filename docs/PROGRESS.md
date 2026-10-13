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
| P3 | Employees (a, b) | in progress: P3a merged (#6), P3b in review | backend/p03-employees, backend/p03b-employees-bulk | #6 (P3a) | 2026-10-13 (P3a) |
| P4 | Schedules and roster | not started | | | |
| P5 | Attendance, adjustments, biometrics, WFH (a, b) | not started | | | |
| P6 | Leave | not started | | | |
| P7 | Overtime, work logs, approvals inbox, notifications | not started | | | |
| P8 | Statutory tables and withholding tax | not started | | | |
| P9 | Benefits, loans, deductions, bonuses | not started | | | |
| P10 | Payroll engine and runs (a, b) | not started | | | |
| P11 | Payslips, PDF, email | not started | | | |
| P12 | 13th month and separate bonus payslips | not started | | | |
| P13 | Employee and manager self-service | not started | | | |
| P14 | Dashboards, reports, tax compliance | not started | | | |
| P15 | Platform and subscriptions | not started | | | |
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
| 2026-10-12 | P0 | Give company_admin, super_admin and manager `profile.view`? | Yes, on the server and in the client copy. `ess.view` was not added to admins. |

## Mock-removal ledger

Mock code that a phase could not delete because a not-yet-migrated mock module still imports it (PLAN.md rule R1). Each row carries a `// mock: remove in Pxx` comment in the code. P17 must leave this table empty.

| Mock code (file:function) | Still imported by | Remove in | Added in |
|---|---|---|---|
| `companyService`: getCompany, getSchedules, getHolidays, addEmployeesToSchedule | attendance, schedules, onboarding, employees, company-settings (dead dialogs) | P2 (company), P4 (schedules), P5 (holidays in attendance) | P1 |
| `payrollSettingsService`: getPayrollGroups, getCompensationTypes, getDeductionConfigs, getPayrollRules | payroll, payslips, loans-deductions, attendance (late counting), reports | P9 (deductions), P10 (groups, rules, compensation) | P1 |
| `features/company-settings/components/payroll/AssignEmployeesDialog.tsx` (generic, for work schedules) | nothing (kept to be rewired on the API) | P4 | P1 |
| `mock-data/seed`: companies, payrollGroups, schedules, holidays, earningConfigs, deductionConfigs, compensationTypes, payrollRules, complianceDeadlines | the mock services above and the mock payroll engine | with the services above | P1 |
| `useTenant` (mock company) | layout, dashboards | P14 | P1 |
| `branchService`: getBranches; `branchDepartmentService`: getBranchDepartments, addBranchDepartment, ensureBranchDepartment, setDepartmentSupervisor, releaseSupervisorIfMoved | schedules (teams, roster), integrations, `employeeService.createEmployee` | P4 (schedules), P16 (integrations) | P2 |
| `employeeService`: getEmployees, getEmployee, getEmployeeIdsOnLeaveToday, updateEmployeeSelf; createEmployee | attendance, payroll, payslips, reports, leave, loans, bonuses, overtime, statutory, ESS, integrations (CSV import creates employees) | P4-P14 (getEmployees in each module); P13 (self service); P16 (createEmployee) | P3a |
| `features/employees/hooks/useEmployees.ts`, `useEmployee.ts` (mock hooks) | the modules above | with the modules above | P3a |

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
