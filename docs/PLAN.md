# Backend Integration Plan (OPS)

Replace the in-memory mock data in the ops frontend with a real Laravel backend, one module per phase, built from a small set of reusable building blocks.

- **Written:** 2026-10-12, from a scan of `master` at `7cac2ef`.
- **Progress and handoff notes:** [PROGRESS.md](PROGRESS.md). Read it first when you resume.
- **Tracker mapping:** phase IDs map to tasks T01-T23 and stories US01-US46 in `Claude outputs/FBS Pay Progress Tracker 2.xlsx`.

## Contents

1. [Locked decisions](#1-locked-decisions)
2. [Baseline (what exists today)](#2-baseline-what-exists-today)
3. [How to work a phase (worktree workflow)](#3-how-to-work-a-phase-worktree-workflow)
4. [API contract and conventions](#4-api-contract-and-conventions)
5. [Reusable building blocks](#5-reusable-building-blocks)
6. [Phases](#6-phases)
7. [Cross-phase rules and risks](#7-cross-phase-rules-and-risks)

---

## 1. Locked decisions

Decided by the project owner on 2026-10-12. Do not reopen them without asking.

| # | Decision | Consequence |
|---|---|---|
| D1 | **The payroll engine is ported to PHP.** The server is the source of truth. | The TS engine (`lib/services/payrollService.ts`, `lib/payroll/*`, `thirteenthMonthService.ts`) is the reference for golden parity tests. It is deleted once the PHP engine matches it. Finalized runs are stored and locked. |
| D2 | **Mock data is deleted per module.** | When a module's API ships, its mock service code goes in the same phase. Demo data moves to Laravel seeders (`DemoSeeder`). See rule R1 for mock code that other mock modules still read. |
| D3 | **One branch, worktree and PR per phase**, branched from `master`. | Each phase merges to `master` before the next one starts. This plan and PROGRESS.md live in the repo so any session can resume. |
| D4 | **Full scope:** platform and subscriptions, integrations, payslip PDF and email, and notifications are all in. | Phases P15 and P16 exist; P7 and P11 include notifications and PDF/email. |

Proposed defaults. They apply unless the owner overrides them before Phase 0 starts.

| # | Default | Why |
|---|---|---|
| D5 | **TanStack Query** for frontend data fetching. | 25 modules need caching and cross-screen refresh. Two hacks exist only because there is no cache invalidation: the zustand `useSubscriptionVersion` counter and the module-level WFH `version` counter. The sister projects already use TanStack Query 5 (see `reusable-components-in-all-projects.md`). |
| D6 | **The UI gets the shape of `resources/js/ops/types/domain.ts`**: camelCase keys and string IDs. The conversion happens at the service boundary with `camelizeKeys` / `snakeizeKeys` (`lib/api/case.ts`, added in P1), not with one hand-written mapper per entity. | New endpoints emit snake_case JSON like the existing ones; the service converts it. A hand-written mapper is only for entities whose shape really differs (company info, P1). Pagination `meta` and query parameters keep Laravel's snake_case. |

Changed on 2026-10-12 (P1): D6 first said the API resources themselves would emit camelCase. The existing Settings endpoints were already snake_case with tests, so the converter in the service is the smaller change and keeps every endpoint consistent.

## 2. Baseline (what exists today)

**Backend that is live and used by the frontend**

- Fortify: login, forgot password, reset password, logout.
- Users, Permission Map and Activity Log (`api/users`, `api/permission-map`, `api/activity-logs`), used by `lib/services/userAccessService.ts`.

**Backend that is built but has no frontend caller yet**

- `api/company-info` (with logo upload)
- `api/holidays` (with import of PH defaults)
- `api/payroll-settings/*`: payroll groups (with calendar and member assignment), earnings, deductions, overtime and holiday rates, payroll rules (with late policy), work schedules
- `POST /employees`, `PUT /employees/{employee}`

**Frontend**

- 29 of 30 services in `resources/js/ops/lib/services` are mock. Only `userAccessService` is real.
- The mock store is one in-memory object (`mock-data/index.ts`, 31 arrays). It is not persisted. Reads return live references that some components mutate.
- Four zustand stores also hold data outside the mock store: `payrollRatesStore`, `otApplicationStore`, `mixedCompensationStore`, `wfhLimitStore`.
- Hooks follow a `useState` + `useEffect` + `refetch` pattern (for example `features/employees/hooks/useEmployees.ts`). The API version is `features/user-access/hooks/useUsers.ts`.
- 30 service exports are synchronous. They need async signatures (or a server field) before they can call the API.
- The client session is a mock: `syncMockSession` in `OpsPage.tsx` maps the Laravel user to a mock seed user. The Inertia props `auth.permissions` and `auth.company` are shared but not read.

**Tests (baseline 2026-10-08):** Pest has 47 tests (43 pass, 4 skipped 2FA tests). `tsc` is clean. Node sample tests live in `tests/js`.

**Gaps in the client logic that the backend must fill (they are not ports):**

- Leave accrual and carry-over: settings are stored but never applied.
- Late deduction: the late policy is configured but the payroll engine ignores it.
- Output-based pay uses a made-up quantity (`mockOutputQuantity`, `lib/payroll/rateBasis.ts:42`).
- The admin dashboard shows made-up figures (`dashboardService.ts:149`).
- Notifications are derived from pending counts; there is no stored read/unread state.

## 3. How to work a phase (worktree workflow)

### Start a phase

1. Make sure the previous phase's PR is merged to `master`.
2. Open a new Claude Code session with a worktree (the desktop app creates one under `.claude/worktrees/`), or create one by hand:

   ```bash
   git fetch origin
   git worktree add .claude/worktrees/p03-employees -b backend/p03-employees origin/master
   ```

3. Tell Claude: `Start backend integration phase P03. Follow docs/PLAN.md and PROGRESS.md.`
4. In PROGRESS.md, set the phase status to `in progress` and record the branch name.

### While working

- Commit after every finished sub-step and push the branch early. A crash then costs one sub-step at most.
- After each commit, update the phase's handoff note in PROGRESS.md: what is done, the next step, and any gotchas.
- Large phases (marked XL) are split into parts `a` and `b`. Each part can be its own PR.

### Resume after an interruption

1. List worktrees and branches: `git worktree list`, `git branch -r | grep backend/`.
2. Read PROGRESS.md: the phase status, the branch, and the last handoff note.
3. Open a session in that worktree (or re-create it from the pushed branch) and tell Claude: `Resume backend integration phase P03 from the PROGRESS.md handoff note.`

### Definition of done (every phase)

- [ ] `php artisan test` is green.
- [ ] Pint and Larastan report no new issues in the files the phase touches (`vendor/bin/pint <files>`, `vendor/bin/phpstan analyse`). Older files have baseline debt, see the P0 handoff note in PROGRESS.md.
- [ ] `npm run types:check`, `npm run test:samples` and `npm run test:golden` pass.
- [ ] Every new endpoint has a feature test for: the happy path, validation (422), missing capability (403) and another company's row (404).
- [ ] The module's screens call the API. The module's mock service code is deleted (except code listed in the mock-removal ledger, rule R1).
- [ ] `DemoSeeder` covers the module, so a fresh `php artisan migrate:fresh --seed` demo still shows realistic data.
- [ ] The app was clicked through in the browser for the module's main flows.
- [ ] PROGRESS.md is updated and the PR to `master` is opened.

## 4. API contract and conventions

These rules apply to every phase. The existing Holidays and Users modules are the closest examples.

### Backend

| Topic | Rule |
|---|---|
| Routes | One file per module in `routes/ops/<module>.php`, required inside the `auth`, `verified`, `active` group in `routes/web.php`. Prefix `api/<module>`, route names `<module>.<action>`. Per-module files keep parallel phase branches from conflicting in one big `web.php`. |
| Auth | Session auth (same origin, CSRF via the `XSRF-TOKEN` cookie). The `api/` prefix makes errors render as JSON. Token auth exists only for external integrations (P16). |
| Capabilities | Spatie `permission:<cap>` middleware on the route or group. Capabilities come from `app/Support/Capabilities.php`. Row-level rules (manager's own team only, cannot approve own request) go in a Policy. |
| Tenancy | Every company-owned model uses `BelongsToCompany`. Employee-owned rows use `BelongsToEmployee` (built in P4). Never accept `company_id` from input. Another company's row is a 404 through route-model binding. |
| Writes | A FormRequest per write (`Store<X>Request`, `Update<X>Request`) with a method that maps input to columns, like `HolidayRequest::holidayData()`. |
| Logic | Plain CRUD stays in the controller. Workflows that touch several models (approve, finalize, import, separate) go in an action class `app/Actions/<Module>/<Verb><Noun>.php` with one `handle()` method, so controllers, jobs, commands and tests share it. Calculation engines are pure classes (no DB access) under `app/Payroll/`. |
| Output | `JsonResource` only, never a raw model. Keys are camelCase and match `types/domain.ts` (D6). IDs and foreign keys are strings. Money is a number with 2 decimals. Dates are `YYYY-MM-DD`; timestamps are ISO 8601. When the UI needs to know what the user may do, add `can: {...}` flags from policies (see `UserResource`). |
| Lists | Paginated with Laravel's `{data, links, meta}`. Query parameters: `search`, `sort`, `direction`, `per_page`, `page`, plus module filters. Use `ListQuery` (built in P3). |
| Errors | 422 `{message, errors}` for validation. 403 for a missing capability. 404 for a missing or foreign row. 409 for a state conflict, such as editing a finalized run (`ConflictException`, built in P5). |
| Audit | Call `ActivityLogger::log(...)` after every successful write. |
| Money | Columns are `decimal(12,2)`. The engines compute with PHP floats and round with the same helper at the same steps as the TS engine. Watch out: JS `Math.round` rounds .5 toward +∞ and PHP `round` rounds away from zero, so they differ on negative halves. Port the TS `round2` exactly. |
| Migrations | Forward-only, one migration per change, with a working `down()`. Add indexes for every foreign key and every column used as a list filter. |

### Frontend

| Topic | Rule |
|---|---|
| Services | Keep each `lib/services/<x>Service.ts` and its exported function names. Swap the body for `api.*` from `lib/api/http.ts`. Drop the `user` argument once the server scopes the data. |
| Types | Keep `types/domain.ts` as the contract. API responses already match it (D6), so there are no mappers. |
| Fetching | TanStack Query (D5). Hooks stay in `features/<module>/hooks/`. Query keys start with the module name, for example `['employees', filters]`. A mutation invalidates its module key. The reference implementation is `features/user-access/hooks/useUsers.ts` (converted in P0). |
| Forms | Show 422 field errors with `fieldErrors(error)` (added to `http.ts` in P1). Show other errors with `apiErrorMessage`. Confirm success with the existing toasts. |
| Uploads | `api.upload(path, formData)` (added to `http.ts` in P1). |
| Permissions | `usePermission` and the sidebar read `auth.permissions` from the Inertia props (P0). The server is the only source of truth. |
| Client logic | Keep a calculation in the browser only for instant UI feedback, such as a form preview. The server recomputes it and its answer wins. |

## 5. Reusable building blocks

Each block is built in the first phase that needs it, not in advance, and then reused. Do not build a block "for later".

| Block | What it is | Built in | Reused in |
|---|---|---|---|
| Module route files | `routes/ops/<module>.php` | P0 | all |
| Pest helpers | `companyUser($role, $company = null)`, `otherCompany()` in `tests/Pest.php` | P0 | all |
| Route guard test | One test that walks `Route::getRoutes()` and fails if any `api/*` route lacks `auth`, `active` or a `permission:` middleware. New routes are covered automatically. | P0 | all |
| Lazy-loading guard | `Model::preventLazyLoading(! app()->isProduction())` | P0 | all |
| Query client + hook pattern | `QueryClientProvider` in `OpsPage.tsx`; `useUsers` converted as the reference | P0 | all frontend phases |
| Server permissions on the client | `usePermission` reads `auth.permissions` | P0 | all |
| Golden fixtures | JSON snapshots of the TS engine's inputs and outputs, taken before any mock is deleted | P0 | P8, P10, P12 parity tests |
| `api.upload`, `fieldErrors` | Additions to `lib/api/http.ts` | P1 | P3 documents, P15 payment proof |
| `ListQuery` | `App\Support\ListQuery::apply($query, $filters, sortable: [...], searchable: [...])`: validated search, sort and paginate | P3 | every list endpoint |
| `EffectiveDated` | Trait with `effective_from` / `effective_to` columns and `scopeEffectiveOn($date)` | P3 (compensation history) | P8 statutory tables, P9 deduction plan versions |
| Import kit | Rows arrive as JSON (the browser already parses the files). Each row is validated; `dry_run=1` returns `{valid, invalid: [{row, errors}]}`; the commit runs in one transaction. | P3 (employees) | P5 biometrics, P9 bulk loans, P16 CSV import |
| `BelongsToEmployee` | Global scope `whereIn('employee_id', Employee::select('id'))`. It inherits the Employee scope: a manager sees their branch and an employee sees only themselves. | P4 | P5-P13 |
| `ScheduleResolver` | Resolves the schedule for an employee on a date: shift assignment, then the employee's schedule, then the payroll group's schedule. | P4 | P5 attendance, P6 working days, P10 payroll, P12 13th month |
| Approval kit | `ApprovalStatus` enum; `approvalColumns()` Blueprint macro (`status`, `decided_by`, `decided_at`, `decision_remarks`); `Approvable` trait (`pending()` scope, `decide()`); `DecisionRequest`; one `ApprovalService::decide()` that checks the policy, logs and (from P7) notifies; routes `POST {id}/decision` and bulk `POST decisions` | P5 (attendance adjustments) | P5 WFH, P6 leave, P7 OT and work logs, P9 bonuses, P15 plan payments |
| `ConflictException` | Renders 409 with a message (registered in `bootstrap/app.php`) | P5 | P6, P10, P12 |
| Ledger | Append-only balance entries (`grant`, `accrual`, `usage`, `reversal`, ...); balance = sum of entries | P6 (leave credits) | P9 loan repayments |
| Notifier | Laravel database notifications, sent from `ApprovalService`; `api/notifications` (list, mark read, mark all read) | P7 | P10 payroll approvals, P11, P15 |
| Payslip document | Blade template rendered to PDF; a queued mail with a delivery status table | P11 | P12 13th month and bonus payslips |
| Plan config | `config/plans.php` (tiers, limits, prices), shared through Inertia props, plus a `plan:<feature>` middleware | P15 | P16 |

## 6. Phases

Size: S = up to 2 days, M = 3-5 days, L = 6-10 days, XL = more than 10 days (split into parts a and b).

| Phase | Name | Tracker | Size | Depends on |
|---|---|---|---|---|
| P0 | Foundation and golden snapshot | T02, T03 | M | - |
| P1 | Company setup wiring | T05 | M | P0 |
| P2 | Branches, departments, onboarding | T06 | M | P1 |
| P3 | Employees | T07 | XL | P2 |
| P4 | Schedules and roster | T09 | M | P3 |
| P5 | Attendance, adjustments, biometrics, WFH | T08 | XL | P4 |
| P6 | Leave | T10 | L | P5 |
| P7 | Overtime, work logs, approvals inbox, notifications | T11, T12, T18 | L | P6 |
| P8 | Statutory tables and withholding tax | T17 | M | P0 |
| P9 | Benefits, loans, deductions, bonuses | T13, T16 | L | P3, P8 |
| P10 | Payroll engine and runs | T14 | XL | P5-P9 |
| P11 | Payslips, PDF, email | T15 | M | P10 |
| P12 | 13th month and separate bonus payslips | T16 | L | P10, P11 |
| P13 | Employee and manager self-service | T19 | M | P5-P12 |
| P14 | Dashboards, reports, tax compliance | T18 | L | P10-P12 |
| P15 | Platform and subscriptions | T20 | L | P0 |
| P16 | Integrations (API keys, webhooks) | T21 | M | P3, P10 |
| P17 | Mock removal and hardening | T22 | M | all |

P8 and P15 depend only on P0, so they can run in parallel with the P3-P7 chain if a second person is available.

Each phase below lists: goal, backend work, frontend work, blocks built or reused, decisions to confirm with the owner, and when it is done.

---

### P0. Foundation and golden snapshot (M)

**Goal:** the shared tools every later phase uses, plus a snapshot of the TS engine before anything is deleted. No visible behavior change.

Backend:
1. Move the `api/*` route groups from `routes/web.php` into `routes/ops/{users,activity-logs,permission-map,company-info,holidays,payroll-settings,employees}.php`. This is a pure move; the route names stay the same.
2. Add the Pest helpers and the route guard test (section 5).
3. Add `Model::preventLazyLoading(! app()->isProduction())` in `AppServiceProvider`. Fix any lazy load the existing tests expose.
4. Fix the known defects that block integration (check each is still true first):
   - company_admin and super_admin lack `profile.view` and `ess.view`; manager lacks `profile.view`.
   - The `active` check is missing at login and on `settings/*`.
   - Open registration creates a user with no role or company. **Confirm with the owner:** turn off Fortify registration (companies are created by the super admin in P15)?

Frontend:
1. Install `@tanstack/react-query`. Add `QueryClientProvider` in `OpsPage.tsx`.
2. Convert `features/user-access/hooks/useUsers.ts` to `useQuery` / `useMutation`. It becomes the reference hook.
3. Make `usePermission`, the guards in `lib/rbac/guards.tsx` and the sidebar read `auth.permissions` from the Inertia props. Keep `syncMockSession` only to give mock services a mock company and user until P17.

Golden snapshot:
1. Write an exporter, run with Vitest through `npx vp test` (vite-plus resolves the `@ops` alias). It writes JSON to `tests/Fixtures/golden/`:
   - `statutory.json`: `monthlyStatutoryFor` and `withholdingTaxOn` over a grid of salaries and every pay frequency.
   - `payroll-lines.json`: runs `seedSamplePayrollRuns` and stores each line's inputs (employee, period, attendance, OT, leave, loans, benefits, deductions, bonuses, rules, statutory config) and outputs.
   - `thirteenth-month.json`: `computeThirteenthMonthLine` over the seeded employees.
2. Commit the fixtures. From now on they are the parity target, even after the mock data is gone.

Done when: all existing tests pass, the route guard test passes, the fixtures are committed, and Users & Access works through TanStack Query.

---

### P1. Company setup wiring (M)

**Goal:** Company & Payroll Settings use the existing APIs. Stories US06, US07.

Owner decisions (2026-10-12): **backend leads** for Payroll Groups (the dialog is rebuilt with real cutoff and pay-date pickers; the calendar comes from the server; daily and custom frequencies are dropped; a group points at a Compensation Type record). **Assigning employees** to a payroll group or work schedule is disabled until the Employees (P3) and Schedules (P4) modules, because the mock employee IDs cannot be sent to the real API.

Backend (done):
- New `compensation_types` table and CRUD; `payroll_groups.compensation_type_id` replaces the fixed four-value enum.
- New `compliance_deadlines` table and CRUD with built-in government defaults (built-in rows can be edited and switched off, only custom ones deleted).
- Payroll admins open the page and read company info and holidays; only `settings.company.edit` writes.
- Company info response carries plan, timezone, payroll frequency and created date; the Inertia shared `auth.company` carries the brand colour.
- `DemoSeeder` creates the demo work schedules, payroll groups and group membership.
- Existing endpoints keep their snake_case shape (see D6).

Frontend (done):
- New services: `companyInfoService`, `holidayService`, `payrollConfigService` (earnings, deductions, compensation types, rates, rules, work schedules, deadlines), `payrollGroupService`. Types in `features/company-settings/types.ts`.
- `useCompanySettings` is a set of TanStack queries; a save invalidates the whole `company-settings` key.
- Holidays tab: year selector, "Import PH holidays", add, delete.
- The overtime rates store is filled from the saved rates so the mock overtime screens see them.
- The company theme is read from the page props, so a saved brand colour applies everywhere.
- The mock functions that nothing else reads were deleted. The rest stay (mock-removal ledger in PROGRESS.md).

Done when: every Company Settings tab saves to the database and survives a page reload.

---

### P2. Branches, departments, onboarding (M)

**Goal:** Branch CRUD, departments per branch with supervisors, and the onboarding checklist. Story US08.

Backend:
- Branch CRUD on the existing `branches` table and `Branch` model, under `branches.manage`.
- New `branch_departments` table (`branch_id`, `name`, `supervisor_employee_id` nullable), with add, copy between branches, rename, remove (blocked while it has employees) and set supervisor.
- Department stays a name on the employee for now (owner decision 2026-10-13): a rename updates the employees in that branch, a delete is blocked while any employee has the name. P3 replaces the string with a `department_id` foreign key.
- `GET api/onboarding`: a checklist computed from the data (company info complete, at least one branch, a payroll group, a work schedule, employees, holidays imported, statutory set) with `readyForPayroll`. No new table.
- Branch summaries (`getBranchSummaries`) return headcount now. Latest-run totals return `null` until P10; mark that with a `shortcut:` comment.

Frontend (done): `branchService`, `branchDepartmentService`, `onboardingService`, the Branches page and the Onboarding page. The branch cards show headcount and departments; the employee lists, branch manager, department supervisor and assign/transfer actions come back in P3.

Done when: branches and departments persist, and the checklist reflects real data.

---

### P3. Employees (XL)

**Goal:** the employee record end to end. Stories US09-US12. This also fixes defect 2: the finer `employees.*.edit` capabilities are not enforced today.

**P3a: record and list**
- `GET api/employees` with `ListQuery`: search, branch, department, status, payroll group; paginated. Build `ListQuery` here.
- `GET api/employees/{id}`. The resource hides compensation and bank fields unless the user has `employees.pay.view`.
- Section updates, each behind its own capability:

  | Section | Capability |
  |---|---|
  | Personal, employment | `employees.edit` |
  | Compensation | `employees.compensation.edit` |
  | Government IDs | `employees.government.edit` |
  | Bank | `employees.bank.edit` |
  | Status / separation | `employees.separate` |

- Move the existing `POST /employees` and `PUT /employees/{employee}` to `api/employees` and delete the old routes.
- Employee number sequence per company, incremented under a row lock.
- Compensation history: a new `employee_compensations` table (`effective_from`, `rate_type`, `basic_rate`, `allowances` JSON, `reason`, `changed_by`). Build `EffectiveDated` here. A pay change writes a new row; payroll later reads the row effective on each date.
- Change history (`AuditEntry` in `domain.ts`) is read from `activity_logs` by subject. No new table.
- Add indexes on `employees.branch_id`, `employees.status` and `employees.payroll_group_id` (defect 6).
- Create a login for an employee: `POST api/employees/{id}/account`, reusing the invite flow from `UserController`.

**P3a status:** merged (PR #6). **P3b status:** done in branch `backend/p03b-employees-bulk` (see PROGRESS.md). Not done: ending benefits and deductions on separation (P9) and the work-schedule assign (P4).

**P3b: bulk, import, documents**
- Import: build the Import kit. The browser keeps parsing files (`lib/payroll/employeeImport.ts`) and posts rows as JSON; the server validates, previews with `dry_run=1` and commits.
- Bulk department and bulk status changes.
- Documents: new `employee_documents` table on a private disk, downloaded through a temporary signed URL.
- `mixedCompensationStore` becomes part of the compensation record.
- `SeparateEmployee` action: sets the status and logs it. Ending benefits and deductions is added in P9 (record it in the ledger).

Frontend: `employeeService`, `useEmployees`, the profile tabs, the add and import dialogs, bulk actions, `mixedCompensationStore`, and `userService.getUsers` (switch it to `api/users`).

Done when: an HR admin can create, edit, import and separate employees; each capability is enforced on the server; and a manager sees only their branch.

---

### P4. Schedules and roster (M)

**Goal:** shift templates, the roster, and teams. Stories US16, US17.

Backend:
- Shift templates are the existing `work_schedules`. Add `employees.work_schedule_id` as the default schedule.
- New `shift_assignments` table (`employee_id`, `date`, `work_schedule_id` nullable, `is_rest_day`, optional time overrides), unique on (`employee_id`, `date`).
- Endpoints: the roster map for a date range; bulk assign, clear and copy week.
- Build `BelongsToEmployee` (first employee-owned table) and `ScheduleResolver`.
- Teams use department supervisors from P2. Approvals route to them from P5 on.

Frontend: `scheduleService`, and the schedule parts of `companyService` that P1 did not cover.

Done when: the roster persists, and `ScheduleResolver` is unit-tested on its precedence order.

**P4 status:** done in branch `backend/p04-schedules` (see PROGRESS.md). Not done: per-day time overrides, leave on the roster (P6).

---

### P5. Attendance, adjustments, biometrics, WFH (XL)

**Goal:** daily attendance with corrections and imports. Stories US13-US15.

**P5a: records, adjustments, biometrics**
- New `attendance_records` table (`employee_id`, `date`, `time_in`, `time_out`, `status`, `late_minutes`, `undertime_minutes`, `source` = manual, biometric, wfh or adjustment, `remarks`), unique on (`employee_id`, `date`).
- `AttendanceStatusResolver`: port `lib/attendance/status.ts` `statusForPunch` plus the holiday, rest day and leave precedence. Reuse the cases in `tests/js/biometricsSamples.test.mts` as PHP tests.
- Endpoints: list by date, range or employee; log attendance (skip rest days and holidays as the mock does).
- Biometrics: the browser keeps parsing the files (`features/attendance/biometricsImport.ts`: ZKTeco, GLog, CSV, FBS template) and posts normalized punches. The server uses the Import kit: `dry_run` preview, unmatched rows reported, commit.
- Adjustments: new `attendance_adjustments` table. Build the Approval kit and `ConflictException` here. Approving one updates the attendance record in the same transaction (`ApplyAttendanceAdjustment` action).

**P5b: work from home**
- New `wfh_arrangements` table (reuses the Approval kit). Auto-approve when the filer has `attendance.adjust`, as the mock does.
- WFH attendance rows: a daily scheduled command `attendance:materialize-wfh`, plus a backfill up to today when an arrangement is approved. This replaces the mock's materialize-on-read.
- The monthly WFH limit (`wfhLimitStore`) becomes a company setting.

Frontend: `attendanceService`, `wfhService`, `wfhLimitStore`, the Attendance pages. The late counting display (`features/attendance/lateCycle.ts`) stays client-side and reads API data.

Done when: imports, adjustments and WFH persist; approvals are logged; a manager sees only their branch.

**P5a status:** merged (#9). **P5b status:** done in branch `backend/p05b-wfh` (see PROGRESS.md). Next: P6 (Leave).

---

### P6. Leave (L)

**Goal:** leave types, requests, balances and accrual. Stories US18-US20.

Backend:
- New `leave_types` table (credits, paid/unpaid, accrual settings, credits per hierarchy tier as JSON, max carry-over).
- New `leave_requests` table (reuses the Approval kit). The server computes the days (working days from `ScheduleResolver` and holidays, half days, overlap check). `POST api/leave/requests/preview` replaces the synchronous `planLeaveRequest`.
- New `leave_ledger` table. Build the Ledger pattern here. Balance = sum of entries; available = balance minus pending requests.
- Default credits when an employee is created (P3 hook).
- New behavior, not a port: `leave:accrue` (monthly) and `leave:year-end` (carry-over and expiry) scheduled commands. **Confirm the accrual and carry-over rules with the owner before building them.**

Frontend: `leaveService`; `lib/leave/leaveDays.ts`, which reads the mock store directly and must switch to the API.

Done when: filing, approving and cancelling a request moves the balance correctly, and accrual is tested over a year.

**P6 status:** done in branch `backend/p06-leave` (see PROGRESS.md). Owner chose full credits at once, so there is no `leave:accrue`; `leave:year-end` is built and tested over three years.

---

### P7. Overtime, work logs, approvals inbox, notifications (L)

**Goal:** OT and night differential, hourly and output work logs, one approvals screen, and stored notifications. Stories US20-US23, US38.

Backend:
- New `overtime_records` table (reuses the Approval kit). The server computes the hours (including across midnight). The multiplier is copied from `overtime_rates` when the request is filed. ESS OT applications (`otApplicationStore`) use the same table with `source = ess`.
- New `work_logs` table (replaces `CompensationApproval`). The server computes amount = quantity × rate. A log is locked once a payroll run uses it.
- `GET api/approvals/summary`: pending counts by type, with links, routed to the team supervisor.
- Notifications: build the Notifier. `ApprovalService` notifies on each request and decision, which covers P5 and P6 approvals with a change in one place. Endpoints: list, mark read, mark all read. The bell polls every 60 seconds (`refetchInterval`).

Frontend: `overtimeService`, `otApplicationStore`, `compensationApprovalService`, the Approvals page, and `notificationService` (derived counts become stored notifications).

Done when: every approval type shows in the inbox, and the requester gets a notification on the decision.

**P7 status:** done in branch `backend/p07-overtime` (see PROGRESS.md). The Notifier hooks model creation and `Approval::decide`, so P5, P6 and P7 approvals all notify. The ESS overtime and work output pages move with P13.

---

### P8. Statutory tables and withholding tax (M)

**Goal:** editable, effective-dated government tables and the tax calculation. Stories US27, US28.

Backend:
- New tables `sss_brackets`, `philhealth_rates`, `pagibig_rates`, `tax_brackets`, each with `effective_from` (reuses `EffectiveDated`). `company_id` null means the system default.
- Seed them from `mock-data/seed/statutoryConfig.ts`. **Check the seeded rates against the official 2026 SSS, PhilHealth, Pag-IBIG and BIR tables before release.**
- `App\Payroll\Statutory\StatutoryCalculator` (port of `monthlyStatutoryFor`) and `App\Payroll\Tax\WithholdingTax` (port of `lib/payroll/withholdingTax.ts`). Parity tests against `tests/Fixtures/golden/statutory.json`.
- Endpoints: get and update the tables for an effective date; `POST api/statutory/preview`.

Frontend: the Statutory page; `getStatutoryConfig` and `updateStatutoryConfig` from `payrollService`. Previews that call `monthlyStatutoryFor` synchronously switch to the preview endpoint.

Done when: the PHP results match the golden fixtures for every row.

**P8 status:** done in branch `backend/p08-statutory` (see PROGRESS.md). The PHP calculator matches all 68 golden rows and every tax table sample. The seeded rates are the mock's and still need the official check.

---

### P9. Benefits, loans, deductions, bonuses (L)

**Goal:** everything the payroll run reads besides time. Stories US24-US26, plus bonus definitions from US34.

Backend:
- `benefit_plans` and `employee_benefits` (HMO is one plan per employee; plan edits copy to live enrolments; transfer ends the old enrolment the day before).
- `deduction_plans` (versioned, reuses `EffectiveDated`) and `employee_deductions` (recurring or one-time; `settled_in_period_id`).
- `loan_types`, `loans` and `loan_repayments` (reuses the Ledger pattern).
- `bonus_incentives` (reuses the Approval kit: draft, pending, decided; payout through regular payroll or a separate payslip). Bonuses come before P10 because the payroll run reads them.
- Extend `SeparateEmployee` (P3) to end benefits and deductions.
- Enroll and transfer are bulk actions in action classes.

Frontend: `benefitsService`, `loanService`, `loanTypeService`, `bonusService`; the ESS Loans page (reads the mock store directly).

Done when: all four areas persist and the separation side effects run.

**P9 status:** split into P9a (benefits and deductions), P9b (loans), P9c (bonuses). P9a is done in branch `backend/p09-benefits-loans` (see PROGRESS.md), including the separation side effect. P9b (loans, with the ledger) is done in branch `backend/p09b-loans`.

---

### P10. Payroll engine and runs (XL)

**Goal:** server-side payroll from approved records, with approval and locked finalization. Stories US29-US31.

**P10a: engine**
- Port into `app/Payroll/`:
  - `RateBasis`: `basicPayFor`, `monthlyEquivalentFor`, `dailyRateFor`, `hourlyRateFor`, `computePaidDays`.
  - `PayFrequency`: `payScheduleFor`, `allocateMonthly`, `periodsPerMonthFor`.
  - `DeductionSchedule`.
  - `ComputeLine`: every step of `payrollService.ts` `computeLine` (basic pay, absences, paid leave, OT, bonuses, benefits, final-pay proration, loans, statutory allocation, withholding tax with OT and bonuses at the marginal rate, deduction waterfall so net pay never goes negative).
- `PayrollInputs`: collects one period's inputs from the database (attendance, OT, leave, work logs, bonuses, benefits, deductions, loans, holidays, schedules, the compensation row effective on each date). It also serves `GET api/payroll-inputs`.
- Parity tests against `tests/Fixtures/golden/payroll-lines.json`. Expected differences: output-based pay now uses real work logs instead of `mockOutputQuantity`. Write each accepted difference down in the test.
- **Confirm with the owner:** apply the late policy as a deduction. It is configured today but the TS engine ignores it.

**P10b: runs**
- New `payroll_periods` table (payroll group, cutoff dates, pay date, run number, status `draft`, `review`, `approved`, `finalized`, approver and finalizer) and `payroll_lines` table (employee, total columns for gross, deductions, net, taxable, employee and employer statutory shares, a `breakdown` JSON for the earning, deduction and benefit lines, `held` flag).
- Actions: `CreatePayrollPeriod`, `RunPayroll` (recomputes unfinalized lines and locks work logs), `HoldEmployees`, `ReleaseEmployees`, `ApprovePayroll` (`payroll.approve`), `FinalizePayroll` (`payroll.finalize`; in one transaction it posts loan repayments, settles one-time deductions and locks the run). Any edit after finalization returns 409.
- Runs are synchronous at first. Add a `shortcut:` comment and move to a queued job when a company has more than ~300 employees.

Frontend: `payrollService` (delete the TS engine; keep `computationBreakdown.ts` only if it just formats the stored breakdown), `payrollInputsService`. Stop seeding sample runs on boot (`mock-data/payrollRuns.ts`, called from `OpsPage.tsx`). Delete `lib/payroll/*` engine files once parity holds.

Done when: a full cycle (create, run, review, approve, finalize) works on demo data; parity tests pass; a finalized run cannot be changed.

---

### P11. Payslips, PDF, email (M)

**Goal:** printable payslips and email delivery. Stories US32, US33, US40.

Backend:
- A payslip is a view of a finalized `payroll_lines` row. The same endpoint serves the admin and the employee: `BelongsToEmployee` limits an employee to their own lines.
- PDF: `GET api/payslips/{line}/pdf` from a Blade template. **Confirm the package with the owner:** `barryvdh/laravel-dompdf` is the default because it is pure PHP and needs no Chrome in the Docker image. Check that the ₱ sign renders.
- Email: new `payslip_emails` table (kind, line, status `queued`, `sent`, `failed`, error, sent time) and a queued mail with the PDF attached. Bulk send, throttled.

Frontend: `payslipEmailService`, the payslip pages, the ESS payslip pages (they read the mock store directly).

Done when: an admin can download and email payslips, and an employee can download only their own.

---

### P12. 13th month and separate bonus payslips (L)

**Goal:** 13th month runs and bonus payslips paid outside regular payroll. Stories US34, US35.

Backend:
- New `thirteenth_month_runs` and `thirteenth_month_lines` tables. Port `computeThirteenthMonthLine`, `basicEarningsByMonth` and `thirteenthMonthDeductionsFor`. Generating replaces drafts and never pays anyone twice. Finalizing locks the run. Parity tests against `tests/Fixtures/golden/thirteenth-month.json`.
- Separate bonus payslips: port `computeSeparateBonusPayslip` and `marginalTaxRateFor`.
- Both reuse the payslip document and email from P11.

Frontend: `thirteenthMonthService`, the Bonuses payslip page.

Done when: parity holds and both payslip types download and email.

---

### P13. Employee and manager self-service (M)

**Goal:** ESS and the manager portal on real data. Stories US39-US41.

Backend:
- Most endpoints already exist and are scoped by `BelongsToEmployee`. Add:
  - `GET api/me`: the signed-in employee's profile, and `PATCH api/me` for the fields an employee may edit (`updateEmployeeSelf`).
  - `GET api/ess/summary` for ESS home.
  - `GET api/manager/dashboard` (replaces `managerService`) and the employee attendance summary.

Frontend: the ESS pages that read the mock store directly (`EssHomePage`, `EssLoansPage`, `EssPayslipsPage`, `EssPayslipDetailPage`), `managerService`, and the ESS work output page (uses the P7 work log endpoints).

Done when: an employee sees only their own data and a manager sees only their team, in every ESS and manager page.

---

### P14. Dashboards, reports, tax compliance (L)

**Goal:** real figures everywhere. Stories US36, US37.

Backend:
- `GET api/dashboard/{admin,hr,payroll,workforce}` replaces `dashboardService`, including its made-up figures. Pay cycles come from the payroll groups, not hard-coded cutoffs.
- Reports: payroll register, attendance summary, leave summary, employee masterlist, statutory contributions (from finalized lines, not engine previews), OT summary. Filters: period and branch. Paginated.
- Tax compliance: port the year-to-date totals, de minimis ceilings and the ₱90k bucket from `taxComplianceService.ts` and `lib/payroll/taxCompliance.ts`.

Frontend: `dashboardService`, `reportService`, `taxComplianceService`. The xlsx export stays in the browser and uses API data. Saved custom report templates stay in localStorage (a per-user convenience).

Done when: no dashboard or report reads the mock store.

---

### P15. Platform and subscriptions (L)

**Goal:** the super admin runs companies and plans. Stories US42, US43.

Backend:
- Companies: list, create (with the first company_admin, invited through the existing invite flow), suspend and activate. A `companies.status` column; the `active` middleware also blocks users of a suspended company.
- Plans: move the tiers, limits and prices from `lib/plans.ts` to `config/plans.php`, share them through Inertia props, and add a `plan:<feature>` middleware.
- Subscription payments: new `subscription_payments` table (from and to tier, amount, reference, uploaded proof, status). Reuses the Approval kit; the super admin confirms or rejects. Downgrades. Usage (employee and user counts against the plan limits).
- Fix the super_admin `company_id = null` cases (for example, creating an employee).

Frontend: `subscriptionService`, `features/platform/CompaniesPage.tsx` and `SuperAdminDashboard.tsx` (they read the mock store directly), `SidebarPlanWidget`, `useActivePlanTier`, `PlanGate`. Delete `lib/demo/demoPlanStore.ts`.

Done when: a super admin can onboard a company, and plan limits are enforced on the server.

---

### P16. Integrations: API keys and webhooks (M)

**Goal:** other systems can read data and receive events. Story US44.

Backend:
- API keys: **confirm with the owner** adding `laravel/sanctum` (the official package) for hashed, company-scoped tokens whose abilities are a subset of capabilities. `routes/api.php` under `auth:sanctum` reuses the existing controllers and resources for read endpoints: employees, attendance, payroll register. Rate limited.
- Webhooks: new `webhook_endpoints` (URL, events, secret) and `webhook_deliveries` (status, attempts, response code) tables. A queued job signs each payload with HMAC and retries with backoff. Events: the three `WebhookEvent` names in `domain.ts`.
- CSV export and import reuse the reports (P14) and the Import kit (P3).

Frontend: `integrationService`.

Done when: a key can read data with only its abilities, and a webhook delivery is signed, logged and retried.

---

### P17. Mock removal and hardening (M)

**Goal:** no mock code left, and the system checked as a whole. Supports T22 and US45.

1. Delete `mock-data/`, `lib/auth/mockSession.ts` (it holds plaintext demo passwords in `DEMO_ACCOUNTS`), `DemoSwitchers`, `MobileDemoBar`, `lib/demo/`, `syncMockSession`, `authService` and `base/types.ts` (unused).
2. `useSession` and `useTenant` read the Inertia props.
3. Remove the hand-synced capability copies on the client (`lib/rbac/permissions.ts`, `features/user-access/permissionCatalog.ts`). Labels come from `api/permission-map/capabilities`.
4. Clear the rest of the known defects: 2FA remnants, `ActivityLogFactory` returning `[]`, the company delete cascade mismatch (users `nullOnDelete`, employees `cascade`), `Password::defaults` outside production, and the mismatched seeder passwords.
5. Performance: check for N+1 queries, add missing indexes, time a payroll run for 1,000 employees.
6. Run `/security-review` and Larastan, and fix the findings.

Done when: `grep -r "mock-data" resources/js` returns nothing, and every check in the definition of done passes on `master`.

## 7. Cross-phase rules and risks

- **R1. Mock-removal ledger.** Mock modules read each other. For example, the mock payroll engine reads mock attendance, leave and OT until P10. When a phase swaps a module to the API, delete every mock function that nothing else imports. For mock code that a not-yet-migrated module still imports, add a `// mock: remove in Pxx` comment and a row in the ledger in PROGRESS.md. `tsc` shows what still imports it. P17 empties the ledger.
- **R2. Live references.** Mock reads return live objects and some components mutate them. API data is a fresh copy, so a screen that relied on mutation stops updating. After each swap, check that the screen refetches or invalidates its query after a change.
- **R3. Synchronous exports.** 30 service exports are synchronous. Each one either becomes async, becomes a field on the API response, or stays as a pure client helper. Decide per function in the phase that owns it.
- **R4. IDs.** Mock IDs are strings such as `co_frontline_emp_0001`; database IDs are numbers. Resources emit string IDs (D6). Laravel's `integer` and `exists` rules accept numeric strings.
- **R5. Order matters for payroll.** P10 needs P5-P9 merged. Do not start P10 early; P8 and P15 are the safe parallel work.
- **R6. Golden fixtures are frozen in P0.** If a later phase changes a rule on purpose (for example, the late deduction), update the expected values in that phase's parity test and write down why. Do not regenerate the fixtures from the TS engine after P0.
- **R7. Statutory rates.** The seeded government tables come from the mock data. Check them against the official sources before go-live.
