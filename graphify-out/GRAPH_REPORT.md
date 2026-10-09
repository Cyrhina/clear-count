# Graph Report - laravel-fbs-ops  (2026-10-09)

## Corpus Check
- 533 files · ~279,055 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3639 nodes · 13093 edges · 192 communities (155 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07945dd9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RecurringDeductionsView.tsx
- useTenant
- Sidebar.tsx
- EmployeeProfilePage.tsx
- RolePermissionsDialog.tsx
- AddEmployeeDialog.tsx
- payslipEmail.ts
- mock-data/index.ts
- format.ts
- shared.tsx
- formatDate
- cn
- thirteenthMonthService.ts
- PasswordValidationRules.php
- dashboardService.ts
- Illuminate\Http\Request
- groupAssignment.ts
- Company
- User
- thirteenth-month/routes.tsx
- computationBreakdown.ts
- utils.ts
- AdvancedReports.tsx
- types/index.ts
- domain.ts
- sidebar.tsx
- cn
- payrollSettingsService.ts
- branchDepartmentService.ts
- taxComplianceService.ts
- payrollService.ts
- EssOvertimePage.tsx
- RosterTab.tsx
- PayrollGroupDialog.tsx
- useReports.ts
- EmployeeProfileContent
- biometricsImport.ts
- Illuminate\Database\Migrations\Migration
- loanTypeService.ts
- dependencies
- app-header.tsx
- managerService.ts
- leaveService.ts
- useCompanySettings.ts
- dropdown-menu.tsx
- integrationService.ts
- payrollRuns.ts
- use-appearance.tsx
- useSession.ts
- cn.ts
- leaveStatus.ts
- approvals/routes.tsx
- ActivityLogPanel.tsx
- payFrequency.ts
- employeeService.ts
- leave/routes.tsx
- bootstrap/app.php
- attendanceService.ts
- compensationApprovalService.ts
- ImportBiometricsDialog.tsx
- compilerOptions
- PayrollPeriodDetailPage.tsx
- CompanyInfoForm.tsx
- fullName
- CustomReportBuilder
- BasicReports.tsx
- plans.ts
- Illuminate\Database\Seeder
- getEmployees
- xlsx.ts
- handleDownloadSample
- branchService.ts
- components.json
- subscription/routes.tsx
- PayslipCard.tsx
- StoreEmployeeRequest
- FortifyServiceProvider
- loanService.ts
- rateBasis.ts
- ConsolidatedStatutoryReport
- employees.ts
- scripts
- optionalDependencies
- layout.tsx
- useSession
- reports/routes.tsx
- composer.json
- ResetPasswordPage.tsx
- xlsxRead.ts
- benefitsDeductions.ts
- delete-user.tsx
- Employee
- payrollInputsService.ts
- require-dev
- SessionUser
- devDependencies
- package.json
- app-logo-icon.tsx
- PayrollPeriod
- Reusable Component Boilerplate Report
- LoginPage.tsx
- mixedCompensationStore.ts
- Topbar.tsx
- require
- InputRecordViews.tsx
- OpsPage.tsx
- DemoSwitchers.tsx
- createEmployee
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
- LoginPage
- attendance.ts
- WithholdingTaxCard.tsx
- 10. Deployment: Octane / FrankenPHP / Coolify
- 11. Table prefix convention `app_`
- psr-4
- laravel
- test
- logging.php
- placeholder-pattern.tsx
- use-clipboard.ts
- employeeImport.ts
- types.ts
- 12. PHP extensions and environment parity
- 13. Do not copy: known defects
- 16. Using this document with Claude and other AI tools
- 4. Component catalog
- 5. Data layer boilerplate
- post-create-project-cmd
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
- overtime/routes.tsx

## God Nodes (most connected - your core abstractions)
1. `useSession()` - 309 edges
2. `useToast()` - 183 edges
3. `cn()` - 176 edges
4. `formatCurrency()` - 169 edges
5. `formatDate()` - 139 edges
6. `Employee` - 130 edges
7. `Button` - 129 edges
8. `cn()` - 123 edges
9. `Select` - 91 edges
10. `Input` - 79 edges

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

## Communities (192 total, 37 thin omitted)

### Community 0 - "RecurringDeductionsView.tsx"
Cohesion: 0.06
Nodes (54): AddEmployeesToLoanTypeDialog(), today(), AddLoanDialog(), toFormValues(), DeductionDialog(), onSubmit(), FormValues, KIND_OPTIONS (+46 more)

### Community 1 - "useTenant"
Cohesion: 0.13
Nodes (23): CompanyThemeApplier(), EmployeePickerPanel(), fullName(), useBranchDepartments(), BulkDialog(), save(), BulkEmployeeActions(), BulkKind (+15 more)

### Community 2 - "Sidebar.tsx"
Cohesion: 0.14
Nodes (19): AppShell(), readStoredCollapsed(), ADMIN_NAV, EMPLOYEE_NAV, MANAGER_NAV, NavGroup, SUPER_ADMIN_NAV, Sidebar() (+11 more)

### Community 3 - "EmployeeProfilePage.tsx"
Cohesion: 0.05
Nodes (55): PageHeader(), PageHeaderProps, Badge, Card, PlainCards(), Tabs, TabsContent, TabsList (+47 more)

### Community 4 - "RolePermissionsDialog.tsx"
Cohesion: 0.12
Nodes (23): CapabilityRow(), RolePermissionsDialog(), CAPABILITY_INFO, groupCapabilities(), GroupedCapabilities, PERMISSION_GROUP_DESCRIPTION, PERMISSION_GROUP_ORDER, PermissionGroup (+15 more)

### Community 5 - "AddEmployeeDialog.tsx"
Cohesion: 0.16
Nodes (16): AddEmployeeDialog(), EMPLOYMENT_TYPE_OPTIONS, FormValues, OUTPUT_UNIT_SELECT_OPTIONS, PAY_RATE_TYPE_OPTIONS_WITH_MIXED, schema, EditCompensationForm(), OUTPUT_UNIT_SELECT_OPTIONS (+8 more)

### Community 6 - "payslipEmail.ts"
Cohesion: 0.13
Nodes (13): C, PayslipEmailMeta(), PayslipEmailTemplate(), SOCIAL_LINKS, BRAND, buildPayslipEmail(), formatPayPeriod(), longDate() (+5 more)

### Community 7 - "mock-data/index.ts"
Cohesion: 0.05
Nodes (38): generateBranchDepartments(), rank(), generateAttendanceAdjustments(), generateLeaveRequests(), generateSampleLeaveOverrides(), REASONS, attendanceRecords, EMPLOYEE_COUNT_BY_COMPANY (+30 more)

### Community 8 - "format.ts"
Cohesion: 0.07
Nodes (62): BadgeProps, STATUS_TONE, TONE_CLASSES, EmptyState(), EmptyStateProps, Switch, SwitchProps, Table (+54 more)

### Community 9 - "shared.tsx"
Cohesion: 0.09
Nodes (34): RFC-4180, ChartPane(), PdfExportMenu(), ReportCategory, ReportCategorySection(), ReportDef, ReportPrintFooter(), onExcel() (+26 more)

### Community 10 - "formatDate"
Cohesion: 0.08
Nodes (28): NotificationsBell(), DailyAttendanceTable(), lateNote(), statusBlock(), ScheduleReviewTable(), weekday(), PayrollCalendarSection(), PayrollGroupDetailDialog() (+20 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (34): Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, Card(), CardContent() (+26 more)

### Community 12 - "thirteenthMonthService.ts"
Cohesion: 0.15
Nodes (24): listDates(), ThirteenthMonthBreakdown(), activeWindowFor(), alreadyPaidEmployeeIds(), applySelection(), basicEarningsByMonth(), computeThirteenthMonthLine(), Coverage (+16 more)

### Community 13 - "PasswordValidationRules.php"
Cohesion: 0.11
Nodes (15): Controller, ProfileController, SecurityController, PasswordUpdateRequest, ProfileDeleteRequest, ProfileUpdateRequest, TwoFactorAuthenticationRequest, Illuminate\Auth\Middleware\RequirePassword (+7 more)

### Community 14 - "dashboardService.ts"
Cohesion: 0.08
Nodes (41): ComplianceDeadlinesSection(), remove(), countdown(), useDashboardData(), usePayrollDashboard(), usePendingRequestsSummary(), clampedDate(), COMPLIANCE_CATEGORY_OPTIONS (+33 more)

### Community 15 - "Illuminate\Http\Request"
Cohesion: 0.16
Nodes (3): OpsController, Illuminate\Http\Request, Inertia\Response

### Community 16 - "groupAssignment.ts"
Cohesion: 0.16
Nodes (12): compensationLabel(), PayrollGroupAssignDialog(), save(), CATEGORY_KEYWORDS, CATEGORY_LABEL, categoryLabel(), isSuggestedForGroup(), mode() (+4 more)

### Community 17 - "Company"
Cohesion: 0.10
Nodes (19): company(), ActivityLog, Branch, Company, Employee, ActivityLogFactory, BranchFactory, CompanyFactory (+11 more)

### Community 18 - "User"
Cohesion: 0.05
Nodes (31): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), User, Attribute, Illuminate\Auth\Events\Verified (+23 more)

### Community 19 - "thirteenth-month/routes.tsx"
Cohesion: 0.16
Nodes (20): PoweredByBrand(), ComputationDrawer(), useThirteenthMonthLines(), useThirteenthMonthRuns(), fullName(), MODE_OPTIONS, selectionLabel(), ThirteenthMonthPage() (+12 more)

### Community 20 - "computationBreakdown.ts"
Cohesion: 0.12
Nodes (24): estimatedHourlyRate(), AllocationDetail, allocationFormula(), buildComputationBreakdown(), ComputationBreakdown, ComputationSummary, DeductionItem, EarningItem (+16 more)

### Community 21 - "utils.ts"
Cohesion: 0.15
Nodes (15): InputError(), PasswordInput(), Props, TextLink(), Button(), buttonVariants, Checkbox(), Input() (+7 more)

### Community 22 - "AdvancedReports.tsx"
Cohesion: 0.11
Nodes (42): ATTENDANCE_KEYS, AttendanceAbsenteeismReport(), CATEGORY_COLORS, CHART_LEGEND_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE, CompensationAnalysisReport() (+34 more)

### Community 23 - "types/index.ts"
Cohesion: 0.09
Nodes (25): AppContent(), Props, AppShell(), Props, AppSidebarHeader(), Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis() (+17 more)

### Community 24 - "domain.ts"
Cohesion: 0.07
Nodes (38): onSubmit(), CONFIGURABLE_FREQUENCIES, MONTHLY, OTHER, PERIODIC, SEMI_MONTHLY, createBonus(), CreateBonusInput (+30 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.10
Nodes (31): AppSidebar(), footerNavItems, mainNavItems, NavFooter(), NavMain(), NavUser(), Sidebar(), SidebarContent() (+23 more)

### Community 26 - "cn"
Cohesion: 0.05
Nodes (71): TONE_DOT, CardBody, CardDescription, CardFooter, CardHeader, CardProps, CardRoot, CardTitle (+63 more)

### Community 27 - "payrollSettingsService.ts"
Cohesion: 0.07
Nodes (35): onSubmit(), toggleActive(), onSubmit(), toggleActive(), onSubmit(), toggleActive(), handleConfirm(), onSubmit() (+27 more)

### Community 28 - "branchDepartmentService.ts"
Cohesion: 0.19
Nodes (18): BranchDepartmentsPanel(), add(), changeSupervisor(), copyFrom(), remove(), saveRename(), change(), addBranchDepartment() (+10 more)

### Community 29 - "taxComplianceService.ts"
Cohesion: 0.13
Nodes (29): DeMinimisRow, useTaxComplianceData(), APPROACHING_RATIO, DE_MINIMIS_CATEGORIES, DeMinimisCategory, deMinimisCategoryFor(), monthsBetween(), monthsEmployedInYear() (+21 more)

### Community 30 - "payrollService.ts"
Cohesion: 0.10
Nodes (32): handleApprove(), handleHold(), handleRelease(), EmployeeContributionsTable(), useStatutoryConfig(), bonusAmountFor(), findEmployeePayrollGroup(), periodsPerMonthFor() (+24 more)

### Community 31 - "EssOvertimePage.tsx"
Cohesion: 0.07
Nodes (39): OvertimeHolidayRatesSection(), handleAddCustomRate(), handleReset(), handleSave(), syncDrafts(), toPctDraft(), onSubmit(), DEFAULT_HOLIDAY_RATES (+31 more)

### Community 32 - "RosterTab.tsx"
Cohesion: 0.10
Nodes (54): AttendancePeriodView(), EssScheduleContent(), VIEWS, WEEKDAYS, AssignPreset, AssignShiftDialog(), save(), fullName() (+46 more)

### Community 33 - "PayrollGroupDialog.tsx"
Cohesion: 0.15
Nodes (18): DeductionDefaults, FormValues, FREQUENCY_DEFAULTS, FREQUENCY_OPTIONS, PayrollGroupDialog(), handleFrequencyChange(), schema, toFormValues() (+10 more)

### Community 34 - "useReports.ts"
Cohesion: 0.11
Nodes (31): onSubmit(), useAttendanceSummary(), useEmployeeMasterlist(), useLeaveSummary(), usePayrollPeriodOptions(), usePayrollRegister(), useStatutoryContributionData(), formatPayrollNumber() (+23 more)

### Community 35 - "EmployeeProfileContent"
Cohesion: 0.14
Nodes (23): handleReassign(), handleRemove(), EmployeeProfileContent(), applyGroupChange(), applyPasswordReset(), applySeparation(), applyStatusChange(), onSubmit() (+15 more)

### Community 36 - "biometricsImport.ts"
Cohesion: 0.10
Nodes (34): ALIASES, BiometricsFormat, buildEmployeeMatcher(), buildSampleAttlog(), buildSampleZkCsv(), detectDelimiter(), devicePinFor(), EmployeeMatcher (+26 more)

### Community 37 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.10
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 38 - "loanTypeService.ts"
Cohesion: 0.24
Nodes (10): onSubmit(), allocationLabel(), LoanTypesView(), remove(), toggle(), createLoanType(), deleteLoanType(), loansUsingType() (+2 more)

### Community 39 - "dependencies"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, concurrently, @inertiajs/vite, laravel-vite-plugin, lucide-react, @nivo/bar, dependencies (+21 more)

### Community 40 - "app-header.tsx"
Cohesion: 0.12
Nodes (21): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Sheet(), SheetContent() (+13 more)

### Community 41 - "managerService.ts"
Cohesion: 0.24
Nodes (16): buildSampleLoans(), buildSamplePayslips(), useNotifications(), getAttendanceAdjustments(), getCompensationApprovals(), getPendingRequestsSummary(), getLeaveRequests(), getLeaveTypes() (+8 more)

### Community 42 - "leaveService.ts"
Cohesion: 0.14
Nodes (24): LeavePreview(), LeaveTypeForm(), onSubmit(), toFormValues(), HALF_DAY_LABEL, isHalfDay(), isWorkingDay(), leaveDayFraction() (+16 more)

### Community 43 - "useCompanySettings.ts"
Cohesion: 0.11
Nodes (27): onSubmit(), onSubmit(), toggle(), onSubmit(), useCompanySettings(), ChecklistStep, useOnboardingChecklist(), load() (+19 more)

### Community 44 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+12 more)

### Community 45 - "integrationService.ts"
Cohesion: 0.12
Nodes (26): useApiKeys(), useWebhooks(), AddWebhookDialog(), onSubmit(), ApiKeysTab(), onCreate(), onRevoke(), DataExportTab() (+18 more)

### Community 46 - "payrollRuns.ts"
Cohesion: 0.15
Nodes (26): handleFinalize(), handleRun(), finalizePayroll(), runPayroll(), addDays(), GROUP, historicalOvertime(), historicalWorkLogs() (+18 more)

### Community 47 - "use-appearance.tsx"
Cohesion: 0.14
Nodes (20): AppearanceToggleTab(), Toaster(), TooltipProvider(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme() (+12 more)

### Community 48 - "useSession.ts"
Cohesion: 0.06
Nodes (96): Button, ButtonProps, SIZE_CLASSES, VARIANT_CLASSES, Checkbox, Dialog, DialogClose, DialogContent (+88 more)

### Community 49 - "cn.ts"
Cohesion: 0.09
Nodes (40): Skeleton, EssCardList(), EssRecordCard(), EssTableView(), EssAttendancePage(), hoursWorkedFor(), REAL_STATUS_TONE, SAMPLE_STATUS_LABEL (+32 more)

### Community 50 - "leaveStatus.ts"
Cohesion: 0.27
Nodes (11): annotateImportWithLeaves(), ApprovedLeave, approvedLeaveOn(), fromMinutes(), LeaveAwareStatus, LeaveResolution, PORTION_LABEL, resolveLeaveStatus() (+3 more)

### Community 51 - "approvals/routes.tsx"
Cohesion: 0.14
Nodes (20): FilterField(), FiltersPopover(), FiltersPopoverProps, SortControl(), SortControlProps, SortDirection, SearchFilterBar(), SearchFilterBarProps (+12 more)

### Community 52 - "ActivityLogPanel.tsx"
Cohesion: 0.17
Nodes (17): ActivityLogPanel(), DATE_RANGES, DetailsPanel(), KIND_TONE, kindOf(), KindPill(), Module, moduleOf() (+9 more)

### Community 53 - "payFrequency.ts"
Cohesion: 0.19
Nodes (22): allocateMonthly(), allocateOne(), AllocationConfig, AVERAGE_PERIODS_PER_MONTH, coveredCutoffs(), cutoffAt(), cutoffLabel(), daysBetween() (+14 more)

### Community 54 - "employeeService.ts"
Cohesion: 0.13
Nodes (26): onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), onSubmit(), releaseSupervisorIfMoved() (+18 more)

### Community 55 - "leave/routes.tsx"
Cohesion: 0.17
Nodes (13): LeaveFilterBar(), LeaveTypeDialog(), LeaveTypesPanel(), fmt(), TeamLeaveCreditsPanel(), getEmployeeHierarchyLevel(), HIERARCHY_LABEL, HIERARCHY_LEVELS (+5 more)

### Community 56 - "bootstrap/app.php"
Cohesion: 0.11
Nodes (14): EnsureUserIsActive, HandleAppearance, HandleInertiaRequests, Closure, Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets (+6 more)

### Community 57 - "attendanceService.ts"
Cohesion: 0.09
Nodes (38): decodeBiometricsFile(), ImportBiometricsDialog(), applyMapping(), finish(), handleApply(), handleImport(), reset(), showPreview() (+30 more)

### Community 58 - "compensationApprovalService.ts"
Cohesion: 0.13
Nodes (21): CompensationApprovalsPage(), decide(), formatQuantity(), unitNoun(), useCompensationApprovals(), hasAny(), PeriodScope, plural() (+13 more)

### Community 59 - "ImportBiometricsDialog.tsx"
Cohesion: 0.08
Nodes (38): BiometricsParseResult, ColumnMapping, DailyImportRecord, MAPPING_FIELDS, STANDARD_TEMPLATE_HEADERS, ColumnMappingForm(), ACTION_META, DeviceType (+30 more)

### Community 60 - "compilerOptions"
Cohesion: 0.09
Nodes (22): resources/js/**/*.d.ts, ./resources/js/ops/*, ./resources/js/ops/shim/react-router-dom.tsx, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, esModuleInterop (+14 more)

### Community 61 - "PayrollPeriodDetailPage.tsx"
Cohesion: 0.05
Nodes (62): RadioGroup, RadioGroupItem, BONUS_TYPE_LABEL, BonusPayslipDocument(), BonusPayslipPage(), AddBonusDialog(), BONUS_TYPE_OPTIONS, BonusFormDialog() (+54 more)

### Community 62 - "CompanyInfoForm.tsx"
Cohesion: 0.12
Nodes (26): COMPANY_TYPE_OPTIONS, CompanyInfoForm(), detectColor(), handleLogoChange(), onSubmit(), EMPTY_ADDRESS, EMPTY_CONTACT, FormValues (+18 more)

### Community 63 - "fullName"
Cohesion: 0.27
Nodes (17): DeMinimisBenefitsReport(), onExport(), EmployeeCell(), fullName(), money(), r2(), TaxableCompensationReport(), onExport() (+9 more)

### Community 65 - "BasicReports.tsx"
Cohesion: 0.10
Nodes (44): onFileSelected(), useEmployees(), DebitCreditReport(), onExport(), BenefitsReportView(), onExport(), comboboxOptions(), employeeFilterMeta() (+36 more)

### Community 66 - "plans.ts"
Cohesion: 0.20
Nodes (14): NavItem, NavItemLink(), PlanGate(), PlanGateProps, FEATURE_LABELS, formatPlanPrice(), minimumPlanFor(), PLAN_ORDER (+6 more)

### Community 67 - "Illuminate\Database\Seeder"
Cohesion: 0.13
Nodes (9): Capabilities, DatabaseSeeder, RoleSeeder, UserSeeder, Illuminate\Database\Seeder, Spatie\Permission\DefaultTeamResolver, Spatie\Permission\Models\Permission, Spatie\Permission\Models\Role (+1 more)

### Community 68 - "getEmployees"
Cohesion: 0.13
Nodes (28): onSubmit(), useOvertimeRecords(), useOvertimeSummary(), daysAgo(), downloadCsv(), OvertimePage(), handleBulkDecide(), handleDecide() (+20 more)

### Community 69 - "xlsx.ts"
Cohesion: 0.13
Nodes (22): bodyXfs(), buildXlsx(), cellXml(), columnLetter(), crc32(), CRC_TABLE, DEFAULT_XLSX_PALETTE, displayLength() (+14 more)

### Community 70 - "handleDownloadSample"
Cohesion: 0.27
Nodes (10): buildStandardTemplateCsv(), downloadText(), downloadIssues(), handleDownloadSample(), handleDownloadTemplate(), downloadSample(), downloadCsv(), toCsv() (+2 more)

### Community 71 - "branchService.ts"
Cohesion: 0.15
Nodes (20): fullName(), AddBranchDialog(), close(), onSubmit(), BranchDetailsDialog(), moveEmployee(), setManager(), useBranches() (+12 more)

### Community 72 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 73 - "subscription/routes.tsx"
Cohesion: 0.27
Nodes (11): GatedApiTabs(), useSubscriptionUsage(), ChangePlanDialog(), onConfirm(), SubscriptionPage(), estimateMonthlyBill(), formatEmployeeLimit(), formatPlanBasePrice() (+3 more)

### Community 74 - "PayslipCard.tsx"
Cohesion: 0.18
Nodes (11): allocationHint(), BENEFIT_CATEGORY_LABEL, BenefitsCard(), BreakdownCard(), BreakdownRow, DEDUCTION_KIND_LABEL, EMPLOYMENT_TYPE_LABEL, OVERTIME_LABELS (+3 more)

### Community 75 - "StoreEmployeeRequest"
Cohesion: 0.16
Nodes (6): EmployeeController, StoreEmployeeRequest, UpdateEmployeeRequest, ActivityLogger, Illuminate\Support\Facades\Route, Illuminate\Validation\Rule

### Community 76 - "FortifyServiceProvider"
Cohesion: 0.17
Nodes (6): AppServiceProvider, FortifyServiceProvider, Carbon\CarbonImmutable, Illuminate\Support\Facades\Date, Illuminate\Support\Facades\DB, Illuminate\Support\ServiceProvider

### Community 77 - "loanService.ts"
Cohesion: 0.13
Nodes (17): save(), onSubmit(), changeStatus(), createLoan(), CreateLoanInput, createLoansForType(), CreateLoansResult, LoanTypeEntry (+9 more)

### Community 78 - "rateBasis.ts"
Cohesion: 0.23
Nodes (12): basicPayFor(), computePaidDays(), computePaidHours(), hashString(), HOURLY_WORK_LOG_LABEL, mockOutputQuantity(), OUTPUT_WORK_LOG_LABEL, outputUnitWord() (+4 more)

### Community 79 - "ConsolidatedStatutoryReport"
Cohesion: 0.27
Nodes (11): addTotals(), Bir1601CReport(), onExport(), ConsolidatedStatutoryReport(), onExport(), ContributionBreakdown(), ContributionCells(), employeeTotal() (+3 more)

### Community 80 - "employees.ts"
Cohesion: 0.15
Nodes (16): OUTPUT_UNIT_OPTIONS, buildCompensationHistory(), COMP_APPROVERS, COMP_HISTORY_REASONS, DEPARTMENT_CATEGORY, DEPARTMENTS, FIRST_NAMES, generateEmployeesForCompany() (+8 more)

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
Cohesion: 0.05
Nodes (57): useToast(), AdjustmentRequestDialog(), onSubmit(), FileAdjustmentDialog(), onSubmit(), AssignEmployeesDialog(), close(), handleAssign() (+49 more)

### Community 85 - "reports/routes.tsx"
Cohesion: 0.11
Nodes (25): fullName(), HoursWorkedReport(), onExport(), OutputSummaryReport(), onExport(), sinceKey(), toMinutes(), useFilters() (+17 more)

### Community 86 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 87 - "ResetPasswordPage.tsx"
Cohesion: 0.11
Nodes (23): ForgotPasswordPage(), handleResend(), onSubmit(), send(), FormValues, INVALID_COPY, ResetPasswordPage(), schema (+15 more)

### Community 88 - "xlsxRead.ts"
Cohesion: 0.26
Nodes (13): BUILTIN_DATE_FORMATS, columnIndex(), csvCell(), dateFormatFlags(), decoder, elements(), pad2(), parseXml() (+5 more)

### Community 89 - "benefitsDeductions.ts"
Cohesion: 0.25
Nodes (13): daysFromToday(), DEDUCTION_PLAN_CATALOG, deductionPlanId(), generateBenefitPlans(), generateBenefits(), generateDeductionPlans(), generateEmployeeDeductions(), iso() (+5 more)

### Community 90 - "delete-user.tsx"
Cohesion: 0.24
Nodes (10): DeleteUser(), Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+2 more)

### Community 91 - "Employee"
Cohesion: 0.06
Nodes (71): AddEmployeesToPlanDialog(), save(), today(), BenefitDialog(), onSubmit(), FormValues, schema, toFormValues() (+63 more)

### Community 92 - "payrollInputsService.ts"
Cohesion: 0.24
Nodes (11): fullName(), getPayrollInputs(), InputsPeriod, inRange(), OtherInputRow, OutputInputRow, overlaps(), PayrollInputs (+3 more)

### Community 93 - "require-dev"
Cohesion: 0.17
Nodes (12): require-dev, fakerphp/faker, larastan/larastan, laravel/boost, laravel/pail, laravel/pao, laravel/pint, laravel/sail (+4 more)

### Community 94 - "SessionUser"
Cohesion: 0.17
Nodes (13): SessionState, delay(), sendPayslipEmail(), SendPayslipEmailInput, DAYS_AGO, generateActivityLog(), Template, TEMPLATES (+5 more)

### Community 95 - "devDependencies"
Cohesion: 0.18
Nodes (11): babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, @rolldown/plugin-babel, @types/node, vite-plus (+3 more)

### Community 96 - "package.json"
Cohesion: 0.18
Nodes (10): private, $schema, scripts, build, build:ssr, check, check:fix, dev (+2 more)

### Community 97 - "app-logo-icon.tsx"
Cohesion: 0.27
Nodes (5): AppLogo(), AppLogoIcon(), AuthSimpleLayout(), AuthLayout(), AuthLayoutProps

### Community 98 - "PayrollPeriod"
Cohesion: 0.24
Nodes (10): PeriodContext, ATTENDANCE_SHAPE, buildSampleAttendance(), SAMPLE_PERIODS, SampleAttendanceRow, SampleAttendanceStatus, SamplePayslip, PayrollLineWithContext (+2 more)

### Community 99 - "Reusable Component Boilerplate Report"
Cohesion: 0.18
Nodes (10): 14. Gaps and next steps, 15. Team onboarding checklist, 1. How to use this document, 2. Stack baseline, 3. Portability tiers, 8.1 React (recommended), 8.2 Server side (emails, PDFs), optional, 8. Markdown rendering boilerplate (+2 more)

### Community 100 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (12): BRAND_NAME, BrandLogo(), BrandSplash(), POWERED_BY_NAME, AuthLayout(), FEATURE_BADGES, IconField(), FormValues (+4 more)

### Community 101 - "mixedCompensationStore.ts"
Cohesion: 0.24
Nodes (10): EmployeeTable(), BASE_UNIT_LONG, BASE_UNIT_SHORT, formatPesoShort(), MixedBaseType, MixedCompensationState, MixedComponentType, summarizeMixedCompensationShort() (+2 more)

### Community 102 - "Topbar.tsx"
Cohesion: 0.22
Nodes (9): ROLE_LABELS, Topbar(), ThemeToggle(), useTheme(), applyThemeClass(), systemPrefersDark(), Theme, ThemeState (+1 more)

### Community 103 - "require"
Cohesion: 0.22
Nodes (9): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php (+1 more)

### Community 104 - "InputRecordViews.tsx"
Cohesion: 0.24
Nodes (9): count(), hours(), OtherRow, OutputRecordsView(), OutputRow, outputTone(), Stat(), TimeRecordsView() (+1 more)

### Community 105 - "OpsPage.tsx"
Cohesion: 0.24
Nodes (7): ToastProvider(), AuthedPage(), OpsPage(), OpsProps, syncMockSession(), OPS_PAGES, OutletProvider

### Community 106 - "DemoSwitchers.tsx"
Cohesion: 0.38
Nodes (6): RoleSwitcherDropdown(), TierSwitcherDropdown(), MobileDemoBar(), DemoPlanState, useDemoPlanStore, PlanTier

### Community 107 - "createEmployee"
Cohesion: 0.22
Nodes (9): onSubmit(), resetAll(), onImport(), reset(), DataImportTab(), onImport(), createEmployee(), importEmployees() (+1 more)

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
Nodes (7): EmployeeCombobox(), toggle(), EmployeeComboboxBaseProps, EmployeeComboboxMultiProps, EmployeeComboboxOption, EmployeeComboboxProps, EmployeeComboboxSingleProps

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

### Community 118 - "LoginPage"
Cohesion: 0.83
Nodes (4): LoginPage(), onDemoLogin(), onSubmit(), submit()

### Community 119 - "attendance.ts"
Cohesion: 0.83
Nodes (3): generateAttendanceRecords(), pickStatus(), toDateKey()

### Community 120 - "WithholdingTaxCard.tsx"
Cohesion: 0.13
Nodes (26): AddBracketButton(), BracketReadout(), BracketRow(), BracketSaveBar(), BracketSummary(), formatPeso(), NumberField(), useAccordionRows() (+18 more)

### Community 121 - "10. Deployment: Octane / FrankenPHP / Coolify"
Cohesion: 0.29
Nodes (7): 10.1 Topology, 10.2 Dockerfile skeleton, 10.3 `scripts/deploy.sh` skeleton (web container start), 10.4 Environment keys (names only), 10.5 Octane-safety checklist, 10.6 Rolling-deploy rules, 10. Deployment: Octane / FrankenPHP / Coolify

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

### Community 130 - "employeeImport.ts"
Cohesion: 0.16
Nodes (15): RosterData, CIVIL_STATUSES, EMPLOYMENT_TYPES, IMPORT_COLUMNS, ImportColumn, ImportParseResult, ImportRow, normalize() (+7 more)

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

### Community 141 - "6. Backend CRUD boilerplate"
Cohesion: 0.50
Nodes (4): 6.1 Route macro: `Route::crudModule($prefix, Controller::class, $name)`, 6.2 `BaseController` (`app/Http/Controllers/v1/BaseController.php`), 6.3 Reference pair (copy these, not the screens that diverge), 6. Backend CRUD boilerplate

### Community 142 - "9. Conventions"
Cohesion: 0.50
Nodes (4): 9.1 Tailwind v4 tokens (`resources/css/app.css`, no `tailwind.config`), 9.2 Styling rules, 9.3 Loading, toasts, confirms, a11y, 9. Conventions

### Community 193 - "formatCurrency"
Cohesion: 0.09
Nodes (32): ConfigSummary(), ALLOCATION_METHOD_LABEL, AllocationBadge(), ApprovedWorkLogs(), EmployeeComputationDrawer(), FREQUENCY_LABEL, LineRow(), OtherInputsView() (+24 more)

### Community 196 - "overtime/routes.tsx"
Cohesion: 0.11
Nodes (27): Avatar, AvatarProps, SIZE_CLASSES, StatusBadge(), BulkActionBar(), RowCheckbox(), SelectAllCheckbox(), AdjustmentsList() (+19 more)

## Knowledge Gaps
- **801 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+796 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSession()` connect `useSession` to `RecurringDeductionsView.tsx`, `useTenant`, `Sidebar.tsx`, `EmployeeProfilePage.tsx`, `RolePermissionsDialog.tsx`, `AddEmployeeDialog.tsx`, `format.ts`, `shared.tsx`, `formatDate`, `thirteenthMonthService.ts`, `dashboardService.ts`, `groupAssignment.ts`, `thirteenth-month/routes.tsx`, `cn`, `payrollSettingsService.ts`, `branchDepartmentService.ts`, `taxComplianceService.ts`, `payrollService.ts`, `EssOvertimePage.tsx`, `RosterTab.tsx`, `PayrollGroupDialog.tsx`, `useReports.ts`, `EmployeeProfileContent`, `loanTypeService.ts`, `managerService.ts`, `leaveService.ts`, `useCompanySettings.ts`, `integrationService.ts`, `useSession.ts`, `cn.ts`, `approvals/routes.tsx`, `attendanceService.ts`, `compensationApprovalService.ts`, `ImportBiometricsDialog.tsx`, `PayrollPeriodDetailPage.tsx`, `CompanyInfoForm.tsx`, `BasicReports.tsx`, `plans.ts`, `formatCurrency`, `overtime/routes.tsx`, `getEmployees`, `branchService.ts`, `subscription/routes.tsx`, `Employee`, `Topbar.tsx`, `DemoSwitchers.tsx`, `createEmployee`, `WithholdingTaxCard.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useSession` to `RecurringDeductionsView.tsx`, `useTenant`, `EmployeeProfilePage.tsx`, `AddEmployeeDialog.tsx`, `format.ts`, `formatDate`, `dashboardService.ts`, `groupAssignment.ts`, `thirteenth-month/routes.tsx`, `branchDepartmentService.ts`, `EssOvertimePage.tsx`, `RosterTab.tsx`, `PayrollGroupDialog.tsx`, `EmployeeProfileContent`, `loanTypeService.ts`, `leaveService.ts`, `integrationService.ts`, `useSession.ts`, `cn.ts`, `approvals/routes.tsx`, `ActivityLogPanel.tsx`, `attendanceService.ts`, `compensationApprovalService.ts`, `ImportBiometricsDialog.tsx`, `PayrollPeriodDetailPage.tsx`, `CompanyInfoForm.tsx`, `CustomReportBuilder`, `BasicReports.tsx`, `overtime/routes.tsx`, `getEmployees`, `branchService.ts`, `subscription/routes.tsx`, `ResetPasswordPage.tsx`, `Employee`, `LoginPage.tsx`, `createEmployee`, `LoginPage`, `WithholdingTaxCard.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `formatCurrency` to `RecurringDeductionsView.tsx`, `EmployeeProfilePage.tsx`, `AddEmployeeDialog.tsx`, `format.ts`, `formatDate`, `thirteenthMonthService.ts`, `thirteenth-month/routes.tsx`, `computationBreakdown.ts`, `AdvancedReports.tsx`, `cn`, `payrollService.ts`, `EssOvertimePage.tsx`, `EmployeeProfileContent`, `loanTypeService.ts`, `managerService.ts`, `useSession.ts`, `cn.ts`, `approvals/routes.tsx`, `compensationApprovalService.ts`, `PayrollPeriodDetailPage.tsx`, `fullName`, `BasicReports.tsx`, `plans.ts`, `overtime/routes.tsx`, `getEmployees`, `branchService.ts`, `subscription/routes.tsx`, `PayslipCard.tsx`, `rateBasis.ts`, `ConsolidatedStatutoryReport`, `useSession`, `reports/routes.tsx`, `Employee`, `mixedCompensationStore.ts`, `InputRecordViews.tsx`, `WithholdingTaxCard.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _801 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RecurringDeductionsView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058173076923076925 - nodes in this community are weakly interconnected._
- **Should `useTenant` be split into smaller, more focused modules?**
  _Cohesion score 0.1310344827586207 - nodes in this community are weakly interconnected._
- **Should `Sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._