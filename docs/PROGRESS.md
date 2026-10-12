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
| P0 | Foundation and golden snapshot | not started | | | |
| P1 | Company setup wiring | not started | | | |
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

### Plan - 2026-10-12
- Branch: claude/backend-integration-plan-13abf5
- Done: PLAN.md and PROGRESS.md written from a scan of `master` at `7cac2ef`.
- Next: owner reviews D5 (TanStack Query) and D6 (resources emit the `domain.ts` shape), then start P0 in a new worktree.
- Gotchas: the TS payroll engine imports `@ops/*` aliases, so the P0 golden exporter must run through Vitest (`npx vp test`), not plain `node --test`.
