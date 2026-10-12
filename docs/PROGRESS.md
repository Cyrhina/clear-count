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
| P1 | Company setup wiring | in progress | backend/p01-company-setup | | |
| P2 | Branches, departments, onboarding | not started | | | |
| P3 | Employees (a, b) | not started | | | |
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
| 2026-10-12 | P0 | Give company_admin, super_admin and manager `profile.view`? | Yes, on the server and in the client copy. `ess.view` was not added to admins. |

## Mock-removal ledger

Mock code that a phase could not delete because a not-yet-migrated mock module still imports it (PLAN.md rule R1). Each row carries a `// mock: remove in Pxx` comment in the code. P17 must leave this table empty.

| Mock code (file:function) | Still imported by | Remove in | Added in |
|---|---|---|---|
| | | | |

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
