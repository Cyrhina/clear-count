# Graph Report - laravel-fbs-ops  (2026-10-08)

## Corpus Check
- 527 files · ~271,112 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3594 nodes · 12783 edges · 182 communities (144 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fb892ac2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DeductionsView.tsx
- useSession.ts
- react-router-dom.tsx
- EmployeeProfilePage.tsx
- user-access/routes.tsx
- AddEmployeeDialog.tsx
- PayslipEmailPreviewDialog.tsx
- mock-data/index.ts
- format.ts
- shared.tsx
- approvals/routes.tsx
- cn
- thirteenthMonthService.ts
- PasswordValidationRules.php
- dashboardService.ts
- Illuminate\Http\Request
- groupAssignment.ts
- Company
- User
- fullName
- computationBreakdown.ts
- utils.ts
- AdvancedReports.tsx
- types/index.ts
- domain.ts
- sidebar.tsx
- cn
- payrollSettingsService.ts
- NewOvertimeRequestDialog.tsx
- TaxComplianceReports.tsx
- payrollService.ts
- otApplicationStore.ts
- RosterTab.tsx
- PayrollRulesSection.tsx
- getEmployees
- EmployeeProfileContent
- biometricsImport.ts
- Illuminate\Database\Migrations\Migration
- loanTypeService.ts
- dependencies
- app-header.tsx
- FileAdjustmentDialog.tsx
- leaveService.ts
- useCompanySettings.ts
- dropdown-menu.tsx
- integrationService.ts
- payrollRuns.ts
- use-appearance.tsx
- Select.tsx
- EssPayslipsPage.tsx
- leaveStatus.ts
- EmployeeLoansView.tsx
- PayslipDetailPage.tsx
- payFrequency.ts
- employeeService.ts
- OvertimeHolidayRatesSection
- bootstrap/app.php
- attendanceService.ts
- compensationApprovalService.ts
- Schedule
- compilerOptions
- formatCurrency
- brandTheme.ts
- CustomReportBuilder
- StatutoryReports.tsx
- Illuminate\Database\Seeder
- overtimeService.ts
- xlsx.ts
- ImportBiometricsDialog.tsx
- Employee
- components.json
- useRoster.ts
- AddBonusDialog.tsx
- StoreEmployeeRequest
- FortifyServiceProvider
- loanService.ts
- employees.ts
- scripts
- optionalDependencies
- layout.tsx
- useSession
- BasicReports.tsx
- composer.json
- ResetPasswordPage.tsx
- xlsxRead.ts
- benefitsDeductions.ts
- delete-user.tsx
- BulkEmployeeActions.tsx
- require-dev
- SessionUser
- devDependencies
- package.json
- app-logo-icon.tsx
- Reusable Component Boilerplate Report
- OpsPage.tsx
- mixedCompensationStore.ts
- themeStore.ts
- require
- ScheduleDialog.tsx
- overtime.ts
- setup
- EmployeeCombobox.tsx
- global.d.ts
- 7. New CRUD module template
- UserFactory
- config
- ci:check
- TestCase
- WithholdingTaxCard.tsx
- 10. Deployment: Octane / FrankenPHP / Coolify
- createPayrollPeriod
- 11. Table prefix convention `app_`
- psr-4
- laravel
- test
- logging.php
- placeholder-pattern.tsx
- use-clipboard.ts
- employeeImport.ts
- insights/routes.tsx
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
- payRate.ts
- overtime/routes.tsx

## God Nodes (most connected - your core abstractions)
1. `useSession()` - 304 edges
2. `useToast()` - 183 edges
3. `formatCurrency()` - 168 edges
4. `cn()` - 165 edges
5. `formatDate()` - 131 edges
6. `Button` - 127 edges
7. `Employee` - 127 edges
8. `cn()` - 123 edges
9. `Select` - 85 edges
10. `Input` - 77 edges

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

## Communities (182 total, 38 thin omitted)

### Community 0 - "DeductionsView.tsx"
Cohesion: 0.11
Nodes (20): DeductionDialog(), FormValues, KIND_OPTIONS, schema, toFormValues(), COPY, DeductionsView(), noteFor() (+12 more)

### Community 1 - "useSession.ts"
Cohesion: 0.08
Nodes (45): Button, ButtonProps, SIZE_CLASSES, VARIANT_CLASSES, EmployeePickerPanel(), fullName(), FormField(), FormFieldProps (+37 more)

### Community 2 - "react-router-dom.tsx"
Cohesion: 0.05
Nodes (67): AppShell(), readStoredCollapsed(), ROLE_LABELS, RoleSwitcherDropdown(), TierSwitcherDropdown(), MobileDemoBar(), ADMIN_NAV, EMPLOYEE_NAV (+59 more)

### Community 3 - "EmployeeProfilePage.tsx"
Cohesion: 0.06
Nodes (55): PageHeader(), PageHeaderProps, PlainCards(), Skeleton, Tabs, TabsContent, TabsList, TabsTrigger (+47 more)

### Community 4 - "user-access/routes.tsx"
Cohesion: 0.05
Nodes (60): Tooltip(), ActivityLogPanel(), DATE_RANGES, DetailsPanel(), KIND_TONE, kindOf(), KindPill(), Module (+52 more)

### Community 5 - "AddEmployeeDialog.tsx"
Cohesion: 0.12
Nodes (21): AddEmployeeDialog(), EMPLOYMENT_TYPE_OPTIONS, FormValues, OUTPUT_UNIT_SELECT_OPTIONS, PAY_RATE_TYPE_OPTIONS_WITH_MIXED, schema, EditCompensationForm(), OUTPUT_UNIT_SELECT_OPTIONS (+13 more)

### Community 6 - "PayslipEmailPreviewDialog.tsx"
Cohesion: 0.11
Nodes (17): BulkEmailCandidate, PayslipEmailPreviewDialog(), PreviewMode, C, PayslipEmailMeta(), PayslipEmailTemplate(), SOCIAL_LINKS, PayslipEmailTarget (+9 more)

### Community 7 - "mock-data/index.ts"
Cohesion: 0.05
Nodes (40): generateAttendanceRecords(), pickStatus(), toDateKey(), generateBranchDepartments(), rank(), generateAttendanceAdjustments(), generateLeaveRequests(), generateSampleLeaveOverrides() (+32 more)

### Community 8 - "format.ts"
Cohesion: 0.08
Nodes (56): Badge, BadgeProps, STATUS_TONE, StatusBadge(), TONE_CLASSES, Card, EmptyState(), EmptyStateProps (+48 more)

### Community 9 - "shared.tsx"
Cohesion: 0.08
Nodes (42): RFC-4180, exportSelected(), ChartPane(), PdfExportMenu(), ReportCategory, ReportCategorySection(), ReportDef, ReportPrintFooter() (+34 more)

### Community 10 - "approvals/routes.tsx"
Cohesion: 0.16
Nodes (13): Avatar, AvatarProps, SIZE_CLASSES, CompensationApprovalsPage(), decide(), formatQuantity(), STATUS_OPTIONS, TYPE_OPTIONS (+5 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (34): Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, Card(), CardContent() (+26 more)

### Community 12 - "thirteenthMonthService.ts"
Cohesion: 0.12
Nodes (29): listDates(), ThirteenthMonthBreakdown(), handleFinalize(), handleGenerate(), monthlyEquivalentFor(), activeWindowFor(), alreadyPaidEmployeeIds(), applySelection() (+21 more)

### Community 13 - "PasswordValidationRules.php"
Cohesion: 0.11
Nodes (15): Controller, ProfileController, SecurityController, PasswordUpdateRequest, ProfileDeleteRequest, ProfileUpdateRequest, TwoFactorAuthenticationRequest, Illuminate\Auth\Middleware\RequirePassword (+7 more)

### Community 14 - "dashboardService.ts"
Cohesion: 0.09
Nodes (38): ComplianceDeadlinesSection(), remove(), countdown(), useDashboardData(), clampedDate(), COMPLIANCE_CATEGORY_OPTIONS, COMPLIANCE_FREQUENCY_OPTIONS, coveredMonthName() (+30 more)

### Community 15 - "Illuminate\Http\Request"
Cohesion: 0.16
Nodes (3): OpsController, Illuminate\Http\Request, Inertia\Response

### Community 16 - "groupAssignment.ts"
Cohesion: 0.21
Nodes (9): PayrollGroupAssignDialog(), save(), CATEGORY_KEYWORDS, CATEGORY_LABEL, categoryLabel(), isSuggestedForGroup(), mode(), referenceProfile() (+1 more)

### Community 17 - "Company"
Cohesion: 0.10
Nodes (19): company(), ActivityLog, Branch, Company, Employee, ActivityLogFactory, BranchFactory, CompanyFactory (+11 more)

### Community 18 - "User"
Cohesion: 0.05
Nodes (31): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), User, Attribute, Illuminate\Auth\Events\Verified (+23 more)

### Community 19 - "fullName"
Cohesion: 0.16
Nodes (15): onFileSelected(), BenefitsReportView(), onExport(), comboboxOptions(), employeeFilterMeta(), EmployeeMasterListReport(), onExport(), filterCsvRows() (+7 more)

### Community 20 - "computationBreakdown.ts"
Cohesion: 0.09
Nodes (32): AllocationDetail, allocationFormula(), buildComputationBreakdown(), ComputationBreakdown, ComputationSummary, DeductionItem, EarningItem, OVERTIME_EARNING_LABELS (+24 more)

### Community 21 - "utils.ts"
Cohesion: 0.15
Nodes (15): InputError(), PasswordInput(), Props, TextLink(), Button(), buttonVariants, Checkbox(), Input() (+7 more)

### Community 22 - "AdvancedReports.tsx"
Cohesion: 0.07
Nodes (41): useOvertimeRecords(), ATTENDANCE_KEYS, AttendanceAbsenteeismReport(), CATEGORY_COLORS, CHART_LEGEND_STYLE, CHART_TOOLTIP_ITEM_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE (+33 more)

### Community 23 - "types/index.ts"
Cohesion: 0.09
Nodes (25): AppContent(), Props, AppShell(), Props, AppSidebarHeader(), Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis() (+17 more)

### Community 24 - "domain.ts"
Cohesion: 0.06
Nodes (45): onSubmit(), handleDecision(), handleSubmit(), FormValues, onSubmit(), toggle(), createBonus(), CreateBonusInput (+37 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.10
Nodes (31): AppSidebar(), footerNavItems, mainNavItems, NavFooter(), NavMain(), NavUser(), Sidebar(), SidebarContent() (+23 more)

### Community 26 - "cn"
Cohesion: 0.05
Nodes (70): NotificationsBell(), TONE_DOT, CardBody, CardDescription, CardFooter, CardHeader, CardProps, CardRoot (+62 more)

### Community 27 - "payrollSettingsService.ts"
Cohesion: 0.10
Nodes (24): onSubmit(), toggleActive(), onSubmit(), toggleActive(), handleConfirm(), onSubmit(), PayrollGroupsSection(), toggleStatus() (+16 more)

### Community 28 - "NewOvertimeRequestDialog.tsx"
Cohesion: 0.20
Nodes (12): DEFAULT_HOLIDAY_RATES, DEFAULT_OT_RATES, formatMultiplierPct(), HolidayRateType, otRateOptionLabel(), OtRateType, PayrollRatesState, usePayrollRatesStore (+4 more)

### Community 29 - "TaxComplianceReports.tsx"
Cohesion: 0.08
Nodes (53): CardSelectionContext, DeMinimisBenefitsReport(), onExport(), DeMinimisRow, EmployeeCell(), fullName(), money(), MoneyCell() (+45 more)

### Community 30 - "payrollService.ts"
Cohesion: 0.11
Nodes (32): handleHold(), handleRelease(), handleRun(), rowData(), BONUS_PAYOUT_MODE_LABEL, bonusAmountFor(), includedInRegularPayroll(), workLogsForPeriod (+24 more)

### Community 31 - "otApplicationStore.ts"
Cohesion: 0.21
Nodes (13): OvertimeApplicationDialog(), handleSubmit(), onOpenChange(), reset(), computeTotalHours(), CreateOtApplicationInput, daysAgo(), OtApplication (+5 more)

### Community 32 - "RosterTab.tsx"
Cohesion: 0.14
Nodes (39): EssScheduleContent(), VIEWS, WEEKDAYS, AssignPreset, AssignShiftDialog(), fullName(), initials(), MonthCalendar() (+31 more)

### Community 33 - "PayrollRulesSection.tsx"
Cohesion: 0.14
Nodes (21): PayrollGroupDialog(), handleFrequencyChange(), toFormValues(), ABSENCE_BASIS_OPTIONS, ABSENCE_HANDLING_OPTIONS, FormValues, LATE_DEDUCTION_METHOD_OPTIONS, PayrollRulesSection() (+13 more)

### Community 34 - "getEmployees"
Cohesion: 0.14
Nodes (28): PeriodContext, handleTrySample(), showPreview(), SamplePayslip, usePayrollLines(), useAttendanceSummary(), useLeaveSummary(), useStatutoryContributionData() (+20 more)

### Community 35 - "EmployeeProfileContent"
Cohesion: 0.25
Nodes (10): PayrollGroupDetailDialog(), handleReassign(), handleRemove(), EmployeeProfileContent(), applyGroupChange(), applyPasswordReset(), applySeparation(), applyStatusChange() (+2 more)

### Community 36 - "biometricsImport.ts"
Cohesion: 0.11
Nodes (31): ALIASES, BiometricsFormat, buildEmployeeMatcher(), buildSampleZkCsv(), detectDelimiter(), devicePinFor(), EmployeeMatcher, EMPTY_MAPPING (+23 more)

### Community 37 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.10
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 38 - "loanTypeService.ts"
Cohesion: 0.24
Nodes (9): onSubmit(), remove(), toggle(), createLoanType(), deleteLoanType(), getLoanTypes(), loansUsingType(), LoanTypeInput (+1 more)

### Community 39 - "dependencies"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, concurrently, @inertiajs/vite, laravel-vite-plugin, lucide-react, @nivo/bar, dependencies (+21 more)

### Community 40 - "app-header.tsx"
Cohesion: 0.12
Nodes (21): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Sheet(), SheetContent() (+13 more)

### Community 41 - "FileAdjustmentDialog.tsx"
Cohesion: 0.28
Nodes (8): FileAdjustmentDialog(), onSubmit(), FormValues, REASON_CATEGORY_OPTIONS, schema, createAttendanceAdjustment(), fileAttendanceAdjustment(), getAttendanceRecordForEmployeeDate()

### Community 42 - "leaveService.ts"
Cohesion: 0.09
Nodes (35): ApprovedLeave, usePayrollInputs(), HALF_DAY_LABEL, isHalfDay(), isWorkingDay(), leaveDayFraction(), leaveRequestDays(), nextDay() (+27 more)

### Community 43 - "useCompanySettings.ts"
Cohesion: 0.16
Nodes (21): onSubmit(), useCompanySettings(), ChecklistStep, useOnboardingChecklist(), load(), CreateHolidayInput, createSchedule(), CreateScheduleInput (+13 more)

### Community 44 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+12 more)

### Community 45 - "integrationService.ts"
Cohesion: 0.09
Nodes (39): useBranches(), useBranchSummaries(), useApiKeys(), useWebhooks(), AddWebhookDialog(), onSubmit(), ApiKeysTab(), onCreate() (+31 more)

### Community 46 - "payrollRuns.ts"
Cohesion: 0.15
Nodes (27): handleApprove(), handleFinalize(), approvePayroll(), finalizePayroll(), transition(), addDays(), GROUP, historicalOvertime() (+19 more)

### Community 47 - "use-appearance.tsx"
Cohesion: 0.14
Nodes (20): AppearanceToggleTab(), Toaster(), TooltipProvider(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme() (+12 more)

### Community 48 - "Select.tsx"
Cohesion: 0.08
Nodes (48): Checkbox, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Select (+40 more)

### Community 49 - "EssPayslipsPage.tsx"
Cohesion: 0.11
Nodes (31): EssAttendancePage(), hoursWorkedFor(), REAL_STATUS_TONE, SAMPLE_STATUS_LABEL, SAMPLE_STATUS_TONE, AttendanceCalendar(), EssHomePage(), monthKeyOf() (+23 more)

### Community 50 - "leaveStatus.ts"
Cohesion: 0.36
Nodes (8): annotateImportWithLeaves(), fromMinutes(), LeaveAwareStatus, LeaveResolution, PORTION_LABEL, resolveLeaveStatus(), shiftMidpoint(), toMinutes()

### Community 51 - "EmployeeLoansView.tsx"
Cohesion: 0.10
Nodes (31): FilterField(), FiltersPopover(), FiltersPopoverProps, SortControl(), SortControlProps, SortDirection, SearchFilterBar(), SearchFilterBarProps (+23 more)

### Community 52 - "PayslipDetailPage.tsx"
Cohesion: 0.39
Nodes (7): useEmployee(), PayslipDetailPage(), getEmployee(), getPayrollLine(), getDeductionConfigs(), getPayrollGroups(), DeductionConfig

### Community 53 - "payFrequency.ts"
Cohesion: 0.17
Nodes (24): EmployeeContributionsTable(), realAllocation(), allocateMonthly(), allocateOne(), AllocationConfig, AVERAGE_PERIODS_PER_MONTH, coveredCutoffs(), cutoffAt() (+16 more)

### Community 54 - "employeeService.ts"
Cohesion: 0.07
Nodes (46): add(), changeSupervisor(), remove(), saveRename(), onSubmit(), resetAll(), onSubmit(), onSubmit() (+38 more)

### Community 55 - "OvertimeHolidayRatesSection"
Cohesion: 0.36
Nodes (8): OvertimeHolidayRatesSection(), handleAddCustomRate(), handleReset(), handleSave(), syncDrafts(), toPctDraft(), onSubmit(), updatePayrollRules()

### Community 56 - "bootstrap/app.php"
Cohesion: 0.11
Nodes (14): EnsureUserIsActive, HandleAppearance, HandleInertiaRequests, Closure, Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets (+6 more)

### Community 57 - "attendanceService.ts"
Cohesion: 0.12
Nodes (25): getEmployeeGroup(), GROUP_OPTIONS, useApprovedLeavesForDate(), useAttendanceAdjustments(), useDailyAttendance(), useDateStatusSets(), AttendancePage(), matchesCommonFilters() (+17 more)

### Community 58 - "compensationApprovalService.ts"
Cohesion: 0.11
Nodes (27): EssWorkOutputPage(), submit(), withdraw(), todayKey(), hasAny(), PeriodScope, plural(), useWorkLogSummary() (+19 more)

### Community 59 - "Schedule"
Cohesion: 0.16
Nodes (19): DailyImportRecord, buildScheduleReview(), DAY_NAMES, dayOfWeek(), Discrepancy, DiscrepancyCode, DiscrepancySeverity, isOvernight() (+11 more)

### Community 60 - "compilerOptions"
Cohesion: 0.09
Nodes (22): resources/js/**/*.d.ts, ./resources/js/ops/*, ./resources/js/ops/shim/react-router-dom.tsx, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, esModuleInterop (+14 more)

### Community 61 - "formatCurrency"
Cohesion: 0.04
Nodes (107): CompanyThemeApplier(), PoweredByBrand(), RowCheckbox(), BONUS_TYPE_LABEL, BonusPayslipDocument(), BonusPayslipPage(), BONUS_TYPE_LABEL, BonusDetailsDialog() (+99 more)

### Community 62 - "brandTheme.ts"
Cohesion: 0.18
Nodes (18): CompanyInfoForm(), detectColor(), handleLogoChange(), onSubmit(), updateCompany(), applyBrandTheme(), BRAND_SHADES, BrandShade (+10 more)

### Community 65 - "StatutoryReports.tsx"
Cohesion: 0.10
Nodes (39): DebitCreditReport(), onExport(), PayrollRegisterReport(), onExport(), PayrollSummaryPerEmployeeReport(), PayrollSummaryReport(), onExport(), PayslipReportView() (+31 more)

### Community 67 - "Illuminate\Database\Seeder"
Cohesion: 0.13
Nodes (9): Capabilities, DatabaseSeeder, RoleSeeder, UserSeeder, Illuminate\Database\Seeder, Spatie\Permission\DefaultTeamResolver, Spatie\Permission\Models\Permission, Spatie\Permission\Models\Role (+1 more)

### Community 68 - "overtimeService.ts"
Cohesion: 0.09
Nodes (39): ATTENDANCE_SHAPE, buildSampleLoans(), buildSamplePayslips(), SAMPLE_PERIODS, SampleAttendanceRow, SampleAttendanceStatus, onSubmit(), useOvertimeSummary() (+31 more)

### Community 69 - "xlsx.ts"
Cohesion: 0.15
Nodes (19): bodyXfs(), cellXml(), columnLetter(), crc32(), CRC_TABLE, DEFAULT_XLSX_PALETTE, displayLength(), escapeXml() (+11 more)

### Community 70 - "ImportBiometricsDialog.tsx"
Cohesion: 0.09
Nodes (30): BiometricsParseResult, buildSampleAttlog(), buildStandardTemplateCsv(), ColumnMapping, decodeBiometricsFile(), FORMAT_MAPPING, STANDARD_TEMPLATE_HEADERS, ColumnMappingForm() (+22 more)

### Community 71 - "Employee"
Cohesion: 0.09
Nodes (30): fullName(), AddBranchDialog(), close(), onSubmit(), DEFAULTS, FormValues, schema, BranchDepartmentsPanel() (+22 more)

### Community 72 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 73 - "useRoster.ts"
Cohesion: 0.26
Nodes (13): approvedLeaveOn(), save(), Leaves, useRoster(), addDays(), AssignShiftInput, assignShifts(), clearShifts() (+5 more)

### Community 74 - "AddBonusDialog.tsx"
Cohesion: 0.15
Nodes (12): RadioGroup, RadioGroupItem, BONUS_TYPE_OPTIONS, BonusFormDialog(), DEFAULT_VALUES, FormValues, FREQUENCY_OPTIONS, PAYOUT_MODE_OPTIONS (+4 more)

### Community 75 - "StoreEmployeeRequest"
Cohesion: 0.16
Nodes (6): EmployeeController, StoreEmployeeRequest, UpdateEmployeeRequest, ActivityLogger, Illuminate\Support\Facades\Route, Illuminate\Validation\Rule

### Community 76 - "FortifyServiceProvider"
Cohesion: 0.17
Nodes (6): AppServiceProvider, FortifyServiceProvider, Carbon\CarbonImmutable, Illuminate\Support\Facades\Date, Illuminate\Support\Facades\DB, Illuminate\Support\ServiceProvider

### Community 77 - "loanService.ts"
Cohesion: 0.15
Nodes (16): onSubmit(), useLoans(), createLoan(), CreateLoanInput, createLoansForType(), CreateLoansResult, getLoans(), LoanTypeEntry (+8 more)

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
Cohesion: 0.05
Nodes (59): useToast(), AdjustmentRequestDialog(), onSubmit(), AssignEmployeesDialog(), close(), handleAssign(), AddHolidayDialog(), onSubmit() (+51 more)

### Community 85 - "BasicReports.tsx"
Cohesion: 0.13
Nodes (23): AccountRow, FREQUENCY_LABEL, CardSelection, CardStat(), ReportCardList(), ReportRecordCard(), ReportTableView(), FilterLabel() (+15 more)

### Community 86 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 87 - "ResetPasswordPage.tsx"
Cohesion: 0.27
Nodes (7): FormValues, INVALID_COPY, ResetPasswordPage(), schema, STRENGTH, maskEmail(), passwordStrength()

### Community 88 - "xlsxRead.ts"
Cohesion: 0.26
Nodes (13): BUILTIN_DATE_FORMATS, columnIndex(), csvCell(), dateFormatFlags(), decoder, elements(), pad2(), parseXml() (+5 more)

### Community 89 - "benefitsDeductions.ts"
Cohesion: 0.25
Nodes (13): daysFromToday(), DEDUCTION_PLAN_CATALOG, deductionPlanId(), generateBenefitPlans(), generateBenefits(), generateDeductionPlans(), generateEmployeeDeductions(), iso() (+5 more)

### Community 90 - "delete-user.tsx"
Cohesion: 0.24
Nodes (10): DeleteUser(), Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+2 more)

### Community 91 - "BulkEmployeeActions.tsx"
Cohesion: 0.04
Nodes (96): BulkDialog(), save(), BulkKind, CATEGORY_OPTIONS, TITLES, today(), AddEmployeesToPlanDialog(), save() (+88 more)

### Community 93 - "require-dev"
Cohesion: 0.17
Nodes (12): require-dev, fakerphp/faker, larastan/larastan, laravel/boost, laravel/pail, laravel/pao, laravel/pint, laravel/sail (+4 more)

### Community 94 - "SessionUser"
Cohesion: 0.15
Nodes (14): GatedApiTabs(), useSubscriptionUsage(), DEMO_ACCOUNTS, SessionState, getSubscriptionUsage(), SubscriptionUsage, DAYS_AGO, generateActivityLog() (+6 more)

### Community 95 - "devDependencies"
Cohesion: 0.18
Nodes (11): babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, @laravel/vite-plugin-wayfinder, @rolldown/plugin-babel, @types/node, vite-plus (+3 more)

### Community 96 - "package.json"
Cohesion: 0.18
Nodes (10): private, $schema, scripts, build, build:ssr, check, check:fix, dev (+2 more)

### Community 97 - "app-logo-icon.tsx"
Cohesion: 0.27
Nodes (5): AppLogo(), AppLogoIcon(), AuthSimpleLayout(), AuthLayout(), AuthLayoutProps

### Community 99 - "Reusable Component Boilerplate Report"
Cohesion: 0.18
Nodes (10): 14. Gaps and next steps, 15. Team onboarding checklist, 1. How to use this document, 2. Stack baseline, 3. Portability tiers, 8.1 React (recommended), 8.2 Server side (emails, PDFs), optional, 8. Markdown rendering boilerplate (+2 more)

### Community 100 - "OpsPage.tsx"
Cohesion: 0.06
Nodes (39): BRAND_NAME, BrandLogo(), BrandSplash(), POWERED_BY_NAME, ToastProvider(), AuthLayout(), FEATURE_BADGES, IconField() (+31 more)

### Community 101 - "mixedCompensationStore.ts"
Cohesion: 0.24
Nodes (9): BASE_UNIT_LONG, BASE_UNIT_SHORT, formatPesoShort(), MixedBaseType, MixedCompensationState, MixedComponentType, summarizeMixedCompensationShort(), useMixedCompensation() (+1 more)

### Community 102 - "themeStore.ts"
Cohesion: 0.33
Nodes (7): ThemeToggle(), useTheme(), applyThemeClass(), systemPrefersDark(), Theme, ThemeState, useThemeStore

### Community 103 - "require"
Cohesion: 0.22
Nodes (9): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php (+1 more)

### Community 104 - "ScheduleDialog.tsx"
Cohesion: 0.14
Nodes (13): AssignEmployeesDialog(), DAY_LABELS, FormValues, ScheduleDialog(), schema, SHIFT_TYPE_OPTIONS, toFormValues(), DAY_LABELS (+5 more)

### Community 109 - "overtime.ts"
Cohesion: 0.39
Nodes (8): generateOvertimeRecords(), hoursFor(), multiplierFor(), REASONS, shiftFor(), statusFor(), toDateKey(), typeForSeed()

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

### Community 120 - "WithholdingTaxCard.tsx"
Cohesion: 0.13
Nodes (26): AddBracketButton(), BracketReadout(), BracketRow(), BracketSaveBar(), BracketSummary(), formatPeso(), NumberField(), useAccordionRows() (+18 more)

### Community 121 - "10. Deployment: Octane / FrankenPHP / Coolify"
Cohesion: 0.29
Nodes (7): 10.1 Topology, 10.2 Dockerfile skeleton, 10.3 `scripts/deploy.sh` skeleton (web container start), 10.4 Environment keys (names only), 10.5 Octane-safety checklist, 10.6 Rolling-deploy rules, 10. Deployment: Octane / FrankenPHP / Coolify

### Community 122 - "createPayrollPeriod"
Cohesion: 0.33
Nodes (8): CreatePeriodDialog(), onSubmit(), formatPayrollNumber(), nextPayrollSequence(), parsePayrollNumber(), payrollYearOf(), createPayrollPeriod(), getNextPayrollNumber()

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
Cohesion: 0.15
Nodes (16): ImportEmployeesDialog(), onImport(), reset(), CIVIL_STATUSES, EMPLOYMENT_TYPES, IMPORT_COLUMNS, ImportColumn, ImportParseResult (+8 more)

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

### Community 193 - "payRate.ts"
Cohesion: 0.22
Nodes (12): compensationLabel(), EmployeeCompensationReport(), onExport(), findEmployeePayrollGroup(), EstimatedEquivalent, formatBaseRate(), formatBaseRateShort(), HELPER_TEXT (+4 more)

### Community 196 - "overtime/routes.tsx"
Cohesion: 0.09
Nodes (31): BulkActionBar(), SelectAllCheckbox(), AdjustmentsList(), decide(), decideSelected(), LeaveRequestsList(), decide(), decideSelected() (+23 more)

## Knowledge Gaps
- **795 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+790 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSession()` connect `useSession` to `DeductionsView.tsx`, `useSession.ts`, `react-router-dom.tsx`, `EmployeeProfilePage.tsx`, `employeeImport.ts`, `AddEmployeeDialog.tsx`, `PayslipEmailPreviewDialog.tsx`, `user-access/routes.tsx`, `format.ts`, `shared.tsx`, `approvals/routes.tsx`, `thirteenthMonthService.ts`, `dashboardService.ts`, `groupAssignment.ts`, `fullName`, `AdvancedReports.tsx`, `cn`, `payrollSettingsService.ts`, `NewOvertimeRequestDialog.tsx`, `TaxComplianceReports.tsx`, `RosterTab.tsx`, `PayrollRulesSection.tsx`, `getEmployees`, `EmployeeProfileContent`, `FileAdjustmentDialog.tsx`, `leaveService.ts`, `useCompanySettings.ts`, `integrationService.ts`, `Select.tsx`, `EssPayslipsPage.tsx`, `EmployeeLoansView.tsx`, `PayslipDetailPage.tsx`, `OvertimeHolidayRatesSection`, `attendanceService.ts`, `compensationApprovalService.ts`, `formatCurrency`, `brandTheme.ts`, `StatutoryReports.tsx`, `overtime/routes.tsx`, `overtimeService.ts`, `ImportBiometricsDialog.tsx`, `Employee`, `useRoster.ts`, `AddBonusDialog.tsx`, `loanService.ts`, `BasicReports.tsx`, `BulkEmployeeActions.tsx`, `SessionUser`, `ScheduleDialog.tsx`, `WithholdingTaxCard.tsx`, `createPayrollPeriod`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `Employee` connect `Employee` to `DeductionsView.tsx`, `useSession.ts`, `employeeImport.ts`, `EmployeeProfilePage.tsx`, `AddEmployeeDialog.tsx`, `mock-data/index.ts`, `format.ts`, `thirteenthMonthService.ts`, `groupAssignment.ts`, `computationBreakdown.ts`, `domain.ts`, `NewOvertimeRequestDialog.tsx`, `TaxComplianceReports.tsx`, `payrollService.ts`, `RosterTab.tsx`, `getEmployees`, `biometricsImport.ts`, `FileAdjustmentDialog.tsx`, `leaveService.ts`, `useCompanySettings.ts`, `integrationService.ts`, `Select.tsx`, `EssPayslipsPage.tsx`, `leaveStatus.ts`, `PayslipDetailPage.tsx`, `employeeService.ts`, `attendanceService.ts`, `compensationApprovalService.ts`, `Schedule`, `formatCurrency`, `StatutoryReports.tsx`, `overtime/routes.tsx`, `overtimeService.ts`, `ImportBiometricsDialog.tsx`, `useRoster.ts`, `AddBonusDialog.tsx`, `loanService.ts`, `employees.ts`, `BasicReports.tsx`, `benefitsDeductions.ts`, `BulkEmployeeActions.tsx`, `SessionUser`, `ScheduleDialog.tsx`, `overtime.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useSession` to `DeductionsView.tsx`, `useSession.ts`, `employeeImport.ts`, `EmployeeProfilePage.tsx`, `user-access/routes.tsx`, `AddEmployeeDialog.tsx`, `PayslipEmailPreviewDialog.tsx`, `format.ts`, `approvals/routes.tsx`, `dashboardService.ts`, `groupAssignment.ts`, `fullName`, `payrollSettingsService.ts`, `NewOvertimeRequestDialog.tsx`, `otApplicationStore.ts`, `RosterTab.tsx`, `PayrollRulesSection.tsx`, `EmployeeProfileContent`, `FileAdjustmentDialog.tsx`, `integrationService.ts`, `Select.tsx`, `EssPayslipsPage.tsx`, `EmployeeLoansView.tsx`, `OvertimeHolidayRatesSection`, `compensationApprovalService.ts`, `formatCurrency`, `brandTheme.ts`, `CustomReportBuilder`, `overtime/routes.tsx`, `ImportBiometricsDialog.tsx`, `Employee`, `AddBonusDialog.tsx`, `BasicReports.tsx`, `BulkEmployeeActions.tsx`, `OpsPage.tsx`, `ScheduleDialog.tsx`, `WithholdingTaxCard.tsx`, `createPayrollPeriod`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _795 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DeductionsView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11462450592885376 - nodes in this community are weakly interconnected._
- **Should `useSession.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07824561403508772 - nodes in this community are weakly interconnected._
- **Should `react-router-dom.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.051061388410786 - nodes in this community are weakly interconnected._