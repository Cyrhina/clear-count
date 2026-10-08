# Graph Report - laravel-fbs-ops  (2026-10-08)

## Corpus Check
- 524 files · ~264,898 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3555 nodes · 12612 edges · 202 communities (164 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3641278a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RecurringDeductionsView.tsx
- useSession.ts
- usePermission
- EmployeeProfilePage.tsx
- ActivityLogPanel.tsx
- AddEmployeeDialog.tsx
- PayslipEmailPreviewDialog.tsx
- mock-data/index.ts
- PayrollPeriodDetailPage.tsx
- shared.tsx
- PayslipCard.tsx
- cn
- thirteenthMonthService.ts
- PasswordValidationRules.php
- payroll/complianceDeadlines.ts
- Illuminate\Http\Request
- EmployeeProfileContent
- Company
- User
- BasicReports.tsx
- computationBreakdown.ts
- utils.ts
- AdvancedReports.tsx
- types/index.ts
- domain.ts
- sidebar.tsx
- cn
- payrollSettingsService.ts
- authService.ts
- taxComplianceService.ts
- payrollService.ts
- EssOvertimePage.tsx
- RosterTab.tsx
- PayrollGroupDialog.tsx
- useReports.ts
- PayrollPeriodDetailPage
- biometricsImport.ts
- Illuminate\Database\Migrations\Migration
- dashboardService.ts
- dependencies
- app-header.tsx
- react-router-dom.tsx
- leaveService.ts
- useCompanySettings.ts
- dropdown-menu.tsx
- integrationService.ts
- payrollRuns.ts
- use-appearance.tsx
- EmployeeLoansView.tsx
- EssPayslipsPage.tsx
- EmployeeComputationDrawer.tsx
- approvals/routes.tsx
- fullName
- payFrequency.ts
- employeeService.ts
- BonusDetailsDialog.tsx
- bootstrap/app.php
- attendanceService.ts
- compensationApprovalService.ts
- ImportBiometricsDialog.tsx
- compilerOptions
- ThirteenthMonthPayslipPage.tsx
- brandTheme.ts
- thirteenth-month/routes.tsx
- reports/routes.tsx
- ConsolidatedStatutoryReport
- CompanyInfoForm.tsx
- Illuminate\Database\Seeder
- getEmployees
- xlsx.ts
- ImportBiometricsDialog
- branchDepartmentService.ts
- components.json
- useRoster.ts
- AddBonusDialog.tsx
- StoreEmployeeRequest
- FortifyServiceProvider
- loanService.ts
- fullName
- leaveDays.ts
- employees.ts
- scripts
- optionalDependencies
- layout.tsx
- useSession
- HoursWorkedReport
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
- OpsPage.tsx
- Reusable Component Boilerplate Report
- LoginPage.tsx
- mixedCompensationStore.ts
- themeStore.ts
- require
- WorkSchedulesSection.tsx
- BulkDialog
- formatDate
- usePayslipEmails.ts
- compensationApprovals.ts
- overtime.ts
- setup
- EmployeeCombobox.tsx
- global.d.ts
- 7. New CRUD module template
- UserFactory
- config
- ci:check
- TestCase
- branchService.ts
- LeaveTypesPanel.tsx
- updateStatutoryConfig
- 10. Deployment: Octane / FrankenPHP / Coolify
- notificationService.ts
- 11. Table prefix convention `app_`
- psr-4
- laravel
- test
- logging.php
- placeholder-pattern.tsx
- use-clipboard.ts
- createEmployee
- insights/routes.tsx
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
- formatCurrency
- shiftAssignments.ts
- ForgotPasswordPage
- overtime/routes.tsx
- tenantScope.ts
- attendance.ts
- parseCsv
- LeaveTypeForm
- EmployeeMultiPicker

## God Nodes (most connected - your core abstractions)
1. `useSession()` - 304 edges
2. `useToast()` - 183 edges
3. `formatCurrency()` - 165 edges
4. `cn()` - 156 edges
5. `formatDate()` - 129 edges
6. `Employee` - 127 edges
7. `Button` - 125 edges
8. `cn()` - 123 edges
9. `Select` - 82 edges
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

## Communities (202 total, 38 thin omitted)

### Community 0 - "RecurringDeductionsView.tsx"
Cohesion: 0.08
Nodes (37): DeductionDialog(), onSubmit(), FormValues, KIND_OPTIONS, schema, toFormValues(), COPY, DeductionsView() (+29 more)

### Community 1 - "useSession.ts"
Cohesion: 0.06
Nodes (92): Button, ButtonProps, SIZE_CLASSES, VARIANT_CLASSES, Checkbox, Dialog, DialogClose, DialogContent (+84 more)

### Community 2 - "usePermission"
Cohesion: 0.06
Nodes (56): ROLE_LABELS, RoleSwitcherDropdown(), TierSwitcherDropdown(), NavItemLink(), SidebarPlanWidget(), Topbar(), PlanGate(), PlanGateProps (+48 more)

### Community 3 - "EmployeeProfilePage.tsx"
Cohesion: 0.09
Nodes (36): PageHeader(), PageHeaderProps, PlainCards(), Skeleton, Tabs, TabsContent, TabsList, TabsTrigger (+28 more)

### Community 4 - "ActivityLogPanel.tsx"
Cohesion: 0.05
Nodes (58): NavItem, getEmployeeGroup(), GROUP_OPTIONS, matchesCommonFilters(), ActivityLogPanel(), DATE_RANGES, DetailsPanel(), KIND_TONE (+50 more)

### Community 5 - "AddEmployeeDialog.tsx"
Cohesion: 0.12
Nodes (19): AddEmployeeDialog(), EMPLOYMENT_TYPE_OPTIONS, FormValues, OUTPUT_UNIT_SELECT_OPTIONS, PAY_RATE_TYPE_OPTIONS_WITH_MIXED, schema, DepartmentSelect(), EditCompensationForm() (+11 more)

### Community 6 - "PayslipEmailPreviewDialog.tsx"
Cohesion: 0.12
Nodes (14): BulkEmailCandidate, EmailStatusBadge(), STATUS_META, tooltipFor(), PayslipEmailPreviewDialog(), PreviewMode, C, PayslipEmailMeta() (+6 more)

### Community 7 - "mock-data/index.ts"
Cohesion: 0.06
Nodes (37): generateBranchDepartments(), rank(), generateAttendanceAdjustments(), generateLeaveRequests(), generateSampleLeaveOverrides(), REASONS, attendanceRecords, EMPLOYEE_COUNT_BY_COMPANY (+29 more)

### Community 8 - "PayrollPeriodDetailPage.tsx"
Cohesion: 0.07
Nodes (70): Badge, BadgeProps, STATUS_TONE, StatusBadge(), TONE_CLASSES, EmptyState(), EmptyStateProps, SearchFilterBar() (+62 more)

### Community 9 - "shared.tsx"
Cohesion: 0.08
Nodes (38): RFC-4180, exportSelected(), ChartPane(), PdfExportMenu(), ReportCategory, ReportCategorySection(), ReportDef, ReportPrintFooter() (+30 more)

### Community 10 - "PayslipCard.tsx"
Cohesion: 0.20
Nodes (10): allocationHint(), BENEFIT_CATEGORY_LABEL, BenefitsCard(), BreakdownRow, DEDUCTION_KIND_LABEL, EMPLOYMENT_TYPE_LABEL, OVERTIME_LABELS, PayslipCard() (+2 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (34): Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, Card(), CardContent() (+26 more)

### Community 12 - "thirteenthMonthService.ts"
Cohesion: 0.14
Nodes (25): BreakdownCard(), listDates(), ThirteenthMonthBreakdown(), activeWindowFor(), alreadyPaidEmployeeIds(), applySelection(), basicEarningsByMonth(), computeThirteenthMonthLine() (+17 more)

### Community 13 - "PasswordValidationRules.php"
Cohesion: 0.11
Nodes (15): Controller, ProfileController, SecurityController, PasswordUpdateRequest, ProfileDeleteRequest, ProfileUpdateRequest, TwoFactorAuthenticationRequest, Illuminate\Auth\Middleware\RequirePassword (+7 more)

### Community 14 - "payroll/complianceDeadlines.ts"
Cohesion: 0.15
Nodes (19): ComplianceDeadlinesSection(), remove(), countdown(), clampedDate(), COMPLIANCE_CATEGORY_OPTIONS, COMPLIANCE_FREQUENCY_OPTIONS, coveredMonthName(), daysUntil() (+11 more)

### Community 15 - "Illuminate\Http\Request"
Cohesion: 0.16
Nodes (3): OpsController, Illuminate\Http\Request, Inertia\Response

### Community 16 - "EmployeeProfileContent"
Cohesion: 0.12
Nodes (17): PayrollGroupAssignDialog(), handleReassign(), handleRemove(), EmployeeProfileContent(), applyGroupChange(), applyPasswordReset(), applySeparation(), applyStatusChange() (+9 more)

### Community 17 - "Company"
Cohesion: 0.10
Nodes (19): company(), ActivityLog, Branch, Company, Employee, ActivityLogFactory, BranchFactory, CompanyFactory (+11 more)

### Community 18 - "User"
Cohesion: 0.05
Nodes (31): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), User, Attribute, Illuminate\Auth\Events\Verified (+23 more)

### Community 19 - "BasicReports.tsx"
Cohesion: 0.10
Nodes (43): usePayrollGroups(), useOvertimeRecords(), DebitCreditReport(), onExport(), EarningsVsDeductionsReport(), monthLabel(), OvertimeCostAnalysisReport(), PayrollCostByDimensionReport() (+35 more)

### Community 20 - "computationBreakdown.ts"
Cohesion: 0.11
Nodes (23): WithholdingTaxCard(), onSubmit(), AllocationDetail, allocationFormula(), buildComputationBreakdown(), ComputationBreakdown, ComputationSummary, DeductionItem (+15 more)

### Community 21 - "utils.ts"
Cohesion: 0.15
Nodes (15): InputError(), PasswordInput(), Props, TextLink(), Button(), buttonVariants, Checkbox(), Input() (+7 more)

### Community 22 - "AdvancedReports.tsx"
Cohesion: 0.12
Nodes (19): ATTENDANCE_KEYS, AttendanceAbsenteeismReport(), CATEGORY_COLORS, CHART_LEGEND_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE, CostDimension (+11 more)

### Community 23 - "types/index.ts"
Cohesion: 0.09
Nodes (25): AppContent(), Props, AppShell(), Props, AppSidebarHeader(), Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis() (+17 more)

### Community 24 - "domain.ts"
Cohesion: 0.07
Nodes (34): onSubmit(), useBonuses(), FormValues, FormValues, createBonus(), CreateBonusInput, getBonuses(), getDepartments() (+26 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.10
Nodes (31): AppSidebar(), footerNavItems, mainNavItems, NavFooter(), NavMain(), NavUser(), Sidebar(), SidebarContent() (+23 more)

### Community 26 - "cn"
Cohesion: 0.05
Nodes (66): NotificationsBell(), TONE_DOT, Card, CardBody, CardDescription, CardFooter, CardHeader, CardProps (+58 more)

### Community 27 - "payrollSettingsService.ts"
Cohesion: 0.09
Nodes (30): onSubmit(), DeductionsSection(), toggleActive(), onSubmit(), EarningsSection(), toggleActive(), handleConfirm(), onSubmit() (+22 more)

### Community 28 - "authService.ts"
Cohesion: 0.26
Nodes (11): DEMO_ACCOUNTS, delay(), findAccount(), PasswordRule, requestPasswordReset(), RESET_TOKEN_TTL_MINUTES, resetPassword(), ResetToken (+3 more)

### Community 29 - "taxComplianceService.ts"
Cohesion: 0.10
Nodes (36): DeMinimisRow, useTaxComplianceData(), bonusAppliesToEmployee(), monthlyEquivalentFor(), APPROACHING_RATIO, DE_MINIMIS_CATEGORIES, DeMinimisCategory, deMinimisCategoryFor() (+28 more)

### Community 30 - "payrollService.ts"
Cohesion: 0.12
Nodes (32): EmployeeContributionsTable(), bonusAmountFor(), includedInRegularPayroll(), loanConfigNameFor(), periodsPerMonthFor(), workingDaysPerMonthFor(), bracketAt(), marginalRateOn() (+24 more)

### Community 31 - "EssOvertimePage.tsx"
Cohesion: 0.08
Nodes (38): OvertimeHolidayRatesSection(), handleAddCustomRate(), handleReset(), syncDrafts(), toPctDraft(), DEFAULT_HOLIDAY_RATES, DEFAULT_OT_RATES, formatMultiplierPct() (+30 more)

### Community 32 - "RosterTab.tsx"
Cohesion: 0.14
Nodes (40): EssScheduleContent(), VIEWS, WEEKDAYS, AssignPreset, AssignShiftDialog(), fullName(), initials(), MonthCalendar() (+32 more)

### Community 33 - "PayrollGroupDialog.tsx"
Cohesion: 0.11
Nodes (27): handleSave(), DeductionDefaults, FormValues, FREQUENCY_DEFAULTS, FREQUENCY_OPTIONS, PayrollGroupDialog(), handleFrequencyChange(), schema (+19 more)

### Community 34 - "useReports.ts"
Cohesion: 0.19
Nodes (21): useAttendanceSummary(), useLeaveSummary(), usePayrollPeriodOptions(), usePayrollRegister(), useStatutoryContributionData(), getPayrollLines(), getPayrollPeriods(), previewPayrollLine() (+13 more)

### Community 35 - "PayrollPeriodDetailPage"
Cohesion: 0.22
Nodes (8): PayrollPeriodDetailPage(), handleHold(), handleRelease(), handleRun(), useStatutoryConfig(), getStatutoryConfig(), holdEmployeesInPeriod(), runPayroll()

### Community 36 - "biometricsImport.ts"
Cohesion: 0.10
Nodes (32): ALIASES, BiometricsFormat, buildEmployeeMatcher(), buildSampleZkCsv(), detectDelimiter(), devicePinFor(), EmployeeMatcher, EMPTY_MAPPING (+24 more)

### Community 37 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.10
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 38 - "dashboardService.ts"
Cohesion: 0.18
Nodes (19): useDashboardData(), usePayrollDashboard(), usePendingRequestsSummary(), DefaultDashboard(), addDays(), AdminDashboardOverview, DashboardStats, getDashboardStats() (+11 more)

### Community 39 - "dependencies"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, concurrently, @inertiajs/vite, laravel-vite-plugin, lucide-react, @nivo/bar, dependencies (+21 more)

### Community 40 - "app-header.tsx"
Cohesion: 0.12
Nodes (21): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Sheet(), SheetContent() (+13 more)

### Community 41 - "react-router-dom.tsx"
Cohesion: 0.10
Nodes (28): AppShell(), readStoredCollapsed(), MobileDemoBar(), ADMIN_NAV, EMPLOYEE_NAV, MANAGER_NAV, NavGroup, SUPER_ADMIN_NAV (+20 more)

### Community 42 - "leaveService.ts"
Cohesion: 0.14
Nodes (21): RequestLeaveDialog(), onSubmit(), save(), LeavePreview(), onSubmit(), useLeaveTypes(), leaveRequestDays(), getAvailableLeaveCredits() (+13 more)

### Community 43 - "useCompanySettings.ts"
Cohesion: 0.11
Nodes (29): onSubmit(), toggle(), onSubmit(), useCompanySettings(), ChecklistStep, useOnboardingChecklist(), load(), RosterData (+21 more)

### Community 44 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+12 more)

### Community 45 - "integrationService.ts"
Cohesion: 0.11
Nodes (28): useApiKeys(), useWebhooks(), AddWebhookDialog(), onSubmit(), ApiKeysTab(), onCreate(), onRevoke(), DataExportTab() (+20 more)

### Community 46 - "payrollRuns.ts"
Cohesion: 0.15
Nodes (27): handleApprove(), handleFinalize(), approvePayroll(), finalizePayroll(), transition(), addDays(), GROUP, historicalOvertime() (+19 more)

### Community 47 - "use-appearance.tsx"
Cohesion: 0.14
Nodes (20): AppearanceToggleTab(), Toaster(), TooltipProvider(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme() (+12 more)

### Community 48 - "EmployeeLoansView.tsx"
Cohesion: 0.07
Nodes (53): AddEmployeesToLoanTypeDialog(), Amounts, today(), AddLoanDialog(), FormValues, schema, toFormValues(), BenefitsView() (+45 more)

### Community 49 - "EssPayslipsPage.tsx"
Cohesion: 0.10
Nodes (33): EssAttendancePage(), hoursWorkedFor(), REAL_STATUS_TONE, SAMPLE_STATUS_LABEL, SAMPLE_STATUS_TONE, AttendanceCalendar(), EssHomePage(), monthKeyOf() (+25 more)

### Community 50 - "EmployeeComputationDrawer.tsx"
Cohesion: 0.11
Nodes (23): PeriodContext, SamplePayslip, ALLOCATION_METHOD_LABEL, AllocationBadge(), ApprovedWorkLogs(), FREQUENCY_LABEL, LineRow(), rowData() (+15 more)

### Community 51 - "approvals/routes.tsx"
Cohesion: 0.14
Nodes (21): FilterField(), FiltersPopover(), FiltersPopoverProps, SortControl(), SortControlProps, SortDirection, SelectOption, STATUS_OPTIONS (+13 more)

### Community 52 - "fullName"
Cohesion: 0.43
Nodes (8): fullName(), BranchDetailsDialog(), moveEmployee(), setManager(), BranchCard(), moveEmployee(), reassignEmployeeBranch(), updateBranch()

### Community 53 - "payFrequency.ts"
Cohesion: 0.22
Nodes (19): allocateMonthly(), allocateOne(), AllocationConfig, AVERAGE_PERIODS_PER_MONTH, coveredCutoffs(), cutoffAt(), cutoffLabel(), daysBetween() (+11 more)

### Community 54 - "employeeService.ts"
Cohesion: 0.08
Nodes (35): onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), CIVIL_STATUSES, EMPLOYMENT_TYPES, IMPORT_COLUMNS (+27 more)

### Community 55 - "BonusDetailsDialog.tsx"
Cohesion: 0.13
Nodes (15): BonusPayslipDocument(), BONUS_TYPE_LABEL, BonusDetailsDialog(), handleDecision(), handleSubmit(), TARGET_TYPE_LABEL, BonusesPage(), BulkEmailToolbar() (+7 more)

### Community 56 - "bootstrap/app.php"
Cohesion: 0.11
Nodes (14): EnsureUserIsActive, HandleAppearance, HandleInertiaRequests, Closure, Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets (+6 more)

### Community 57 - "attendanceService.ts"
Cohesion: 0.08
Nodes (38): decide(), decideSelected(), useApprovedLeavesForDate(), useAttendanceAdjustments(), useDailyAttendance(), useDateStatusSets(), annotateImportWithLeaves(), ApprovedLeave (+30 more)

### Community 58 - "compensationApprovalService.ts"
Cohesion: 0.10
Nodes (27): CompensationApprovalsPage(), decide(), formatQuantity(), unitNoun(), EssWorkOutputPage(), submit(), withdraw(), todayKey() (+19 more)

### Community 59 - "ImportBiometricsDialog.tsx"
Cohesion: 0.10
Nodes (30): BiometricsParseResult, ColumnMapping, DailyImportRecord, FORMAT_MAPPING, ColumnMappingForm(), ACTION_META, DeviceType, ImportMode (+22 more)

### Community 60 - "compilerOptions"
Cohesion: 0.09
Nodes (22): resources/js/**/*.d.ts, ./resources/js/ops/*, ./resources/js/ops/shim/react-router-dom.tsx, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, esModuleInterop (+14 more)

### Community 61 - "ThirteenthMonthPayslipPage.tsx"
Cohesion: 0.22
Nodes (12): fullName(), ThirteenthMonthPayReport(), onExport(), useThirteenthMonthLines(), useThirteenthMonthRuns(), AmountRow(), ThirteenthMonthPayslipDocument(), ThirteenthMonthPayslipPage() (+4 more)

### Community 62 - "brandTheme.ts"
Cohesion: 0.22
Nodes (14): CompanyThemeApplier(), applyBrandTheme(), BRAND_SHADES, BrandShade, buildBrandScale(), DEFAULT_BRAND_COLOR, EXTRA_VARS, extractBrandColor() (+6 more)

### Community 63 - "thirteenth-month/routes.tsx"
Cohesion: 0.20
Nodes (12): usePayslipSelection, ComputationDrawer(), fullName(), MODE_OPTIONS, selectionLabel(), ThirteenthMonthPage(), handleFinalize(), handleGenerate() (+4 more)

### Community 64 - "reports/routes.tsx"
Cohesion: 0.11
Nodes (17): HeadcountAnalysisReport(), CustomReportBuilder(), loadTemplates(), ADVANCED_CATEGORIES, BASIC_CATEGORIES, renderAdvancedReport(), renderBasicReport(), REPORT_LOOKUP (+9 more)

### Community 65 - "ConsolidatedStatutoryReport"
Cohesion: 0.20
Nodes (14): addTotals(), Bir1601CReport(), onExport(), Bir2316Report(), ConsolidatedStatutoryReport(), onExport(), ContributionCells(), employeeTotal() (+6 more)

### Community 66 - "CompanyInfoForm.tsx"
Cohesion: 0.17
Nodes (13): COMPANY_TYPE_OPTIONS, CompanyInfoForm(), detectColor(), handleLogoChange(), onSubmit(), EMPTY_ADDRESS, EMPTY_CONTACT, FormValues (+5 more)

### Community 67 - "Illuminate\Database\Seeder"
Cohesion: 0.13
Nodes (9): Capabilities, DatabaseSeeder, RoleSeeder, UserSeeder, Illuminate\Database\Seeder, Spatie\Permission\DefaultTeamResolver, Spatie\Permission\Models\Permission, Spatie\Permission\Models\Role (+1 more)

### Community 68 - "getEmployees"
Cohesion: 0.10
Nodes (37): handleTrySample(), showPreview(), AttendanceSummaryTab(), onSubmit(), useOvertimeSummary(), daysAgo(), downloadCsv(), OvertimePage() (+29 more)

### Community 69 - "xlsx.ts"
Cohesion: 0.13
Nodes (22): bodyXfs(), buildXlsx(), cellXml(), columnLetter(), crc32(), CRC_TABLE, DEFAULT_XLSX_PALETTE, displayLength() (+14 more)

### Community 70 - "ImportBiometricsDialog"
Cohesion: 0.18
Nodes (14): buildSampleAttlog(), buildStandardTemplateCsv(), downloadText(), ImportBiometricsDialog(), applyMapping(), downloadIssues(), finish(), handleApply() (+6 more)

### Community 71 - "branchDepartmentService.ts"
Cohesion: 0.11
Nodes (27): AddBranchDialog(), close(), onSubmit(), BranchDepartmentsPanel(), add(), changeSupervisor(), copyFrom(), remove() (+19 more)

### Community 72 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 73 - "useRoster.ts"
Cohesion: 0.26
Nodes (12): save(), Leaves, addDays(), AssignShiftInput, assignShifts(), clearShifts(), copyWeek(), getRosterMap() (+4 more)

### Community 74 - "AddBonusDialog.tsx"
Cohesion: 0.17
Nodes (12): RadioGroup, RadioGroupItem, BONUS_TYPE_OPTIONS, BonusFormDialog(), DEFAULT_VALUES, FormValues, FREQUENCY_OPTIONS, PAYOUT_MODE_OPTIONS (+4 more)

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
Cohesion: 0.23
Nodes (18): onExport(), DeMinimisBenefitsReport(), onExport(), EmployeeCell(), fullName(), r2(), TaxableCompensationReport(), onExport() (+10 more)

### Community 79 - "leaveDays.ts"
Cohesion: 0.31
Nodes (8): HALF_DAY_LABEL, isHalfDay(), isWorkingDay(), leaveDayFraction(), nextDay(), PortionRequest, workingDaysBetween(), paidLeaveCoverage()

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

### Community 84 - "useSession"
Cohesion: 0.07
Nodes (47): useToast(), AdjustmentRequestDialog(), onSubmit(), FileAdjustmentDialog(), onSubmit(), AssignEmployeesDialog(), AddHolidayDialog(), onSubmit() (+39 more)

### Community 85 - "HoursWorkedReport"
Cohesion: 0.43
Nodes (7): fullName(), HoursWorkedReport(), onExport(), OutputSummaryReport(), onExport(), sinceKey(), useFilters()

### Community 86 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 87 - "ResetPasswordPage.tsx"
Cohesion: 0.24
Nodes (8): FormValues, INVALID_COPY, ResetPasswordPage(), schema, STRENGTH, maskEmail(), PASSWORD_RULES, passwordStrength()

### Community 88 - "xlsxRead.ts"
Cohesion: 0.22
Nodes (15): decodeBiometricsFile(), handleImport(), BUILTIN_DATE_FORMATS, columnIndex(), csvCell(), dateFormatFlags(), decoder, elements() (+7 more)

### Community 89 - "benefitsDeductions.ts"
Cohesion: 0.25
Nodes (13): daysFromToday(), DEDUCTION_PLAN_CATALOG, deductionPlanId(), generateBenefitPlans(), generateBenefits(), generateDeductionPlans(), generateEmployeeDeductions(), iso() (+5 more)

### Community 90 - "delete-user.tsx"
Cohesion: 0.24
Nodes (10): DeleteUser(), Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+2 more)

### Community 91 - "benefitsService.ts"
Cohesion: 0.05
Nodes (64): AddEmployeesToPlanDialog(), save(), today(), BenefitDialog(), onSubmit(), FormValues, schema, toFormValues() (+56 more)

### Community 92 - "payrollInputsService.ts"
Cohesion: 0.24
Nodes (11): fullName(), getPayrollInputs(), InputsPeriod, inRange(), OtherInputRow, OutputInputRow, overlaps(), PayrollInputs (+3 more)

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

### Community 98 - "OpsPage.tsx"
Cohesion: 0.22
Nodes (8): BrandSplash(), ToastProvider(), AuthedPage(), OpsPage(), OpsProps, syncMockSession(), OPS_PAGES, OutletProvider

### Community 99 - "Reusable Component Boilerplate Report"
Cohesion: 0.18
Nodes (10): 14. Gaps and next steps, 15. Team onboarding checklist, 1. How to use this document, 2. Stack baseline, 3. Portability tiers, 8.1 React (recommended), 8.2 Server side (emails, PDFs), optional, 8. Markdown rendering boilerplate (+2 more)

### Community 100 - "LoginPage.tsx"
Cohesion: 0.15
Nodes (13): BRAND_NAME, BrandLogo(), POWERED_BY_NAME, PoweredByBrand(), AuthLayout(), FEATURE_BADGES, IconField(), FormValues (+5 more)

### Community 101 - "mixedCompensationStore.ts"
Cohesion: 0.24
Nodes (9): BASE_UNIT_LONG, BASE_UNIT_SHORT, formatPesoShort(), MixedBaseType, MixedCompensationState, MixedComponentType, summarizeMixedCompensationShort(), useMixedCompensation() (+1 more)

### Community 102 - "themeStore.ts"
Cohesion: 0.33
Nodes (7): ThemeToggle(), useTheme(), applyThemeClass(), systemPrefersDark(), Theme, ThemeState, useThemeStore

### Community 103 - "require"
Cohesion: 0.22
Nodes (9): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php (+1 more)

### Community 104 - "WorkSchedulesSection.tsx"
Cohesion: 0.18
Nodes (9): AssignEmployeesDialog(), ScheduleDialog(), toFormValues(), DAY_LABELS, formatDays(), SHIFT_LABEL, WorkSchedulesSection(), setScheduleAssignedEmployees() (+1 more)

### Community 105 - "BulkDialog"
Cohesion: 0.29
Nodes (11): close(), handleAssign(), BulkDialog(), save(), today(), assignEmployeesToBranch(), addEmployeesToSchedule(), bulkUpdateEmployeeDepartment() (+3 more)

### Community 106 - "formatDate"
Cohesion: 0.36
Nodes (10): PayrollCalendarSection(), noteFor(), buildPayslipEmail(), formatPayPeriod(), longDate(), longRange(), monthYearOf(), PAYSLIP_EMAIL_KIND_LABEL (+2 more)

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

### Community 111 - "EmployeeCombobox.tsx"
Cohesion: 0.24
Nodes (6): EmployeeCombobox(), EmployeeComboboxBaseProps, EmployeeComboboxMultiProps, EmployeeComboboxOption, EmployeeComboboxProps, EmployeeComboboxSingleProps

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

### Community 118 - "branchService.ts"
Cohesion: 0.36
Nodes (8): useBranches(), useBranchSummaries(), ConsolidatedReportTab(), BranchSummary, CreateBranchInput, getBranches(), getBranchSummaries(), scopeToCompany()

### Community 119 - "LeaveTypesPanel.tsx"
Cohesion: 0.38
Nodes (5): LeaveTypeDialog(), LeaveTypesPanel(), HIERARCHY_LABEL, HIERARCHY_LEVELS, HierarchyLevel

### Community 120 - "updateStatutoryConfig"
Cohesion: 0.40
Nodes (5): onSubmit(), onSubmit(), SssBracketCard(), onSubmit(), updateStatutoryConfig()

### Community 121 - "10. Deployment: Octane / FrankenPHP / Coolify"
Cohesion: 0.29
Nodes (7): 10.1 Topology, 10.2 Dockerfile skeleton, 10.3 `scripts/deploy.sh` skeleton (web container start), 10.4 Environment keys (names only), 10.5 Octane-safety checklist, 10.6 Rolling-deploy rules, 10. Deployment: Octane / FrankenPHP / Coolify

### Community 122 - "notificationService.ts"
Cohesion: 0.14
Nodes (17): ATTENDANCE_SHAPE, buildSamplePayslips(), SAMPLE_PERIODS, SampleAttendanceRow, SampleAttendanceStatus, useNotifications(), NotificationsPage(), TONE_DOT (+9 more)

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

### Community 130 - "createEmployee"
Cohesion: 0.22
Nodes (9): onSubmit(), resetAll(), onImport(), reset(), DataImportTab(), onImport(), createEmployee(), importEmployees() (+1 more)

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

### Community 193 - "formatCurrency"
Cohesion: 0.09
Nodes (31): ConfigSummary(), compensationLabel(), estimatedHourlyRate(), OvertimeDetailsDialog(), EmployeeComputationDrawer(), CompensationAnalysisReport(), EmployerContributionAnalysisReport(), PayrollCostAnalysisReport() (+23 more)

### Community 194 - "shiftAssignments.ts"
Cohesion: 0.60
Nodes (4): DEPARTMENT_PATTERN, generateShiftAssignments(), pad2(), toKey()

### Community 195 - "ForgotPasswordPage"
Cohesion: 0.83
Nodes (4): ForgotPasswordPage(), handleResend(), onSubmit(), send()

### Community 196 - "overtime/routes.tsx"
Cohesion: 0.13
Nodes (20): Avatar, AvatarProps, SIZE_CLASSES, BulkActionBar(), RowCheckbox(), SelectAllCheckbox(), AdjustmentsList(), LeaveRequestsList() (+12 more)

### Community 197 - "tenantScope.ts"
Cohesion: 0.33
Nodes (5): BRANCH_SCOPED_ROLES, HasBranch, HasCompany, scopeToBranch(), SELF_SCOPED_ROLES

### Community 198 - "attendance.ts"
Cohesion: 0.83
Nodes (3): generateAttendanceRecords(), pickStatus(), toDateKey()

### Community 199 - "parseCsv"
Cohesion: 0.50
Nodes (5): onFileSelected(), onExport(), filterCsvRows(), onExport(), parseCsv()

### Community 200 - "LeaveTypeForm"
Cohesion: 0.60
Nodes (5): LeaveTypeForm(), onSubmit(), toFormValues(), createLeaveType(), updateLeaveType()

## Knowledge Gaps
- **787 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+782 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSession()` connect `useSession` to `RecurringDeductionsView.tsx`, `useSession.ts`, `usePermission`, `EmployeeProfilePage.tsx`, `createEmployee`, `AddEmployeeDialog.tsx`, `ActivityLogPanel.tsx`, `PayrollPeriodDetailPage.tsx`, `shared.tsx`, `thirteenthMonthService.ts`, `payroll/complianceDeadlines.ts`, `EmployeeProfileContent`, `BasicReports.tsx`, `computationBreakdown.ts`, `domain.ts`, `cn`, `payrollSettingsService.ts`, `taxComplianceService.ts`, `EssOvertimePage.tsx`, `RosterTab.tsx`, `PayrollGroupDialog.tsx`, `useReports.ts`, `PayrollPeriodDetailPage`, `dashboardService.ts`, `react-router-dom.tsx`, `leaveService.ts`, `useCompanySettings.ts`, `integrationService.ts`, `EmployeeLoansView.tsx`, `EssPayslipsPage.tsx`, `approvals/routes.tsx`, `fullName`, `BonusDetailsDialog.tsx`, `attendanceService.ts`, `compensationApprovalService.ts`, `ImportBiometricsDialog.tsx`, `ThirteenthMonthPayslipPage.tsx`, `thirteenth-month/routes.tsx`, `CompanyInfoForm.tsx`, `overtime/routes.tsx`, `getEmployees`, `ImportBiometricsDialog`, `branchDepartmentService.ts`, `LeaveTypeForm`, `useRoster.ts`, `AddBonusDialog.tsx`, `benefitsService.ts`, `WorkSchedulesSection.tsx`, `BulkDialog`, `usePayslipEmails.ts`, `branchService.ts`, `updateStatutoryConfig`, `notificationService.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useSession` to `RecurringDeductionsView.tsx`, `useSession.ts`, `usePermission`, `EmployeeProfilePage.tsx`, `createEmployee`, `AddEmployeeDialog.tsx`, `ActivityLogPanel.tsx`, `PayrollPeriodDetailPage.tsx`, `LoginPage`, `payroll/complianceDeadlines.ts`, `EmployeeProfileContent`, `BasicReports.tsx`, `computationBreakdown.ts`, `payrollSettingsService.ts`, `EssOvertimePage.tsx`, `RosterTab.tsx`, `PayrollGroupDialog.tsx`, `PayrollPeriodDetailPage`, `leaveService.ts`, `integrationService.ts`, `EmployeeLoansView.tsx`, `EssPayslipsPage.tsx`, `approvals/routes.tsx`, `fullName`, `BonusDetailsDialog.tsx`, `compensationApprovalService.ts`, `ImportBiometricsDialog.tsx`, `thirteenth-month/routes.tsx`, `reports/routes.tsx`, `CompanyInfoForm.tsx`, `ForgotPasswordPage`, `overtime/routes.tsx`, `getEmployees`, `ImportBiometricsDialog`, `branchDepartmentService.ts`, `LeaveTypeForm`, `AddBonusDialog.tsx`, `benefitsService.ts`, `LoginPage.tsx`, `WorkSchedulesSection.tsx`, `BulkDialog`, `usePayslipEmails.ts`, `updateStatutoryConfig`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `RecurringDeductionsView.tsx`, `useSession.ts`, `usePermission`, `EmployeeProfilePage.tsx`, `ActivityLogPanel.tsx`, `PayslipEmailPreviewDialog.tsx`, `PayrollPeriodDetailPage.tsx`, `shared.tsx`, `PayslipCard.tsx`, `thirteenthMonthService.ts`, `computationBreakdown.ts`, `AdvancedReports.tsx`, `RosterTab.tsx`, `react-router-dom.tsx`, `EssPayslipsPage.tsx`, `approvals/routes.tsx`, `compensationApprovalService.ts`, `ImportBiometricsDialog.tsx`, `ConsolidatedStatutoryReport`, `formatCurrency`, `overtime/routes.tsx`, `ImportBiometricsDialog`, `EmployeeMultiPicker`, `AddBonusDialog.tsx`, `ResetPasswordPage.tsx`, `OpsPage.tsx`, `LoginPage.tsx`, `EmployeeCombobox.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _787 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RecurringDeductionsView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07862679955703211 - nodes in this community are weakly interconnected._
- **Should `useSession.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06156599552572707 - nodes in this community are weakly interconnected._
- **Should `usePermission` be split into smaller, more focused modules?**
  _Cohesion score 0.05925925925925926 - nodes in this community are weakly interconnected._