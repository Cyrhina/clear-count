# Graph Report - laravel-fbs-ops  (2026-10-07)

## Corpus Check
- 511 files · ~249,180 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3441 nodes · 11992 edges · 193 communities (156 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e53ebc43`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Employee
- Button.tsx
- Sidebar.tsx
- integrations/routes.tsx
- ActivityLogPanel.tsx
- useSession
- PayrollPeriodDetailPage.tsx
- mock-data/index.ts
- Badge.tsx
- shared.tsx
- cn
- cn
- thirteenthMonthService.ts
- PasswordValidationRules.php
- dashboardService.ts
- Illuminate\Http\Request
- PayrollGroupAssignDialog.tsx
- Company
- User
- BasicReports.tsx
- EmployeeComputationDrawer.tsx
- utils.ts
- formatCurrency
- types/index.ts
- domain.ts
- sidebar.tsx
- AdminDashboard.tsx
- payrollSettingsService.ts
- ResetPasswordPage.tsx
- taxComplianceService.ts
- payrollService.ts
- PayrollGroupDialog.tsx
- RosterTab.tsx
- format.ts
- getEmployees
- overtime/routes.tsx
- biometricsImport.ts
- Illuminate\Database\Migrations\Migration
- CompanyInfoForm.tsx
- dependencies
- app-header.tsx
- react-router-dom.tsx
- EssHomePage.tsx
- companyService.ts
- dropdown-menu.tsx
- integrationService.ts
- payrollRuns.ts
- use-appearance.tsx
- branchService.ts
- EssPayslipsPage.tsx
- AddBonusDialog.tsx
- Select.tsx
- Input.tsx
- payFrequency.ts
- employeeService.ts
- AccountingReports.tsx
- bootstrap/app.php
- attendanceService.ts
- WorkLogsSummaryCard.tsx
- scheduleReview.ts
- compilerOptions
- EssOvertimePage.tsx
- TeamsTab.tsx
- employeeImport.ts
- reports/routes.tsx
- StatutoryReports.tsx
- brandTheme.ts
- Illuminate\Database\Seeder
- overtimeService.ts
- xlsx.ts
- ImportBiometricsDialog
- branchDepartmentService.ts
- components.json
- ImportBiometricsDialog.tsx
- useAttendance.ts
- StoreEmployeeRequest
- FortifyServiceProvider
- loanService.ts
- fullName
- bonuses/routes.tsx
- employees.ts
- scripts
- optionalDependencies
- layout.tsx
- payroll-inputs/routes.tsx
- PayrollRecordReports.tsx
- composer.json
- BulkDialog
- xlsxRead.ts
- benefitsDeductions.ts
- delete-user.tsx
- BenefitPlanDialog.tsx
- payrollInputsService.ts
- require-dev
- SessionUser
- devDependencies
- package.json
- app-logo-icon.tsx
- leaveStatus.ts
- Reusable Component Boilerplate Report
- OpsPage.tsx
- mixedCompensationStore.ts
- scheduleService.ts
- require
- FileAdjustmentDialog.tsx
- MixedCompensationDialog.tsx
- OvertimePage
- payRate.ts
- compensationApprovals.ts
- overtime.ts
- setup
- payrollRatesStore.ts
- global.d.ts
- 7. New CRUD module template
- UserFactory
- config
- ci:check
- TestCase
- createEmployee
- insights/routes.tsx
- updateStatutoryConfig
- 10. Deployment: Octane / FrankenPHP / Coolify
- EmployeeCombobox.tsx
- 11. Table prefix convention `app_`
- psr-4
- laravel
- test
- logging.php
- placeholder-pattern.tsx
- use-clipboard.ts
- OvertimeApplicationDialog
- LeaveTypeForm
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

## God Nodes (most connected - your core abstractions)
1. `useSession()` - 293 edges
2. `useToast()` - 181 edges
3. `formatCurrency()` - 161 edges
4. `cn()` - 150 edges
5. `cn()` - 123 edges
6. `Employee` - 123 edges
7. `Button` - 121 edges
8. `formatDate()` - 121 edges
9. `Select` - 76 edges
10. `Input` - 75 edges

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

## Communities (193 total, 37 thin omitted)

### Community 0 - "Employee"
Cohesion: 0.04
Nodes (106): EmployeeCombobox(), AddEmployeesToDeductionPlanDialog(), save(), today(), AddEmployeesToPlanDialog(), save(), today(), BenefitDialog() (+98 more)

### Community 1 - "Button.tsx"
Cohesion: 0.06
Nodes (78): Button, ButtonProps, SIZE_CLASSES, VARIANT_CLASSES, Dialog, DialogClose, DialogContent, DialogDescription (+70 more)

### Community 2 - "Sidebar.tsx"
Cohesion: 0.06
Nodes (57): AppShell(), readStoredCollapsed(), ROLE_LABELS, RoleSwitcherDropdown(), TierSwitcherDropdown(), MobileDemoBar(), ADMIN_NAV, EMPLOYEE_NAV (+49 more)

### Community 3 - "integrations/routes.tsx"
Cohesion: 0.07
Nodes (42): PageHeader(), PageHeaderProps, useCardTheme(), PlainCards(), Skeleton, Tabs, TabsContent, TabsList (+34 more)

### Community 4 - "ActivityLogPanel.tsx"
Cohesion: 0.05
Nodes (53): NavItem, ActivityLogPanel(), DATE_RANGES, DetailsPanel(), KIND_TONE, kindOf(), KindPill(), Module (+45 more)

### Community 5 - "useSession"
Cohesion: 0.07
Nodes (48): useToast(), AdjustmentRequestDialog(), onSubmit(), AssignEmployeesDialog(), AddHolidayDialog(), onSubmit(), ComplianceDeadlineDialog(), toFormValues() (+40 more)

### Community 6 - "PayrollPeriodDetailPage.tsx"
Cohesion: 0.07
Nodes (43): BONUS_TYPE_LABEL, TARGET_TYPE_LABEL, PayrollCalendarSection(), CompensationHistoryTable(), EmployeeComputationDrawer(), usePayrollLines(), BulkEmailCandidate, BulkEmailToolbar() (+35 more)

### Community 7 - "mock-data/index.ts"
Cohesion: 0.06
Nodes (38): generateBranchDepartments(), rank(), generateAttendanceAdjustments(), generateLeaveRequests(), generateSampleLeaveOverrides(), REASONS, attendanceRecords, EMPLOYEE_COUNT_BY_COMPANY (+30 more)

### Community 8 - "Badge.tsx"
Cohesion: 0.12
Nodes (34): Badge, BadgeProps, STATUS_TONE, TONE_CLASSES, Table, TableBody, TableCell, TableHead (+26 more)

### Community 9 - "shared.tsx"
Cohesion: 0.07
Nodes (43): RFC-4180, exportSelected(), PdfExportMenu(), ReportDef, ReportPrintFooter(), ReportViewMode, ReportViewShell(), onExcel() (+35 more)

### Community 10 - "cn"
Cohesion: 0.07
Nodes (37): BRAND_NAME, BrandLogo(), BrandSplash(), POWERED_BY_NAME, PoweredByBrand(), Card, CardBody, CardDescription (+29 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (34): Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, Card(), CardContent() (+26 more)

### Community 12 - "thirteenthMonthService.ts"
Cohesion: 0.08
Nodes (43): BreakdownCard(), BreakdownRow, listDates(), ThirteenthMonthBreakdown(), useThirteenthMonthLines(), useThirteenthMonthRuns(), fullName(), selectionLabel() (+35 more)

### Community 13 - "PasswordValidationRules.php"
Cohesion: 0.08
Nodes (23): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), Controller, ProfileController, SecurityController (+15 more)

### Community 14 - "dashboardService.ts"
Cohesion: 0.09
Nodes (41): ComplianceDeadlinesSection(), remove(), countdown(), useDashboardData(), usePayrollDashboard(), DefaultDashboard(), clampedDate(), COMPLIANCE_CATEGORY_OPTIONS (+33 more)

### Community 15 - "Illuminate\Http\Request"
Cohesion: 0.17
Nodes (3): OpsController, Illuminate\Http\Request, Inertia\Response

### Community 16 - "PayrollGroupAssignDialog.tsx"
Cohesion: 0.08
Nodes (37): CATEGORY_OPTIONS, compensationLabel(), PAY_TYPE_OPTIONS, PayrollGroupAssignDialog(), handleConfirm(), QuickChip, STATUS_OPTIONS, PayrollGroupDetailDialog() (+29 more)

### Community 17 - "Company"
Cohesion: 0.10
Nodes (19): company(), ActivityLog, Branch, Company, Employee, ActivityLogFactory, BranchFactory, CompanyFactory (+11 more)

### Community 18 - "User"
Cohesion: 0.06
Nodes (23): User, Attribute, Illuminate\Auth\Events\Verified, Illuminate\Auth\Notifications\ResetPassword, Illuminate\Auth\Notifications\VerifyEmail, Illuminate\Cache\RateLimiting\Limit, Illuminate\Database\Eloquent\Attributes\Hidden, Illuminate\Database\Eloquent\Casts\Attribute (+15 more)

### Community 19 - "BasicReports.tsx"
Cohesion: 0.10
Nodes (33): BonusPayslipPage(), usePayrollGroups(), EmployeeTable(), onFileSelected(), EmployeeListPage(), useEmployees(), LoansDeductionsPage(), useOvertimeRecords() (+25 more)

### Community 20 - "EmployeeComputationDrawer.tsx"
Cohesion: 0.08
Nodes (35): ALLOCATION_METHOD_LABEL, ApprovedWorkLogs(), FREQUENCY_LABEL, LineRow(), AllocationDetail, allocationFormula(), buildComputationBreakdown(), ComputationBreakdown (+27 more)

### Community 21 - "utils.ts"
Cohesion: 0.15
Nodes (15): InputError(), PasswordInput(), Props, TextLink(), Button(), buttonVariants, Checkbox(), Input() (+7 more)

### Community 22 - "formatCurrency"
Cohesion: 0.09
Nodes (34): ConfigSummary(), ATTENDANCE_KEYS, AttendanceAbsenteeismReport(), CATEGORY_COLORS, CHART_LEGEND_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE (+26 more)

### Community 23 - "types/index.ts"
Cohesion: 0.09
Nodes (25): AppContent(), Props, AppShell(), Props, AppSidebarHeader(), Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis() (+17 more)

### Community 24 - "domain.ts"
Cohesion: 0.08
Nodes (34): FormValues, FormValues, CreateBonusInput, getBonuses(), DEPARTMENT_PATTERN, generateShiftAssignments(), pad2(), toKey() (+26 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.10
Nodes (31): AppSidebar(), footerNavItems, mainNavItems, NavFooter(), NavMain(), NavUser(), Sidebar(), SidebarContent() (+23 more)

### Community 26 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (29): MetricCard(), AdminDashboard(), compactPeso(), QUICK_ACTIONS, RECENT_EMPLOYEE_STATUS_LABEL, timeOfDayGreeting(), dueStatus(), PayrollCalendarCard() (+21 more)

### Community 27 - "payrollSettingsService.ts"
Cohesion: 0.09
Nodes (32): onSubmit(), toggle(), onSubmit(), toggleActive(), onSubmit(), toggleActive(), onSubmit(), useCompanySettings() (+24 more)

### Community 28 - "ResetPasswordPage.tsx"
Cohesion: 0.09
Nodes (28): AuthLayout(), FEATURE_BADGES, IconField(), ForgotPasswordPage(), handleResend(), onSubmit(), send(), FormValues (+20 more)

### Community 29 - "taxComplianceService.ts"
Cohesion: 0.12
Nodes (32): DeMinimisRow, bonusAppliesToEmployee(), monthlyEquivalentFor(), APPROACHING_RATIO, DE_MINIMIS_CATEGORIES, DeMinimisCategory, deMinimisCategoryFor(), monthsBetween() (+24 more)

### Community 30 - "payrollService.ts"
Cohesion: 0.11
Nodes (30): onSubmit(), BONUS_PAYOUT_MODE_LABEL, bonusAmountFor(), includedInRegularPayroll(), nextPayrollSequence(), parsePayrollNumber(), payrollYearOf(), attendanceOutcome() (+22 more)

### Community 31 - "PayrollGroupDialog.tsx"
Cohesion: 0.11
Nodes (29): DeductionDefaults, FormValues, FREQUENCY_DEFAULTS, FREQUENCY_OPTIONS, PayrollGroupDialog(), handleFrequencyChange(), schema, toFormValues() (+21 more)

### Community 32 - "RosterTab.tsx"
Cohesion: 0.17
Nodes (29): AssignPreset, AssignShiftDialog(), fullName(), initials(), MonthCalendar(), RosterTab(), handleCopyLastWeek(), openAssign() (+21 more)

### Community 33 - "format.ts"
Cohesion: 0.13
Nodes (26): Avatar, AvatarProps, SIZE_CLASSES, StatusBadge(), AddLoanDialog(), toFormValues(), EmployeeLoansView(), changeStatus() (+18 more)

### Community 34 - "getEmployees"
Cohesion: 0.14
Nodes (30): PeriodContext, SamplePayslip, useAttendanceSummary(), useEmployeeMasterlist(), useLeaveSummary(), usePayrollPeriodOptions(), usePayrollRegister(), useStatutoryContributionData() (+22 more)

### Community 35 - "overtime/routes.tsx"
Cohesion: 0.10
Nodes (17): EmptyState(), EmptyStateProps, RowCheckbox(), SelectAllCheckbox(), EmployeeSelection, estimatedHourlyRate(), OvertimeDetailsDialog(), TYPE_LABEL (+9 more)

### Community 36 - "biometricsImport.ts"
Cohesion: 0.11
Nodes (30): ALIASES, BiometricsFormat, buildEmployeeMatcher(), buildSampleZkCsv(), detectDelimiter(), devicePinFor(), EmployeeMatcher, EMPTY_MAPPING (+22 more)

### Community 37 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.10
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 38 - "CompanyInfoForm.tsx"
Cohesion: 0.09
Nodes (21): Switch, SwitchProps, COMPANY_TYPE_OPTIONS, EMPTY_ADDRESS, EMPTY_CONTACT, CompensationTypeDialog(), onSubmit(), toFormValues() (+13 more)

### Community 39 - "dependencies"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, concurrently, @inertiajs/vite, laravel-vite-plugin, lucide-react, @nivo/bar, dependencies (+21 more)

### Community 40 - "app-header.tsx"
Cohesion: 0.12
Nodes (21): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Sheet(), SheetContent() (+13 more)

### Community 41 - "react-router-dom.tsx"
Cohesion: 0.11
Nodes (23): NotificationsBell(), TONE_DOT, MetricCardProps, MetricCardTone, TONE_CLASSES, useNotifications(), NotificationsPage(), TONE_DOT (+15 more)

### Community 42 - "EssHomePage.tsx"
Cohesion: 0.11
Nodes (24): ApprovedLeave, ESS_ACCENTS, EssCardWatermark(), EssMetricCard(), AttendanceCalendar(), EssHomePage(), monthKeyOf(), STATUS_DOT (+16 more)

### Community 43 - "companyService.ts"
Cohesion: 0.10
Nodes (23): AssignEmployeesDialog(), ScheduleDialog(), onSubmit(), toFormValues(), DAY_LABELS, formatDays(), SHIFT_LABEL, WorkSchedulesSection() (+15 more)

### Community 44 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+12 more)

### Community 45 - "integrationService.ts"
Cohesion: 0.12
Nodes (26): useApiKeys(), useWebhooks(), AddWebhookDialog(), onSubmit(), ApiKeysTab(), onCreate(), onRevoke(), DataExportTab() (+18 more)

### Community 46 - "payrollRuns.ts"
Cohesion: 0.15
Nodes (27): handleApprove(), handleFinalize(), approvePayroll(), finalizePayroll(), transition(), addDays(), GROUP, historicalOvertime() (+19 more)

### Community 47 - "use-appearance.tsx"
Cohesion: 0.14
Nodes (20): AppearanceToggleTab(), Toaster(), TooltipProvider(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme() (+12 more)

### Community 48 - "branchService.ts"
Cohesion: 0.11
Nodes (23): useBranches(), useBranchSummaries(), ConsolidatedReportTab(), onSubmit(), remove(), toggle(), BranchSummary, CreateBranchInput (+15 more)

### Community 49 - "EssPayslipsPage.tsx"
Cohesion: 0.15
Nodes (21): EssAttendancePage(), hoursWorkedFor(), EssLeavePage(), EssLoansPage(), TYPE_LABELS, EssPayslipDetailPage(), EssPayslipsPage(), statutoryTotal() (+13 more)

### Community 50 - "AddBonusDialog.tsx"
Cohesion: 0.10
Nodes (22): Checkbox, RadioGroup, RadioGroupItem, DemoAccount, FormValues, schema, BONUS_TYPE_OPTIONS, BonusFormDialog() (+14 more)

### Community 51 - "Select.tsx"
Cohesion: 0.17
Nodes (18): FiltersPopover(), FiltersPopoverProps, SortControl(), SortControlProps, SortDirection, SearchFilterBarProps, Select, SelectOption (+10 more)

### Community 52 - "Input.tsx"
Cohesion: 0.13
Nodes (14): InputProps, TextareaProps, fullName(), AddBranchDialog(), DEFAULTS, FormValues, schema, BranchDepartmentsPanel() (+6 more)

### Community 53 - "payFrequency.ts"
Cohesion: 0.16
Nodes (25): AllocationBadge(), EmployeeContributionsTable(), realAllocation(), allocateMonthly(), allocateOne(), AllocationConfig, AVERAGE_PERIODS_PER_MONTH, coveredCutoffs() (+17 more)

### Community 54 - "employeeService.ts"
Cohesion: 0.13
Nodes (24): onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), releaseSupervisorIfMoved() (+16 more)

### Community 55 - "AccountingReports.tsx"
Cohesion: 0.19
Nodes (23): AccountRow, DebitCreditReport(), onExport(), PayrollRegisterReport(), onExport(), PayrollSummaryReport(), onExport(), ReportScopePicker() (+15 more)

### Community 56 - "bootstrap/app.php"
Cohesion: 0.11
Nodes (14): EnsureUserIsActive, HandleAppearance, HandleInertiaRequests, Closure, Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets (+6 more)

### Community 57 - "attendanceService.ts"
Cohesion: 0.15
Nodes (19): BulkActionBar(), AdjustmentsList(), decide(), decideSelected(), LeaveRequestsList(), decide(), decideSelected(), useRowSelection() (+11 more)

### Community 58 - "WorkLogsSummaryCard.tsx"
Cohesion: 0.14
Nodes (19): CompensationApprovalsPage(), decide(), formatQuantity(), unitNoun(), hasAny(), PeriodScope, plural(), useWorkLogSummary() (+11 more)

### Community 59 - "scheduleReview.ts"
Cohesion: 0.14
Nodes (22): DailyImportRecord, buildScheduleReview(), DAY_NAMES, dayOfWeek(), Discrepancy, DiscrepancyCode, DiscrepancySeverity, isOvernight() (+14 more)

### Community 60 - "compilerOptions"
Cohesion: 0.09
Nodes (22): resources/js/**/*.d.ts, ./resources/js/ops/*, ./resources/js/ops/shim/react-router-dom.tsx, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, esModuleInterop (+14 more)

### Community 61 - "EssOvertimePage.tsx"
Cohesion: 0.15
Nodes (19): getOtRateById(), EssAccent, ApplicationDetailsDialog(), EssOvertimePage(), LEGACY_MULTIPLIER, LEGACY_TYPE_LABEL, OT_STATUS_TONE, otTypeLabel() (+11 more)

### Community 62 - "TeamsTab.tsx"
Cohesion: 0.15
Nodes (18): changeSupervisor(), DAY_LABELS, ShiftTemplatesTab(), fullName(), TeamsTab(), change(), todayKey(), DayState (+10 more)

### Community 63 - "employeeImport.ts"
Cohesion: 0.12
Nodes (21): ImportEmployeesDialog(), downloadSample(), onImport(), reset(), CIVIL_STATUSES, EMPLOYMENT_TYPES, IMPORT_COLUMNS, ImportColumn (+13 more)

### Community 64 - "reports/routes.tsx"
Cohesion: 0.10
Nodes (15): HeadcountAnalysisReport(), CustomReportBuilder(), loadTemplates(), ReportCategory, ReportCategorySection(), ADVANCED_CATEGORIES, BASIC_CATEGORIES, renderAdvancedReport() (+7 more)

### Community 65 - "StatutoryReports.tsx"
Cohesion: 0.16
Nodes (19): addTotals(), AGENCY_GROUPS, Bir1601CReport(), onExport(), Bir2316Report(), ConsolidatedRow, ConsolidatedStatutoryReport(), onExport() (+11 more)

### Community 66 - "brandTheme.ts"
Cohesion: 0.16
Nodes (19): CompanyThemeApplier(), CompanyInfoForm(), detectColor(), handleLogoChange(), onSubmit(), updateCompany(), applyBrandTheme(), BRAND_SHADES (+11 more)

### Community 67 - "Illuminate\Database\Seeder"
Cohesion: 0.13
Nodes (9): Capabilities, DatabaseSeeder, RoleSeeder, UserSeeder, Illuminate\Database\Seeder, Spatie\Permission\DefaultTeamResolver, Spatie\Permission\Models\Permission, Spatie\Permission\Models\Role (+1 more)

### Community 68 - "overtimeService.ts"
Cohesion: 0.18
Nodes (18): onSubmit(), useOvertimeSummary(), computeHours(), CreateOvertimeInput, createOvertimeRecord(), daysAgo(), estimateHourlyRate(), exportOvertimeSummaryCsv() (+10 more)

### Community 69 - "xlsx.ts"
Cohesion: 0.16
Nodes (19): bodyXfs(), buildXlsx(), cellXml(), columnLetter(), crc32(), CRC_TABLE, DEFAULT_XLSX_PALETTE, displayLength() (+11 more)

### Community 70 - "ImportBiometricsDialog"
Cohesion: 0.16
Nodes (17): buildSampleAttlog(), buildStandardTemplateCsv(), decodeBiometricsFile(), downloadText(), ImportBiometricsDialog(), applyMapping(), downloadIssues(), finish() (+9 more)

### Community 71 - "branchDepartmentService.ts"
Cohesion: 0.18
Nodes (18): close(), onSubmit(), add(), copyFrom(), remove(), saveRename(), addBranchDepartment(), branchOf() (+10 more)

### Community 72 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 73 - "ImportBiometricsDialog.tsx"
Cohesion: 0.15
Nodes (15): BiometricsParseResult, ColumnMapping, FORMAT_MAPPING, MAPPING_FIELDS, STANDARD_TEMPLATE_HEADERS, ColumnMappingForm(), ACTION_META, DeviceType (+7 more)

### Community 74 - "useAttendance.ts"
Cohesion: 0.18
Nodes (13): useApprovedLeavesForDate(), useAttendanceAdjustments(), useDailyAttendance(), useDateStatusSets(), AttendancePage(), shiftDate(), todayKey(), getApprovedLeavesInRange() (+5 more)

### Community 75 - "StoreEmployeeRequest"
Cohesion: 0.16
Nodes (6): EmployeeController, StoreEmployeeRequest, UpdateEmployeeRequest, ActivityLogger, Illuminate\Support\Facades\Route, Illuminate\Validation\Rule

### Community 76 - "FortifyServiceProvider"
Cohesion: 0.17
Nodes (6): AppServiceProvider, FortifyServiceProvider, Carbon\CarbonImmutable, Illuminate\Support\Facades\Date, Illuminate\Support\Facades\DB, Illuminate\Support\ServiceProvider

### Community 77 - "loanService.ts"
Cohesion: 0.15
Nodes (15): save(), onSubmit(), createLoan(), CreateLoanInput, createLoansForType(), CreateLoansResult, LoanTypeEntry, updateLoan() (+7 more)

### Community 78 - "fullName"
Cohesion: 0.24
Nodes (17): DeMinimisBenefitsReport(), onExport(), EmployeeCell(), fullName(), r2(), TaxableCompensationReport(), onExport(), TaxMonitoringReport() (+9 more)

### Community 79 - "bonuses/routes.tsx"
Cohesion: 0.16
Nodes (14): FilterField(), AddBonusDialog(), BonusDetailsDialog(), handleDecision(), handleSubmit(), BONUS_TYPE_LABEL, BonusesPage(), SORT_OPTIONS (+6 more)

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

### Community 84 - "payroll-inputs/routes.tsx"
Cohesion: 0.22
Nodes (10): SearchFilterBar(), usePayrollPeriods(), count(), hours(), InputsTab, PayrollInputsPage(), usePayrollInputs(), PayrollListPage() (+2 more)

### Community 85 - "PayrollRecordReports.tsx"
Cohesion: 0.21
Nodes (13): useBonuses(), BonusReport(), onExport(), fullName(), label(), PayrollHistoryReport(), onExport(), ThirteenthMonthPayReport() (+5 more)

### Community 86 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 87 - "BulkDialog"
Cohesion: 0.22
Nodes (14): close(), handleAssign(), BranchCard(), moveEmployee(), BulkDialog(), save(), today(), assignEmployeesToBranch() (+6 more)

### Community 88 - "xlsxRead.ts"
Cohesion: 0.26
Nodes (13): BUILTIN_DATE_FORMATS, columnIndex(), csvCell(), dateFormatFlags(), decoder, elements(), pad2(), parseXml() (+5 more)

### Community 89 - "benefitsDeductions.ts"
Cohesion: 0.25
Nodes (13): daysFromToday(), DEDUCTION_PLAN_CATALOG, deductionPlanId(), generateBenefitPlans(), generateBenefits(), generateDeductionPlans(), generateEmployeeDeductions(), iso() (+5 more)

### Community 90 - "delete-user.tsx"
Cohesion: 0.24
Nodes (10): DeleteUser(), Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+2 more)

### Community 91 - "BenefitPlanDialog.tsx"
Cohesion: 0.23
Nodes (12): AMOUNT_TYPE_OPTIONS, BenefitPlanDialog(), onSubmit(), cap(), FormValues, NAME_PLACEHOLDER, schema, toFormValues() (+4 more)

### Community 92 - "payrollInputsService.ts"
Cohesion: 0.23
Nodes (12): daysBetween(), fullName(), getPayrollInputs(), InputsPeriod, inRange(), OtherInputRow, OutputInputRow, overlaps() (+4 more)

### Community 93 - "require-dev"
Cohesion: 0.17
Nodes (12): require-dev, fakerphp/faker, larastan/larastan, laravel/boost, laravel/pail, laravel/pao, laravel/pint, laravel/sail (+4 more)

### Community 94 - "SessionUser"
Cohesion: 0.24
Nodes (9): SessionState, DAYS_AGO, generateActivityLog(), Template, TEMPLATES, TIMES, users, ActivityLogEntry (+1 more)

### Community 95 - "devDependencies"
Cohesion: 0.18
Nodes (11): babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, @rolldown/plugin-babel, @types/node, vite-plus (+3 more)

### Community 96 - "package.json"
Cohesion: 0.18
Nodes (10): private, $schema, scripts, build, build:ssr, check, check:fix, dev (+2 more)

### Community 97 - "app-logo-icon.tsx"
Cohesion: 0.27
Nodes (5): AppLogo(), AppLogoIcon(), AuthSimpleLayout(), AuthLayout(), AuthLayoutProps

### Community 98 - "leaveStatus.ts"
Cohesion: 0.29
Nodes (10): annotateImportWithLeaves(), approvedLeaveOn(), fromMinutes(), LeaveAwareStatus, LeaveResolution, PORTION_LABEL, resolveLeaveStatus(), shiftMidpoint() (+2 more)

### Community 99 - "Reusable Component Boilerplate Report"
Cohesion: 0.18
Nodes (10): 14. Gaps and next steps, 15. Team onboarding checklist, 1. How to use this document, 2. Stack baseline, 3. Portability tiers, 8.1 React (recommended), 8.2 Server side (emails, PDFs), optional, 8. Markdown rendering boilerplate (+2 more)

### Community 100 - "OpsPage.tsx"
Cohesion: 0.24
Nodes (7): ToastProvider(), AuthedPage(), OpsPage(), OpsProps, syncMockSession(), OPS_PAGES, OutletProvider

### Community 101 - "mixedCompensationStore.ts"
Cohesion: 0.24
Nodes (9): BASE_UNIT_LONG, BASE_UNIT_SHORT, formatPesoShort(), MixedBaseType, MixedCompensationState, MixedComponentType, summarizeMixedCompensationShort(), useMixedCompensation() (+1 more)

### Community 102 - "scheduleService.ts"
Cohesion: 0.38
Nodes (9): save(), addDays(), AssignShiftInput, assignShifts(), clearShifts(), copyWeek(), getRosterMap(), getShiftAssignments() (+1 more)

### Community 103 - "require"
Cohesion: 0.22
Nodes (9): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php (+1 more)

### Community 104 - "FileAdjustmentDialog.tsx"
Cohesion: 0.28
Nodes (8): FileAdjustmentDialog(), onSubmit(), FormValues, REASON_CATEGORY_OPTIONS, schema, createAttendanceAdjustment(), fileAttendanceAdjustment(), getAttendanceRecordForEmployeeDate()

### Community 105 - "MixedCompensationDialog.tsx"
Cohesion: 0.25
Nodes (7): BASE_TYPE_OPTIONS, COMPONENT_TYPE_OPTIONS, MixedCompensationDialog(), RATE_FIELD_LABEL, RATE_PLACEHOLDER, MixedCompensationStructure, summarizeMixedCompensation()

### Community 106 - "OvertimePage"
Cohesion: 0.31
Nodes (9): daysAgo(), downloadCsv(), OvertimePage(), handleBulkDecide(), handleDecide(), handleExport(), refetchAll(), decideOvertimeRecord() (+1 more)

### Community 107 - "payRate.ts"
Cohesion: 0.25
Nodes (8): EstimatedEquivalent, formatBaseRate(), HELPER_TEXT, outputUnitWord(), PAY_RATE_TYPE_LABEL, RATE_FIELD_LABEL, UNIT_SUFFIX, UNIT_SUFFIX_SHORT

### Community 108 - "compensationApprovals.ts"
Cohesion: 0.36
Nodes (8): generateCompensationApprovals(), OUTPUT_DESCRIPTIONS, recentSaturdays(), recentWorkdays(), REGULAR_HOURS_PATTERN, statusFor(), toDateKey(), ApprovalStatus

### Community 109 - "overtime.ts"
Cohesion: 0.39
Nodes (8): generateOvertimeRecords(), hoursFor(), multiplierFor(), REASONS, shiftFor(), statusFor(), toDateKey(), typeForSeed()

### Community 110 - "setup"
Cohesion: 0.25
Nodes (8): post-root-package-install, setup, composer install, npm install, npm run build, @php artisan key:generate, @php artisan migrate --force, @php -r \"file_exists('.env') || copy('.env.example', '.env');\

### Community 111 - "payrollRatesStore.ts"
Cohesion: 0.29
Nodes (7): DEFAULT_HOLIDAY_RATES, DEFAULT_OT_RATES, formatMultiplierPct(), HolidayRateType, otRateOptionLabel(), OtRateType, PayrollRatesState

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

### Community 118 - "createEmployee"
Cohesion: 0.33
Nodes (6): onSubmit(), resetAll(), DataImportTab(), onImport(), createEmployee(), importEmployeesCsv()

### Community 120 - "updateStatutoryConfig"
Cohesion: 0.29
Nodes (7): onSubmit(), onSubmit(), SssBracketCard(), onSubmit(), WithholdingTaxCard(), onSubmit(), updateStatutoryConfig()

### Community 121 - "10. Deployment: Octane / FrankenPHP / Coolify"
Cohesion: 0.29
Nodes (7): 10.1 Topology, 10.2 Dockerfile skeleton, 10.3 `scripts/deploy.sh` skeleton (web container start), 10.4 Environment keys (names only), 10.5 Octane-safety checklist, 10.6 Rolling-deploy rules, 10. Deployment: Octane / FrankenPHP / Coolify

### Community 122 - "EmployeeCombobox.tsx"
Cohesion: 0.47
Nodes (5): EmployeeComboboxBaseProps, EmployeeComboboxMultiProps, EmployeeComboboxOption, EmployeeComboboxProps, EmployeeComboboxSingleProps

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

### Community 130 - "OvertimeApplicationDialog"
Cohesion: 0.60
Nodes (5): OvertimeApplicationDialog(), handleSubmit(), onOpenChange(), reset(), computeTotalHours()

### Community 131 - "LeaveTypeForm"
Cohesion: 0.60
Nodes (5): LeaveTypeForm(), onSubmit(), toFormValues(), createLeaveType(), updateLeaveType()

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

## Knowledge Gaps
- **761 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+756 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSession()` connect `useSession` to `Employee`, `Button.tsx`, `Sidebar.tsx`, `integrations/routes.tsx`, `LeaveTypeForm`, `ActivityLogPanel.tsx`, `PayrollPeriodDetailPage.tsx`, `Badge.tsx`, `shared.tsx`, `cn`, `thirteenthMonthService.ts`, `dashboardService.ts`, `PayrollGroupAssignDialog.tsx`, `BasicReports.tsx`, `domain.ts`, `AdminDashboard.tsx`, `payrollSettingsService.ts`, `PayrollGroupDialog.tsx`, `RosterTab.tsx`, `format.ts`, `getEmployees`, `overtime/routes.tsx`, `CompanyInfoForm.tsx`, `react-router-dom.tsx`, `EssHomePage.tsx`, `companyService.ts`, `integrationService.ts`, `branchService.ts`, `EssPayslipsPage.tsx`, `AddBonusDialog.tsx`, `Select.tsx`, `Input.tsx`, `AccountingReports.tsx`, `attendanceService.ts`, `WorkLogsSummaryCard.tsx`, `TeamsTab.tsx`, `employeeImport.ts`, `brandTheme.ts`, `overtimeService.ts`, `ImportBiometricsDialog`, `ImportBiometricsDialog.tsx`, `useAttendance.ts`, `fullName`, `bonuses/routes.tsx`, `payroll-inputs/routes.tsx`, `PayrollRecordReports.tsx`, `BulkDialog`, `BenefitPlanDialog.tsx`, `FileAdjustmentDialog.tsx`, `OvertimePage`, `createEmployee`, `updateStatutoryConfig`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useSession` to `Employee`, `Button.tsx`, `OvertimeApplicationDialog`, `integrations/routes.tsx`, `LeaveTypeForm`, `Sidebar.tsx`, `PayrollPeriodDetailPage.tsx`, `ActivityLogPanel.tsx`, `Badge.tsx`, `LoginPage`, `thirteenthMonthService.ts`, `dashboardService.ts`, `PayrollGroupAssignDialog.tsx`, `BasicReports.tsx`, `ResetPasswordPage.tsx`, `PayrollGroupDialog.tsx`, `RosterTab.tsx`, `format.ts`, `overtime/routes.tsx`, `CompanyInfoForm.tsx`, `companyService.ts`, `integrationService.ts`, `EssPayslipsPage.tsx`, `AddBonusDialog.tsx`, `Select.tsx`, `Input.tsx`, `attendanceService.ts`, `WorkLogsSummaryCard.tsx`, `EssOvertimePage.tsx`, `TeamsTab.tsx`, `employeeImport.ts`, `reports/routes.tsx`, `brandTheme.ts`, `ImportBiometricsDialog`, `ImportBiometricsDialog.tsx`, `bonuses/routes.tsx`, `BulkDialog`, `BenefitPlanDialog.tsx`, `FileAdjustmentDialog.tsx`, `OvertimePage`, `createEmployee`, `updateStatutoryConfig`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `formatCurrency` to `Employee`, `Button.tsx`, `Sidebar.tsx`, `integrations/routes.tsx`, `useSession`, `PayrollPeriodDetailPage.tsx`, `Badge.tsx`, `cn`, `thirteenthMonthService.ts`, `dashboardService.ts`, `PayrollGroupAssignDialog.tsx`, `BasicReports.tsx`, `EmployeeComputationDrawer.tsx`, `AdminDashboard.tsx`, `format.ts`, `overtime/routes.tsx`, `CompanyInfoForm.tsx`, `EssHomePage.tsx`, `branchService.ts`, `EssPayslipsPage.tsx`, `AddBonusDialog.tsx`, `payFrequency.ts`, `AccountingReports.tsx`, `WorkLogsSummaryCard.tsx`, `EssOvertimePage.tsx`, `StatutoryReports.tsx`, `fullName`, `bonuses/routes.tsx`, `payroll-inputs/routes.tsx`, `PayrollRecordReports.tsx`, `mixedCompensationStore.ts`, `MixedCompensationDialog.tsx`, `OvertimePage`, `payRate.ts`, `updateStatutoryConfig`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _761 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Employee` be split into smaller, more focused modules?**
  _Cohesion score 0.03958416633346661 - nodes in this community are weakly interconnected._
- **Should `Button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06146926536731634 - nodes in this community are weakly interconnected._
- **Should `Sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05578947368421053 - nodes in this community are weakly interconnected._