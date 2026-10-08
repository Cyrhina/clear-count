# Graph Report - laravel-fbs-ops  (2026-10-07)

## Corpus Check
- 521 files · ~259,093 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3526 nodes · 12491 edges · 199 communities (162 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e9f9e8b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Employee
- useToast
- Sidebar.tsx
- formatDate
- useSession
- AddEmployeeDialog.tsx
- payslipEmail.ts
- mock-data/index.ts
- cn
- shared.tsx
- PayslipCard.tsx
- cn
- thirteenthMonthService.ts
- PasswordValidationRules.php
- dashboardService.ts
- Illuminate\Http\Request
- groupAssignment.ts
- Company
- User
- BasicReports.tsx
- computationBreakdown.ts
- utils.ts
- AdvancedReports.tsx
- types/index.ts
- domain.ts
- sidebar.tsx
- AdminDashboard.tsx
- payrollSettingsService.ts
- authService.ts
- taxComplianceService.ts
- payrollService.ts
- PayrollRulesSection.tsx
- RosterTab.tsx
- EmployeeLoansView.tsx
- getEmployees
- userService.ts
- biometricsImport.ts
- Illuminate\Database\Migrations\Migration
- useDashboardData.ts
- dependencies
- app-header.tsx
- react-router-dom.tsx
- leaveService.ts
- BulkEmployeeActions.tsx
- dropdown-menu.tsx
- integrationService.ts
- payrollRuns.ts
- use-appearance.tsx
- useBenefitsDeductions.ts
- EssHomePage.tsx
- LoginPage.tsx
- PayrollPeriodDetailPage.tsx
- fullName
- payFrequency.ts
- employeeService.ts
- ActivityLogPanel.tsx
- bootstrap/app.php
- attendanceService.ts
- compensationApprovalService.ts
- Schedule
- compilerOptions
- managerService.ts
- usePermission
- employeeImport.ts
- CustomReportBuilder
- StatutoryReports.tsx
- CompanyInfoForm.tsx
- Illuminate\Database\Seeder
- overtimeService.ts
- xlsx.ts
- ImportBiometricsDialog
- branchDepartmentService.ts
- components.json
- ImportBiometricsDialog.tsx
- subscriptionService.ts
- StoreEmployeeRequest
- FortifyServiceProvider
- loanService.ts
- formatCurrency
- leaveDays.ts
- employees.ts
- scripts
- optionalDependencies
- layout.tsx
- PayslipDetailPage.tsx
- TeamReports.tsx
- composer.json
- ResetPasswordPage.tsx
- xlsxRead.ts
- benefitsDeductions.ts
- delete-user.tsx
- benefitsService.ts
- payrollInputsService.ts
- require-dev
- SessionUser
- devDependencies
- package.json
- app-logo-icon.tsx
- attendance/routes.tsx
- Reusable Component Boilerplate Report
- BrandLogo.tsx
- MixedCompensationDialog.tsx
- themeStore.ts
- require
- WorkSchedulesSection.tsx
- EmployeeProfileContent
- statutoryConfig.ts
- usePayslipEmails.ts
- compensationApprovals.ts
- overtime.ts
- setup
- DepartmentSelect.tsx
- global.d.ts
- 7. New CRUD module template
- UserFactory
- config
- ci:check
- TestCase
- planLeaveRequest
- LeaveTypeDialog.tsx
- updateStatutoryConfig
- 10. Deployment: Octane / FrankenPHP / Coolify
- createPayrollPeriod
- 11. Table prefix convention `app_`
- psr-4
- laravel
- test
- logging.php
- placeholder-pattern.tsx
- use-clipboard.ts
- PlainCards.tsx
- AddBranchDialog
- types.ts
- 12. PHP extensions and environment parity
- 13. Do not copy: known defects
- 16. Using this document with Claude and other AI tools
- 4. Component catalog
- 5. Data layer boilerplate
- post-create-project-cmd
- LoginPage
- 6. Backend CRUD boilerplate
- 9. Conventions
- console.php
- icon.tsx
- date-fns
- framer-motion
- @hookform/resolvers
- @inertiajs/react
- @nivo/core
- @nivo/line
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-navigation-menu
- @radix-ui/react-popover
- @radix-ui/react-radio-group
- @radix-ui/react-select
- @radix-ui/react-slot
- @radix-ui/react-tabs
- @radix-ui/react-toggle
- react
- recharts
- sonner
- tailwind-merge
- tailwindcss
- @tanstack/react-table
- tw-animate-css
- @types/react
- @types/react-dom
- typescript
- vite
- @vitejs/plugin-react
- zod
- zustand
- PayrollPeriodDetailPage
- shiftAssignments.ts
- ForgotPasswordPage
- decideLeaveRequest
- PayrollInputsPage
- attendance.ts

## God Nodes (most connected - your core abstractions)
1. `useSession()` - 302 edges
2. `useToast()` - 183 edges
3. `formatCurrency()` - 165 edges
4. `cn()` - 153 edges
5. `formatDate()` - 127 edges
6. `Employee` - 127 edges
7. `cn()` - 123 edges
8. `Button` - 123 edges
9. `Select` - 80 edges
10. `Input` - 76 edges

## Surprising Connections (you probably didn't know these)
- `userFor()` --calls--> `User`  [EXTRACTED]
  tests/Feature/EmployeeTest.php → app/Models/User.php
- `employeePayload()` --references--> `Branch`  [EXTRACTED]
  tests/Feature/EmployeeTest.php → app/Models/Branch.php
- `userFor()` --references--> `Company`  [EXTRACTED]
  tests/Feature/EmployeeTest.php → app/Models/Company.php
- `employeePayload()` --calls--> `Employee`  [EXTRACTED]
  tests/Feature/EmployeeTest.php → app/Models/Employee.php
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/breadcrumb.tsx → resources/js/lib/utils.ts

## Import Cycles
- None detected.

## Communities (199 total, 37 thin omitted)

### Community 0 - "Employee"
Cohesion: 0.06
Nodes (66): Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, INSIGHT_FEATURES, InsightFeature, BenefitDialog() (+58 more)

### Community 1 - "useToast"
Cohesion: 0.04
Nodes (110): Button, ButtonProps, SIZE_CLASSES, VARIANT_CLASSES, DialogTrigger, FormField(), FormFieldProps, Input (+102 more)

### Community 2 - "Sidebar.tsx"
Cohesion: 0.10
Nodes (36): AppShell(), readStoredCollapsed(), ROLE_LABELS, RoleSwitcherDropdown(), TierSwitcherDropdown(), MobileDemoBar(), ADMIN_NAV, EMPLOYEE_NAV (+28 more)

### Community 3 - "formatDate"
Cohesion: 0.09
Nodes (31): PageHeader(), PageHeaderProps, Card, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger (+23 more)

### Community 4 - "useSession"
Cohesion: 0.09
Nodes (31): EssHomePage(), EssLeavePage(), getEmployeeHierarchyLevel(), useLeaveRequests(), useLeaveTypes(), LeaveContent(), matchesFilters(), RolePermissionsDialog() (+23 more)

### Community 5 - "AddEmployeeDialog.tsx"
Cohesion: 0.12
Nodes (22): AddEmployeeDialog(), onSubmit(), resetAll(), EMPLOYMENT_TYPE_OPTIONS, FormValues, OUTPUT_UNIT_SELECT_OPTIONS, PAY_RATE_TYPE_OPTIONS_WITH_MIXED, schema (+14 more)

### Community 6 - "payslipEmail.ts"
Cohesion: 0.12
Nodes (18): BulkEmailCandidate, PayslipEmailPreviewDialog(), PreviewMode, C, PayslipEmailMeta(), PayslipEmailTemplate(), SOCIAL_LINKS, buildPayslipEmail() (+10 more)

### Community 7 - "mock-data/index.ts"
Cohesion: 0.06
Nodes (35): generateBranchDepartments(), rank(), generateAttendanceAdjustments(), generateLeaveRequests(), generateSampleLeaveOverrides(), REASONS, attendanceRecords, EMPLOYEE_COUNT_BY_COMPANY (+27 more)

### Community 8 - "cn"
Cohesion: 0.08
Nodes (65): Avatar, AvatarProps, SIZE_CLASSES, Badge, BadgeProps, STATUS_TONE, StatusBadge(), TONE_CLASSES (+57 more)

### Community 9 - "shared.tsx"
Cohesion: 0.07
Nodes (44): RFC-4180, exportSelected(), ChartPane(), PdfExportMenu(), ReportCategory, ReportCategorySection(), ReportDef, ReportPrintFooter() (+36 more)

### Community 10 - "PayslipCard.tsx"
Cohesion: 0.18
Nodes (11): allocationHint(), BENEFIT_CATEGORY_LABEL, BenefitsCard(), BreakdownCard(), BreakdownRow, DEDUCTION_KIND_LABEL, EMPLOYMENT_TYPE_LABEL, OVERTIME_LABELS (+3 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (34): Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, Card(), CardContent() (+26 more)

### Community 12 - "thirteenthMonthService.ts"
Cohesion: 0.09
Nodes (42): usePayslipSelection, listDates(), ThirteenthMonthBreakdown(), useThirteenthMonthLines(), useThirteenthMonthRuns(), fullName(), selectionLabel(), ThirteenthMonthPage() (+34 more)

### Community 13 - "PasswordValidationRules.php"
Cohesion: 0.11
Nodes (15): Controller, ProfileController, SecurityController, PasswordUpdateRequest, ProfileDeleteRequest, ProfileUpdateRequest, TwoFactorAuthenticationRequest, Illuminate\Auth\Middleware\RequirePassword (+7 more)

### Community 14 - "dashboardService.ts"
Cohesion: 0.09
Nodes (33): ComplianceDeadlinesSection(), remove(), countdown(), useDashboardData(), DefaultDashboard(), clampedDate(), COMPLIANCE_CATEGORY_OPTIONS, COMPLIANCE_FREQUENCY_OPTIONS (+25 more)

### Community 15 - "Illuminate\Http\Request"
Cohesion: 0.16
Nodes (3): OpsController, Illuminate\Http\Request, Inertia\Response

### Community 16 - "groupAssignment.ts"
Cohesion: 0.24
Nodes (8): PayrollGroupAssignDialog(), CATEGORY_KEYWORDS, CATEGORY_LABEL, categoryLabel(), isSuggestedForGroup(), mode(), referenceProfile(), EmployeeCategory

### Community 17 - "Company"
Cohesion: 0.10
Nodes (19): company(), ActivityLog, Branch, Company, Employee, ActivityLogFactory, BranchFactory, CompanyFactory (+11 more)

### Community 18 - "User"
Cohesion: 0.05
Nodes (31): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), User, Attribute, Illuminate\Auth\Events\Verified (+23 more)

### Community 19 - "BasicReports.tsx"
Cohesion: 0.10
Nodes (46): onFileSelected(), useEmployees(), useEmployeeBenefits(), LoansDeductionsPage(), AccountRow, DebitCreditReport(), onExport(), OvertimeCostAnalysisReport() (+38 more)

### Community 20 - "computationBreakdown.ts"
Cohesion: 0.08
Nodes (32): WithholdingTaxCard(), onSubmit(), AllocationDetail, allocationFormula(), buildComputationBreakdown(), ComputationBreakdown, ComputationSummary, DeductionItem (+24 more)

### Community 21 - "utils.ts"
Cohesion: 0.15
Nodes (15): InputError(), PasswordInput(), Props, TextLink(), Button(), buttonVariants, Checkbox(), Input() (+7 more)

### Community 22 - "AdvancedReports.tsx"
Cohesion: 0.07
Nodes (42): ATTENDANCE_KEYS, AttendanceAbsenteeismReport(), CATEGORY_COLORS, CHART_LEGEND_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE, CompensationAnalysisReport() (+34 more)

### Community 23 - "types/index.ts"
Cohesion: 0.09
Nodes (25): AppContent(), Props, AppShell(), Props, AppSidebarHeader(), Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis() (+17 more)

### Community 24 - "domain.ts"
Cohesion: 0.07
Nodes (36): BonusFormDialog(), onSubmit(), valuesFromBonus(), handleDecision(), handleSubmit(), FormValues, createBonus(), CreateBonusInput (+28 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.10
Nodes (31): AppSidebar(), footerNavItems, mainNavItems, NavFooter(), NavMain(), NavUser(), Sidebar(), SidebarContent() (+23 more)

### Community 26 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (32): MetricCard(), MetricCardProps, MetricCardTone, TONE_CLASSES, AdminDashboard(), compactPeso(), QUICK_ACTIONS, RECENT_EMPLOYEE_STATUS_LABEL (+24 more)

### Community 27 - "payrollSettingsService.ts"
Cohesion: 0.07
Nodes (40): onSubmit(), CompensationTypesSection(), toggleActive(), onSubmit(), toggle(), onSubmit(), toggleActive(), onSubmit() (+32 more)

### Community 28 - "authService.ts"
Cohesion: 0.26
Nodes (11): DEMO_ACCOUNTS, delay(), findAccount(), PasswordRule, requestPasswordReset(), RESET_TOKEN_TTL_MINUTES, resetPassword(), ResetToken (+3 more)

### Community 29 - "taxComplianceService.ts"
Cohesion: 0.12
Nodes (31): DeMinimisRow, monthlyEquivalentFor(), APPROACHING_RATIO, DE_MINIMIS_CATEGORIES, DeMinimisCategory, deMinimisCategoryFor(), monthsBetween(), monthsEmployedInYear() (+23 more)

### Community 30 - "payrollService.ts"
Cohesion: 0.09
Nodes (42): BonusesPage(), handleHold(), handleRelease(), handleRun(), BONUS_PAYOUT_MODE_LABEL, bonusAmountFor(), bonusAppliesToEmployee(), bonusPayoutMode() (+34 more)

### Community 31 - "PayrollRulesSection.tsx"
Cohesion: 0.05
Nodes (51): OvertimeHolidayRatesSection(), handleAddCustomRate(), handleReset(), handleSave(), syncDrafts(), toPctDraft(), PayrollGroupDialog(), handleFrequencyChange() (+43 more)

### Community 32 - "RosterTab.tsx"
Cohesion: 0.10
Nodes (54): EssSchedulePage(), VIEWS, WEEKDAYS, AssignPreset, AssignShiftDialog(), save(), DAY_NAMES, DAY_ORDER (+46 more)

### Community 33 - "EmployeeLoansView.tsx"
Cohesion: 0.29
Nodes (9): ScheduleLine(), STATUS_OPTIONS, LoanDetailsDialog(), isLive(), LoanTypeDetailsDialog(), nextDeduction, projectInstallments(), LoanRecord (+1 more)

### Community 34 - "getEmployees"
Cohesion: 0.11
Nodes (33): PeriodContext, ATTENDANCE_SHAPE, buildSampleAttendance(), SAMPLE_PERIODS, SampleAttendanceRow, SampleAttendanceStatus, SamplePayslip, usePayrollLines() (+25 more)

### Community 35 - "userService.ts"
Cohesion: 0.14
Nodes (21): ChecklistStep, useOnboardingChecklist(), load(), useStatutoryConfig(), StatutoryPage(), onSubmit(), useActivityLog(), useUsers() (+13 more)

### Community 36 - "biometricsImport.ts"
Cohesion: 0.12
Nodes (29): ALIASES, BiometricsFormat, buildEmployeeMatcher(), buildSampleZkCsv(), detectDelimiter(), devicePinFor(), EmployeeMatcher, EMPTY_MAPPING (+21 more)

### Community 37 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.10
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 38 - "useDashboardData.ts"
Cohesion: 0.12
Nodes (20): AXIS, CURSOR, ManagerDashboard(), STATUS_TONE, timeOfDayGreeting(), TODAY_COLORS, TOOLTIP_STYLE, LEVEL (+12 more)

### Community 39 - "dependencies"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, concurrently, @inertiajs/vite, laravel-vite-plugin, lucide-react, @nivo/bar, dependencies (+21 more)

### Community 40 - "app-header.tsx"
Cohesion: 0.12
Nodes (21): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Sheet(), SheetContent() (+13 more)

### Community 41 - "react-router-dom.tsx"
Cohesion: 0.14
Nodes (17): NotificationsBell(), TONE_DOT, useNotifications(), EXTERNAL, go(), isExternal(), LinkProps, Navigate() (+9 more)

### Community 42 - "leaveService.ts"
Cohesion: 0.19
Nodes (14): save(), LeaveTypeForm(), onSubmit(), toFormValues(), createLeaveType(), grantLeaveCredits(), LeavePlan, LeaveTypeInput (+6 more)

### Community 43 - "BulkEmployeeActions.tsx"
Cohesion: 0.08
Nodes (34): AssignEmployeesDialog(), close(), handleAssign(), onSubmit(), ScheduleDialog(), onSubmit(), toFormValues(), BulkDialog() (+26 more)

### Community 44 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+12 more)

### Community 45 - "integrationService.ts"
Cohesion: 0.09
Nodes (38): useBranches(), useBranchSummaries(), ConsolidatedReportTab(), useApiKeys(), useWebhooks(), AddWebhookDialog(), onSubmit(), ApiKeysTab() (+30 more)

### Community 46 - "payrollRuns.ts"
Cohesion: 0.15
Nodes (27): handleApprove(), handleFinalize(), approvePayroll(), finalizePayroll(), transition(), addDays(), GROUP, historicalOvertime() (+19 more)

### Community 47 - "use-appearance.tsx"
Cohesion: 0.14
Nodes (20): AppearanceToggleTab(), Toaster(), TooltipProvider(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme() (+12 more)

### Community 48 - "useBenefitsDeductions.ts"
Cohesion: 0.13
Nodes (21): AddLoanDialog(), toFormValues(), onSubmit(), allocationLabel(), LoanTypesView(), remove(), toggle(), useBenefitPlans() (+13 more)

### Community 49 - "EssHomePage.tsx"
Cohesion: 0.11
Nodes (23): EssAttendancePage(), hoursWorkedFor(), AttendanceCalendar(), monthKeyOf(), STATUS_DOT, STATUS_LABEL, timeOfDayGreeting(), todayKey() (+15 more)

### Community 50 - "LoginPage.tsx"
Cohesion: 0.25
Nodes (7): AuthLayout(), IconField(), FormValues, schema, DemoAccount, FormValues, schema

### Community 51 - "PayrollPeriodDetailPage.tsx"
Cohesion: 0.05
Nodes (57): BulkActionBar(), Checkbox, RadioGroup, RadioGroupItem, EmployeePickerPanel(), fullName(), FilterField(), FiltersPopover() (+49 more)

### Community 52 - "fullName"
Cohesion: 0.27
Nodes (9): fullName(), BranchDetailsDialog(), moveEmployee(), setManager(), EmployeeMultiPicker(), BranchCard(), moveEmployee(), reassignEmployeeBranch() (+1 more)

### Community 53 - "payFrequency.ts"
Cohesion: 0.16
Nodes (25): AllocationBadge(), EmployeeContributionsTable(), realAllocation(), allocateMonthly(), allocateOne(), AllocationConfig, AVERAGE_PERIODS_PER_MONTH, coveredCutoffs() (+17 more)

### Community 54 - "employeeService.ts"
Cohesion: 0.11
Nodes (29): onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), onImport(), reset() (+21 more)

### Community 55 - "ActivityLogPanel.tsx"
Cohesion: 0.17
Nodes (17): ActivityLogPanel(), DATE_RANGES, DetailsPanel(), KIND_TONE, kindOf(), KindPill(), Module, moduleOf() (+9 more)

### Community 56 - "bootstrap/app.php"
Cohesion: 0.11
Nodes (14): EnsureUserIsActive, HandleAppearance, HandleInertiaRequests, Closure, Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets (+6 more)

### Community 57 - "attendanceService.ts"
Cohesion: 0.12
Nodes (29): onSubmit(), decide(), decideSelected(), FileAdjustmentDialog(), onSubmit(), useApprovedLeavesForDate(), useAttendanceAdjustments(), useDailyAttendance() (+21 more)

### Community 58 - "compensationApprovalService.ts"
Cohesion: 0.11
Nodes (23): CompensationApprovalsPage(), decide(), formatQuantity(), unitNoun(), useCompensationApprovals(), withdraw(), hasAny(), PeriodScope (+15 more)

### Community 59 - "Schedule"
Cohesion: 0.15
Nodes (20): DailyImportRecord, buildScheduleReview(), DAY_NAMES, dayOfWeek(), Discrepancy, DiscrepancyCode, DiscrepancySeverity, isOvernight() (+12 more)

### Community 60 - "compilerOptions"
Cohesion: 0.09
Nodes (22): resources/js/**/*.d.ts, ./resources/js/ops/*, ./resources/js/ops/shim/react-router-dom.tsx, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, esModuleInterop (+14 more)

### Community 61 - "managerService.ts"
Cohesion: 0.26
Nodes (14): buildSampleLoans(), buildSamplePayslips(), getAttendanceRecords(), getCompensationApprovals(), getPendingRequestsSummary(), getLeaveRequests(), getLeaveTypes(), addDaysKey() (+6 more)

### Community 62 - "usePermission"
Cohesion: 0.14
Nodes (19): CompanyThemeApplier(), Topbar(), AdjustmentsList(), BulkEmployeeActions(), EmployeeTable(), ImportEmployeesDialog(), EmployeeListPage(), SORT_OPTIONS (+11 more)

### Community 63 - "employeeImport.ts"
Cohesion: 0.19
Nodes (13): CIVIL_STATUSES, EMPLOYMENT_TYPES, IMPORT_COLUMNS, ImportColumn, ImportParseResult, ImportRow, normalize(), parseEmployeeImport() (+5 more)

### Community 65 - "StatutoryReports.tsx"
Cohesion: 0.09
Nodes (27): EmployeeCombobox(), EmployeeComboboxBaseProps, EmployeeComboboxMultiProps, EmployeeComboboxOption, EmployeeComboboxProps, EmployeeComboboxSingleProps, addTotals(), AGENCY_GROUPS (+19 more)

### Community 66 - "CompanyInfoForm.tsx"
Cohesion: 0.12
Nodes (26): COMPANY_TYPE_OPTIONS, CompanyInfoForm(), detectColor(), handleLogoChange(), onSubmit(), EMPTY_ADDRESS, EMPTY_CONTACT, FormValues (+18 more)

### Community 67 - "Illuminate\Database\Seeder"
Cohesion: 0.13
Nodes (9): Capabilities, DatabaseSeeder, RoleSeeder, UserSeeder, Illuminate\Database\Seeder, Spatie\Permission\DefaultTeamResolver, Spatie\Permission\Models\Permission, Spatie\Permission\Models\Role (+1 more)

### Community 68 - "overtimeService.ts"
Cohesion: 0.12
Nodes (28): getOtRateById(), otTypeMultiplier(), onSubmit(), useOvertimeRecords(), useOvertimeSummary(), daysAgo(), downloadCsv(), OvertimePage() (+20 more)

### Community 69 - "xlsx.ts"
Cohesion: 0.15
Nodes (20): bodyXfs(), buildXlsx(), cellXml(), columnLetter(), crc32(), CRC_TABLE, DEFAULT_XLSX_PALETTE, displayLength() (+12 more)

### Community 70 - "ImportBiometricsDialog"
Cohesion: 0.14
Nodes (20): buildSampleAttlog(), buildStandardTemplateCsv(), decodeBiometricsFile(), downloadText(), ImportBiometricsDialog(), applyMapping(), downloadIssues(), finish() (+12 more)

### Community 71 - "branchDepartmentService.ts"
Cohesion: 0.21
Nodes (16): BranchDepartmentsPanel(), add(), changeSupervisor(), remove(), saveRename(), change(), addBranchDepartment(), branchOf() (+8 more)

### Community 72 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 73 - "ImportBiometricsDialog.tsx"
Cohesion: 0.14
Nodes (16): BiometricsParseResult, ColumnMapping, FORMAT_LABEL, FORMAT_MAPPING, MAPPING_FIELDS, STANDARD_TEMPLATE_HEADERS, ColumnMappingForm(), ACTION_META (+8 more)

### Community 74 - "subscriptionService.ts"
Cohesion: 0.24
Nodes (10): GatedApiTabs(), useSubscriptionUsage(), ChangePlanDialog(), onConfirm(), SubscriptionPage(), estimateMonthlyBill(), formatPlanBasePrice(), getSubscriptionUsage() (+2 more)

### Community 75 - "StoreEmployeeRequest"
Cohesion: 0.16
Nodes (6): EmployeeController, StoreEmployeeRequest, UpdateEmployeeRequest, ActivityLogger, Illuminate\Support\Facades\Route, Illuminate\Validation\Rule

### Community 76 - "FortifyServiceProvider"
Cohesion: 0.17
Nodes (6): AppServiceProvider, FortifyServiceProvider, Carbon\CarbonImmutable, Illuminate\Support\Facades\Date, Illuminate\Support\Facades\DB, Illuminate\Support\ServiceProvider

### Community 77 - "loanService.ts"
Cohesion: 0.15
Nodes (15): save(), onSubmit(), createLoan(), CreateLoanInput, createLoansForType(), CreateLoansResult, LoanTypeEntry, updateLoan() (+7 more)

### Community 78 - "formatCurrency"
Cohesion: 0.12
Nodes (32): ConfigSummary(), BenefitsView(), change(), noteFor(), renderRecordCard(), today(), LineRow(), onExport() (+24 more)

### Community 79 - "leaveDays.ts"
Cohesion: 0.26
Nodes (11): LeaveTypesPanel(), HALF_DAY_LABEL, isHalfDay(), isWorkingDay(), leaveDayFraction(), leaveRequestDays(), nextDay(), PortionRequest (+3 more)

### Community 80 - "employees.ts"
Cohesion: 0.17
Nodes (15): buildCompensationHistory(), COMP_APPROVERS, COMP_HISTORY_REASONS, DEPARTMENT_CATEGORY, DEPARTMENTS, FIRST_NAMES, generateEmployeesForCompany(), LAST_NAMES (+7 more)

### Community 81 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, lint, lint:check, post-autoload-dump, post-update-cmd, pre-package-uninstall, types:check, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump (+7 more)

### Community 82 - "optionalDependencies"
Cohesion: 0.13
Nodes (15): @laravel/multiplex, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, @laravel/multiplex, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu (+7 more)

### Community 83 - "layout.tsx"
Cohesion: 0.21
Nodes (11): AppHeader(), Heading(), Separator(), IsCurrentOrParentUrlFn, IsCurrentUrlFn, useCurrentUrl(), UseCurrentUrlReturn, WhenCurrentUrlFn (+3 more)

### Community 84 - "PayslipDetailPage.tsx"
Cohesion: 0.13
Nodes (20): BonusDetailsDialog(), usePayrollGroups(), useEmployee(), EmployeeLoansView(), changeStatus(), renderLoanCard(), useLoans(), CreatePeriodDialog() (+12 more)

### Community 85 - "TeamReports.tsx"
Cohesion: 0.11
Nodes (26): BonusPayslipPage(), useBonuses(), BonusReport(), onExport(), fullName(), label(), PayrollHistoryReport(), onExport() (+18 more)

### Community 86 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 87 - "ResetPasswordPage.tsx"
Cohesion: 0.24
Nodes (8): FormValues, INVALID_COPY, ResetPasswordPage(), schema, STRENGTH, maskEmail(), PASSWORD_RULES, passwordStrength()

### Community 88 - "xlsxRead.ts"
Cohesion: 0.26
Nodes (13): BUILTIN_DATE_FORMATS, columnIndex(), csvCell(), dateFormatFlags(), decoder, elements(), pad2(), parseXml() (+5 more)

### Community 89 - "benefitsDeductions.ts"
Cohesion: 0.25
Nodes (13): daysFromToday(), DEDUCTION_PLAN_CATALOG, deductionPlanId(), generateBenefitPlans(), generateBenefits(), generateDeductionPlans(), generateEmployeeDeductions(), iso() (+5 more)

### Community 90 - "delete-user.tsx"
Cohesion: 0.24
Nodes (10): DeleteUser(), Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+2 more)

### Community 91 - "benefitsService.ts"
Cohesion: 0.07
Nodes (45): onSubmit(), BenefitPlanDialog(), onSubmit(), cap(), toFormValues(), liveRows(), PlanDetailsDialog(), toggleArchive() (+37 more)

### Community 92 - "payrollInputsService.ts"
Cohesion: 0.24
Nodes (11): fullName(), getPayrollInputs(), InputsPeriod, inRange(), OtherInputRow, OutputInputRow, overlaps(), PayrollInputs (+3 more)

### Community 93 - "require-dev"
Cohesion: 0.17
Nodes (12): require-dev, fakerphp/faker, larastan/larastan, laravel/boost, laravel/pail, laravel/pao, laravel/pint, laravel/sail (+4 more)

### Community 94 - "SessionUser"
Cohesion: 0.12
Nodes (18): BrandSplash(), ToastProvider(), SessionState, useSessionStore, DAYS_AGO, generateActivityLog(), Template, TEMPLATES (+10 more)

### Community 95 - "devDependencies"
Cohesion: 0.18
Nodes (11): babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, @rolldown/plugin-babel, @types/node, vite-plus (+3 more)

### Community 96 - "package.json"
Cohesion: 0.18
Nodes (10): private, $schema, scripts, build, build:ssr, check, check:fix, dev (+2 more)

### Community 97 - "app-logo-icon.tsx"
Cohesion: 0.27
Nodes (5): AppLogo(), AppLogoIcon(), AuthSimpleLayout(), AuthLayout(), AuthLayoutProps

### Community 98 - "attendance/routes.tsx"
Cohesion: 0.09
Nodes (25): AttendanceFilterBar(), DailyAttendanceTable(), MiniCalendarPicker(), WEEKDAY_LABELS, getEmployeeGroup(), GROUP_OPTIONS, annotateImportWithLeaves(), ApprovedLeave (+17 more)

### Community 99 - "Reusable Component Boilerplate Report"
Cohesion: 0.18
Nodes (10): 14. Gaps and next steps, 15. Team onboarding checklist, 1. How to use this document, 2. Stack baseline, 3. Portability tiers, 8.1 React (recommended), 8.2 Server side (emails, PDFs), optional, 8. Markdown rendering boilerplate (+2 more)

### Community 100 - "BrandLogo.tsx"
Cohesion: 0.27
Nodes (6): BRAND_NAME, BrandLogo(), POWERED_BY_NAME, PoweredByBrand(), FEATURE_BADGES, BRAND

### Community 101 - "MixedCompensationDialog.tsx"
Cohesion: 0.15
Nodes (16): BASE_TYPE_OPTIONS, COMPONENT_TYPE_OPTIONS, MixedCompensationDialog(), RATE_FIELD_LABEL, RATE_PLACEHOLDER, BASE_UNIT_LONG, BASE_UNIT_SHORT, formatPesoShort() (+8 more)

### Community 102 - "themeStore.ts"
Cohesion: 0.33
Nodes (7): ThemeToggle(), useTheme(), applyThemeClass(), systemPrefersDark(), Theme, ThemeState, useThemeStore

### Community 103 - "require"
Cohesion: 0.22
Nodes (9): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php (+1 more)

### Community 104 - "WorkSchedulesSection.tsx"
Cohesion: 0.24
Nodes (7): AssignEmployeesDialog(), DAY_LABELS, formatDays(), SHIFT_LABEL, WorkSchedulesSection(), setScheduleAssignedEmployees(), ShiftType

### Community 105 - "EmployeeProfileContent"
Cohesion: 0.29
Nodes (9): PayrollGroupDetailDialog(), handleReassign(), handleRemove(), EmployeeProfileContent(), applyGroupChange(), applySeparation(), applyStatusChange(), updateEmployeeStatus() (+1 more)

### Community 106 - "statutoryConfig.ts"
Cohesion: 0.20
Nodes (7): FormValues, FormValues, SSS_BRACKETS, statutoryConfigs, TAX_TABLES, SssBracket, TaxBracket

### Community 107 - "usePayslipEmails.ts"
Cohesion: 0.42
Nodes (7): PayslipEmailTarget, usePayslipEmails(), delay(), getPayslipEmails(), sendPayslipEmail(), SendPayslipEmailInput, PayslipEmailKind

### Community 108 - "compensationApprovals.ts"
Cohesion: 0.36
Nodes (8): generateCompensationApprovals(), OUTPUT_DESCRIPTIONS, recentSaturdays(), recentWorkdays(), REGULAR_HOURS_PATTERN, statusFor(), toDateKey(), ApprovalStatus

### Community 109 - "overtime.ts"
Cohesion: 0.29
Nodes (10): CreateOvertimeInput, generateOvertimeRecords(), hoursFor(), multiplierFor(), REASONS, shiftFor(), statusFor(), toDateKey() (+2 more)

### Community 110 - "setup"
Cohesion: 0.25
Nodes (8): post-root-package-install, setup, composer install, npm install, npm run build, @php artisan key:generate, @php artisan migrate --force, @php -r \"file_exists('.env') || copy('.env.example', '.env');\

### Community 111 - "DepartmentSelect.tsx"
Cohesion: 0.36
Nodes (6): useBranchDepartments(), BranchesTab(), DepartmentSelect(), RosterData, getBranchDepartments(), BranchDepartment

### Community 112 - "global.d.ts"
Cohesion: 0.32
Nodes (6): Auth, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes, react

### Community 113 - "7. New CRUD module template"
Cohesion: 0.25
Nodes (8): 7.1 Migration, 7.2 Model, 7.3 Policy and resource, 7.4 Controller and route, 7.5 Service, 7.6 Page skeleton (list view only), 7.7 Test skeleton (Pest), 7. New CRUD module template

### Community 114 - "UserFactory"
Cohesion: 0.38
Nodes (3): bootBelongsToCompany(), UserFactory, static

### Community 115 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 116 - "ci:check"
Cohesion: 0.29
Nodes (7): ci:check, dev, Composer\\Config::disableProcessTimeout, npm run check, npm run types:check, @php artisan dev, @test

### Community 117 - "TestCase"
Cohesion: 0.29
Nodes (3): Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, TestCase

### Community 118 - "planLeaveRequest"
Cohesion: 0.32
Nodes (7): RequestLeaveDialog(), onSubmit(), LeavePreview(), onSubmit(), planLeaveRequest(), portionOf(), submitLeaveRequest()

### Community 119 - "LeaveTypeDialog.tsx"
Cohesion: 0.50
Nodes (5): GrantLeaveCreditsDialog(), LeaveTypeDialog(), HIERARCHY_LABEL, HIERARCHY_LEVELS, LeaveType

### Community 120 - "updateStatutoryConfig"
Cohesion: 0.29
Nodes (7): PagibigCard(), onSubmit(), PhilhealthCard(), onSubmit(), SssBracketCard(), onSubmit(), updateStatutoryConfig()

### Community 121 - "10. Deployment: Octane / FrankenPHP / Coolify"
Cohesion: 0.29
Nodes (7): 10.1 Topology, 10.2 Dockerfile skeleton, 10.3 `scripts/deploy.sh` skeleton (web container start), 10.4 Environment keys (names only), 10.5 Octane-safety checklist, 10.6 Rolling-deploy rules, 10. Deployment: Octane / FrankenPHP / Coolify

### Community 122 - "createPayrollPeriod"
Cohesion: 0.36
Nodes (6): onSubmit(), nextPayrollSequence(), parsePayrollNumber(), payrollYearOf(), createPayrollPeriod(), getNextPayrollNumber()

### Community 123 - "11. Table prefix convention `app_`"
Cohesion: 0.33
Nodes (6): 11.1 What lss-v3 does (*Reported*), 11.2 Rule for the boilerplate, 11.3 Checklist for a new table, 11.4 Gotchas (from lss-v3, *Reported* unless noted), 11.5 sms today: no prefix (*Verified*), 11. Table prefix convention `app_`

### Community 124 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 125 - "laravel"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 126 - "test"
Cohesion: 0.40
Nodes (5): test, @lint:check, @php artisan config:clear --ansi, @php artisan test, @types:check

### Community 127 - "logging.php"
Cohesion: 0.40
Nodes (4): Monolog\Handler\NullHandler, Monolog\Handler\StreamHandler, Monolog\Handler\SyslogUdpHandler, Monolog\Processor\PsrLogMessageProcessor

### Community 129 - "use-clipboard.ts"
Cohesion: 0.40
Nodes (3): CopiedValue, CopyFn, UseClipboardReturn

### Community 130 - "PlainCards.tsx"
Cohesion: 0.43
Nodes (5): CardRoot, CardThemeContext, CardThemeValue, useCardTheme(), PlainCards()

### Community 131 - "AddBranchDialog"
Cohesion: 0.38
Nodes (6): AddBranchDialog(), close(), onSubmit(), copyFrom(), copyBranchDepartments(), createBranch()

### Community 132 - "types.ts"
Cohesion: 0.40
Nodes (3): PaginatedResult, ServiceError, ServiceErrorCode

### Community 133 - "12. PHP extensions and environment parity"
Cohesion: 0.40
Nodes (5): 12.1 What is wrong today (*Verified* in sms; lss-v3 *Reported*), 12.2 Standard extension set (derived from real usage), 12.3 Recommended boilerplate, 12.4 Windows developer setup, 12. PHP extensions and environment parity

### Community 134 - "13. Do not copy: known defects"
Cohesion: 0.40
Nodes (5): 13.1 sms: frontend, 13.2 sms: backend, 13.3 sms: deployment, 13.4 lss-v3 (*Reported*), 13. Do not copy: known defects

### Community 135 - "16. Using this document with Claude and other AI tools"
Cohesion: 0.40
Nodes (5): 16.1 What it answers, 16.2 What it does not answer, 16.3 Make Claude read it, 16.4 Keep it accurate, 16. Using this document with Claude and other AI tools

### Community 136 - "4. Component catalog"
Cohesion: 0.40
Nodes (5): 4.1 sms, Tier A (*Verified* that each file exists; props from exploration), 4.2 sms, Tier B (adapt before use), 4.3 sms, Tier C (do not copy), 4.4 lss-v3 components that sms does not have (*Reported*), 4. Component catalog

### Community 137 - "5. Data layer boilerplate"
Cohesion: 0.40
Nodes (5): 5.1 `client.ts`, 5.2 `http.ts`: `createCrudResource<T, TInput>({ baseUrl })`, 5.3 Types: `types/reusable/pagination.ts`, 5.4 A concrete service is three lines, 5. Data layer boilerplate

### Community 138 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 140 - "LoginPage"
Cohesion: 0.83
Nodes (4): LoginPage(), onDemoLogin(), onSubmit(), submit()

### Community 141 - "6. Backend CRUD boilerplate"
Cohesion: 0.50
Nodes (4): 6.1 Route macro: `Route::crudModule($prefix, Controller::class, $name)`, 6.2 `BaseController` (`app/Http/Controllers/v1/BaseController.php`), 6.3 Reference pair (copy these, not the screens that diverge), 6. Backend CRUD boilerplate

### Community 142 - "9. Conventions"
Cohesion: 0.50
Nodes (4): 9.1 Tailwind v4 tokens (`resources/css/app.css`, no `tailwind.config`), 9.2 Styling rules, 9.3 Loading, toasts, confirms, a11y, 9. Conventions

### Community 193 - "PayrollPeriodDetailPage"
Cohesion: 0.60
Nodes (6): compensationLabel(), PayrollPeriodDetailPage(), EmployeeCompensationReport(), onExport(), findEmployeePayrollGroup(), formatBaseRateShort()

### Community 194 - "shiftAssignments.ts"
Cohesion: 0.47
Nodes (5): DEPARTMENT_PATTERN, generateShiftAssignments(), pad2(), toKey(), ShiftAssignment

### Community 195 - "ForgotPasswordPage"
Cohesion: 0.83
Nodes (4): ForgotPasswordPage(), handleResend(), onSubmit(), send()

### Community 196 - "decideLeaveRequest"
Cohesion: 0.50
Nodes (4): decide(), decideSelected(), decideLeaveRequest(), decideLeaveRequests()

### Community 197 - "PayrollInputsPage"
Cohesion: 0.50
Nodes (4): count(), hours(), PayrollInputsPage(), usePayrollInputs()

### Community 198 - "attendance.ts"
Cohesion: 0.83
Nodes (3): generateAttendanceRecords(), pickStatus(), toDateKey()

## Knowledge Gaps
- **779 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+774 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSession()` connect `useSession` to `Employee`, `useToast`, `Sidebar.tsx`, `AddBranchDialog`, `formatDate`, `AddEmployeeDialog.tsx`, `cn`, `shared.tsx`, `thirteenthMonthService.ts`, `dashboardService.ts`, `groupAssignment.ts`, `BasicReports.tsx`, `computationBreakdown.ts`, `domain.ts`, `AdminDashboard.tsx`, `payrollSettingsService.ts`, `PayrollRulesSection.tsx`, `RosterTab.tsx`, `EmployeeLoansView.tsx`, `getEmployees`, `userService.ts`, `useDashboardData.ts`, `react-router-dom.tsx`, `leaveService.ts`, `BulkEmployeeActions.tsx`, `integrationService.ts`, `useBenefitsDeductions.ts`, `EssHomePage.tsx`, `PayrollPeriodDetailPage.tsx`, `fullName`, `attendanceService.ts`, `compensationApprovalService.ts`, `managerService.ts`, `usePermission`, `PayrollPeriodDetailPage`, `CompanyInfoForm.tsx`, `StatutoryReports.tsx`, `overtimeService.ts`, `PayrollInputsPage`, `ImportBiometricsDialog`, `branchDepartmentService.ts`, `ImportBiometricsDialog.tsx`, `subscriptionService.ts`, `formatCurrency`, `PayslipDetailPage.tsx`, `TeamReports.tsx`, `benefitsService.ts`, `SessionUser`, `WorkSchedulesSection.tsx`, `EmployeeProfileContent`, `usePayslipEmails.ts`, `DepartmentSelect.tsx`, `planLeaveRequest`, `LeaveTypeDialog.tsx`, `updateStatutoryConfig`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `Employee`, `AddBranchDialog`, `formatDate`, `AddEmployeeDialog.tsx`, `cn`, `LoginPage`, `thirteenthMonthService.ts`, `dashboardService.ts`, `groupAssignment.ts`, `BasicReports.tsx`, `computationBreakdown.ts`, `domain.ts`, `payrollSettingsService.ts`, `PayrollRulesSection.tsx`, `RosterTab.tsx`, `EmployeeLoansView.tsx`, `userService.ts`, `leaveService.ts`, `BulkEmployeeActions.tsx`, `integrationService.ts`, `useBenefitsDeductions.ts`, `EssHomePage.tsx`, `LoginPage.tsx`, `PayrollPeriodDetailPage.tsx`, `fullName`, `ActivityLogPanel.tsx`, `attendanceService.ts`, `compensationApprovalService.ts`, `usePermission`, `CustomReportBuilder`, `PayrollPeriodDetailPage`, `CompanyInfoForm.tsx`, `ForgotPasswordPage`, `overtimeService.ts`, `ImportBiometricsDialog`, `branchDepartmentService.ts`, `ImportBiometricsDialog.tsx`, `subscriptionService.ts`, `formatCurrency`, `PayslipDetailPage.tsx`, `benefitsService.ts`, `WorkSchedulesSection.tsx`, `EmployeeProfileContent`, `usePayslipEmails.ts`, `planLeaveRequest`, `LeaveTypeDialog.tsx`, `updateStatutoryConfig`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Employee` connect `Employee` to `useToast`, `formatDate`, `payslipEmail.ts`, `mock-data/index.ts`, `cn`, `PayslipCard.tsx`, `thirteenthMonthService.ts`, `groupAssignment.ts`, `BasicReports.tsx`, `computationBreakdown.ts`, `domain.ts`, `payrollSettingsService.ts`, `taxComplianceService.ts`, `payrollService.ts`, `RosterTab.tsx`, `EmployeeLoansView.tsx`, `getEmployees`, `biometricsImport.ts`, `BulkEmployeeActions.tsx`, `integrationService.ts`, `PayrollPeriodDetailPage.tsx`, `employeeService.ts`, `compensationApprovalService.ts`, `Schedule`, `managerService.ts`, `usePermission`, `employeeImport.ts`, `StatutoryReports.tsx`, `shiftAssignments.ts`, `overtimeService.ts`, `attendance.ts`, `ImportBiometricsDialog.tsx`, `loanService.ts`, `employees.ts`, `PayslipDetailPage.tsx`, `TeamReports.tsx`, `benefitsDeductions.ts`, `payrollInputsService.ts`, `SessionUser`, `attendance/routes.tsx`, `WorkSchedulesSection.tsx`, `compensationApprovals.ts`, `overtime.ts`, `DepartmentSelect.tsx`, `LeaveTypeDialog.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _779 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Employee` be split into smaller, more focused modules?**
  _Cohesion score 0.059574468085106386 - nodes in this community are weakly interconnected._
- **Should `useToast` be split into smaller, more focused modules?**
  _Cohesion score 0.0422995263759595 - nodes in this community are weakly interconnected._
- **Should `Sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0977891156462585 - nodes in this community are weakly interconnected._