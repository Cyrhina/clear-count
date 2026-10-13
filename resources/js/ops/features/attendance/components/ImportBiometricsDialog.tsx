import { AlertCircle, AlertTriangle, CalendarClock, CheckCircle2, Columns3, Copy, Cpu, Download, FileSpreadsheet, FileWarning, FlaskConical, Info, ListChecks, Pencil, Plane, Plus, Upload, UploadCloud } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import {
  FORMAT_LABEL,
  FORMAT_MAPPING,
  buildSampleAttlog,
  buildSampleZkCsv,
  buildStandardTemplateCsv,
  decodeBiometricsFile,
  parseBiometricsFile,
  type BiometricsParseResult,
  type ColumnMapping,
  type DailyImportRecord,
  STANDARD_TEMPLATE_HEADERS,
} from '@ops/features/attendance/biometricsImport'
import { ColumnMappingForm } from '@ops/features/attendance/components/ColumnMappingForm'
import { PunchEditor, type PunchTimes } from '@ops/features/attendance/components/PunchEditor'
import { annotateImportWithLeaves, type ImportLeaveContext } from '@ops/features/attendance/leaveStatus'
import { approvedLeaveOn } from '@ops/features/attendance/leaveStatus'
import { useLateCounting } from '@ops/features/attendance/hooks/useLateCounting'
import { lateDatesByEmployee } from '@ops/features/attendance/lateCycle'
import { buildScheduleReview, type ImportScope, type ScheduleReviewRow } from '@ops/features/attendance/scheduleReview'
import { addDays, startOfWeek, todayKey } from '@ops/features/schedules/dateUtil'
import { ScheduleReviewTable } from '@ops/features/attendance/components/ScheduleReviewTable'
import { downloadCsv, toCsv } from '@ops/features/reports/components/shared'
import { useSession } from '@ops/hooks/useSession'
import { useBranches } from '@ops/features/branches/hooks/useBranches'
import { apiErrorMessage } from '@ops/lib/api/http'
import { fetchAttendanceHistory, fetchSchedulesWithMembers, importPunches, statusForPunch } from '@ops/lib/services/attendanceService'
import { fetchAllEmployees } from '@ops/lib/services/employeeService'
import { fetchRosterMap } from '@ops/lib/services/scheduleService'
import { fetchWfhDayLookup } from '@ops/lib/services/wfhArrangementService'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'
import { xlsxToCsv } from '@ops/lib/utils/xlsxRead'
import { fetchApprovedLeaves } from '@ops/lib/services/leaveApiService'
import type { AttendanceRecord, Employee, Schedule } from '@ops/types/domain'

interface Preview {
  sourceName: string
  result: BiometricsParseResult
  leave: ImportLeaveContext
  employees: Employee[]
  schedules: Schedule[]
  /** Attendance already on record — the late counts build on it. */
  existing: AttendanceRecord[]
  /** The Schedules roster for the file's dates (`employeeId|date` → template id, null = rest day). */
  roster: Map<string, string | null>
  /** Approved WFH days (`employeeId|date`) — not "no punch" days. */
  wfhDays: Set<string>
  /** Approved leave across the whole scope, so days the file doesn't mention still know who is on leave. */
  leaves: Awaited<ReturnType<typeof fetchApprovedLeaves>>
  /** What the schedule-based import was narrowed to (undefined for a standard import). */
  scope?: ImportScope
}

type PreviewTab = 'records' | 'schedule' | 'missing' | 'leave' | 'issues'

/** Standard: write the punches as they are. Schedule-based: check every day against the employee's schedule first. */
type ImportMode = 'standard' | 'schedule'
/** ZKTeco terminals are read directly; any other device or system exports to the standard CSV template. */
type DeviceType = 'zkteco' | 'other'

/** The file being imported, kept so it can be re-parsed with a manual column mapping. */
interface Source {
  name: string
  text: string
}

interface MappingDraft {
  headers: string[]
  sample: string[]
  mapping: ColumnMapping
}

const ACTION_META: Record<DailyImportRecord['action'], { label: string; tone: 'success' | 'brand' | 'neutral' | 'danger' }> = {
  create: { label: 'New', tone: 'success' },
  update: { label: 'Update', tone: 'brand' },
  unchanged: { label: 'Already imported', tone: 'neutral' },
  skip: { label: 'Skipped', tone: 'danger' },
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function LeaveNote({ resolution }: { resolution: { label: string; leaveLabel: string; detail?: string; review?: string } }) {
  return (
    <div className="mt-1 space-y-0.5">
      <Badge tone="brand" className="gap-1">
        <Plane className="size-3" />
        {resolution.label}
      </Badge>
      <p className="text-[11px] text-muted-foreground">{resolution.leaveLabel}</p>
      {resolution.detail && <p className="max-w-64 text-[11px] text-muted-foreground">{resolution.detail}</p>}
      {resolution.review && (
        <p className="flex max-w-64 items-start gap-1 text-[11px] font-medium text-warning">
          <AlertTriangle className="mt-px size-3 shrink-0" />
          Review: {resolution.review}
        </p>
      )}
    </div>
  )
}

/**
 * Imports raw punch logs from a ZKTeco ZK3969 terminal (USB attlog .dat, GLog .txt, or CSV export) and the
 * legacy FBS daily template. Punches are combined into one time-in / time-out per employee per day,
 * previewed with every invalid line explained, and only valid records are applied.
 */
export function ImportBiometricsDialog({ date, onImported }: { date: string; onImported: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [tab, setTab] = useState<PreviewTab>('records')
  const [parseError, setParseError] = useState<string | null>(null)
  const [source, setSource] = useState<Source | null>(null)
  const [mappingDraft, setMappingDraft] = useState<MappingDraft | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState<ImportMode>('standard')
  const [methodChosen, setMethodChosen] = useState(false)
  const [scopeFrom, setScopeFrom] = useState(() => startOfWeek(todayKey()))
  const [scopeTo, setScopeTo] = useState(() => addDays(startOfWeek(todayKey()), 6))
  const [scopeBranch, setScopeBranch] = useState('all')
  const [scopeDepartment, setScopeDepartment] = useState('all')
  const [scopeScheduleId, setScopeScheduleId] = useState('all')
  const [scopeMeta, setScopeMeta] = useState<{ employees: Employee[]; schedules: Schedule[] }>({ employees: [], schedules: [] })
  const [device, setDevice] = useState<DeviceType>('zkteco')
  const [overrides, setOverrides] = useState<Map<string, string>>(new Map())
  const [decisions, setDecisions] = useState<Map<string, boolean>>(new Map())
  // Corrections made in the preview (times per `employee|date`), days added by hand, and the row being edited.
  const [edits, setEdits] = useState<Map<string, PunchTimes>>(new Map())
  const [manual, setManual] = useState<Map<string, DailyImportRecord>>(new Map())
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useSession()
  const { notify } = useToast()
  const { branches } = useBranches()

  useEffect(() => {
    if (!open || mode !== 'schedule') return
    Promise.all([fetchAllEmployees(), fetchSchedulesWithMembers()]).then(([employees, schedules]) =>
      setScopeMeta({ employees: employees.filter((e) => e.employment.status === 'active'), schedules }),
    )
  }, [open, mode, user])

  // Who the import is limited to: the active employees of the chosen branch / department. The file is only read for them.
  const scopedEmployees = scopeMeta.employees.filter((e) => (scopeBranch === 'all' || e.branchId === scopeBranch) && (scopeDepartment === 'all' || e.employment.department === scopeDepartment))
  const isNarrowed = scopeBranch !== 'all' || scopeDepartment !== 'all'
  const departmentOptions = [...new Set(scopeMeta.employees.filter((e) => scopeBranch === 'all' || e.branchId === scopeBranch).map((e) => e.employment.department))].sort()
  const scopeInvalid = mode === 'schedule' && (!scopeFrom || !scopeTo || scopeTo < scopeFrom)
  const currentScope: ImportScope | undefined =
    mode === 'schedule'
      ? { from: scopeFrom, to: scopeTo, branchId: scopeBranch === 'all' ? undefined : scopeBranch, department: scopeDepartment === 'all' ? undefined : scopeDepartment, scheduleId: scopeScheduleId === 'all' ? undefined : scopeScheduleId }
      : undefined

  // The file's daily records with the corrections applied, plus days added by hand.
  const records = useMemo(() => {
    if (!preview) return []
    const existingByKey = new Map(preview.existing.map((r) => [`${r.employeeId}|${r.date}`, r]))
    const patch = (r: DailyImportRecord): DailyImportRecord => {
      const e = edits.get(r.key)
      if (!e) return r
      const previous = existingByKey.get(r.key)
      return {
        ...r,
        timeIn: e.timeIn || null,
        timeOut: e.timeOut || null,
        breakOut: e.breakOut || null,
        breakIn: e.breakIn || null,
        action: e.timeIn ? (previous ? 'update' : 'create') : 'skip',
        previous: previous ? { timeIn: previous.timeIn, timeOut: previous.timeOut } : r.previous,
        notes: [...r.notes.filter((n) => !/^(No check-out|Only check-out|Check-out is earlier|No time-out)/.test(n)), manual.has(r.key) ? 'Added by hand' : 'Edited here'],
      }
    }
    return [...preview.result.records.map(patch), ...[...manual.values()].map(patch)]
  }, [preview, edits, manual])

  const review = useMemo(
    () =>
      preview && mode === 'schedule'
        ? buildScheduleReview({ records, employees: preview.employees, schedules: preview.schedules, leave: preview.leave, overrides, roster: preview.roster, scope: preview.scope, onLeave: (employeeId, date) => !!approvedLeaveOn(preview.leaves, employeeId, date), isWfh: (employeeId, date) => preview.wfhDays.has(`${employeeId}|${date}`) })
        : null,
    [preview, mode, overrides, records],
  )
  // Rows that need review stay out until approved; everything else is in unless the reviewer unticks it.
  const isIncluded = (row: ScheduleReviewRow) => row.applicable && (decisions.get(row.key) ?? !row.needsReview)

  const lateCounting = useLateCounting()

  // Late dates per employee: what is already on record, with this import's rows replacing the same days.
  // Standard import has no review step, so its status comes from the employee's schedule the same way applying it will.
  const standardStatus = (r: DailyImportRecord): 'present' | 'late' | 'undertime' | 'absent' => {
    const schedule = preview?.schedules.find((s) => s.assignedEmployeeIds?.includes(r.employeeId)) ?? preview?.schedules[0]
    return schedule && r.timeIn ? statusForPunch(r.timeIn, r.timeOut, schedule.startTime, schedule.endTime, schedule.gracePeriodMinutes ?? 0) : 'present'
  }
  const lateInfo = useMemo(() => {
    if (!preview) return undefined
    const incoming = review
      ? review.rows.filter((r) => r.applicable && (decisions.get(r.key) ?? !r.needsReview)).map((r) => ({ employeeId: r.record.employeeId, date: r.record.date, status: r.isRestDay ? 'present' : r.status }))
      : records.filter((r) => (r.action === 'create' || r.action === 'update') && r.timeIn).map((r) => ({ employeeId: r.employeeId, date: r.date, status: standardStatus(r) }))
    const replaced = new Set(incoming.map((r) => `${r.employeeId}|${r.date}`))
    const dates = lateDatesByEmployee([...preview.existing.filter((r) => !replaced.has(`${r.employeeId}|${r.date}`)), ...incoming])
    const late = incoming.filter((r) => r.status === 'late')
    const repeat = late.filter((r) => (lateCounting.ordinal(r.employeeId, dates.get(r.employeeId), r.date)?.n ?? 1) > 1).length
    return { dates, late: late.length, repeat }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, review, decisions, records, lateCounting])
  const lateNoteFor = (employeeId: string, date: string, status: string) => {
    const o = status === 'late' ? lateCounting.ordinal(employeeId, lateInfo?.dates.get(employeeId), date) : undefined
    return o ? `Late #${o.n} · counting since ${formatDate(o.cycle.start)}, resets after ${formatDate(o.cycle.end)}` : undefined
  }
  const lateNote = (row: ScheduleReviewRow) => (row.isRestDay ? undefined : lateNoteFor(row.record.employeeId, row.record.date, row.status))

  const timesOf = (r: { timeIn: string | null; timeOut: string | null; breakOut: string | null; breakIn: string | null }): PunchTimes => ({ timeIn: r.timeIn ?? '', timeOut: r.timeOut ?? '', breakOut: r.breakOut ?? '', breakIn: r.breakIn ?? '' })
  const saveEdit = (key: string, times: PunchTimes) => {
    setEdits((m) => new Map(m).set(key, times))
    setEditingKey(null)
  }
  const resetEdit = (key: string) => {
    setEdits((m) => {
      const next = new Map(m)
      next.delete(key)
      return next
    })
    setEditingKey(null)
  }
  const editorFor = (r: DailyImportRecord) => (
    <PunchEditor key={r.key} initial={timesOf(r)} onSave={(t) => saveEdit(r.key, t)} onCancel={() => setEditingKey(null)} onReset={edits.has(r.key) && !manual.has(r.key) ? () => resetEdit(r.key) : undefined} />
  )

  function reset() {
    setOverrides(new Map())
    setDecisions(new Map())
    setEdits(new Map())
    setManual(new Map())
    setEditingKey(null)
    setMethodChosen(false)
    setMode('standard')
    setFile(null)
    setPreview(null)
    setParseError(null)
    setTab('records')
    setSource(null)
    setMappingDraft(null)
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
    setParseError(null)
    e.target.value = ''
  }

  async function showPreview(sourceName: string, text: string, mapping?: ColumnMapping) {
    setSource({ name: sourceName, text })
    const [employees, existing, schedules] = await Promise.all([fetchAllEmployees(), fetchAttendanceHistory(), fetchSchedulesWithMembers()])
    const result = parseBiometricsFile(text, employees, existing, {
      mapping,
      template: device === 'other',
      allowedEmployeeIds: mode === 'schedule' && isNarrowed ? new Set(scopedEmployees.map((e) => e.id)) : undefined,
    })
    if (result.headerError) {
      setParseError(result.headerError)
      // Unrecognised headers: let the admin map the columns by hand.
      if (result.columns) setMappingDraft({ headers: result.columns.headers, sample: result.columns.sample, mapping: result.columns.mapping })
      setPreview(null)
      return
    }
    if (result.records.length === 0 && result.issues.length === 0) {
      setParseError('No punch records found in the file.')
      return
    }
    // Approved leaves on the file's dates: leave overrides Absent, and punches on a leave day are flagged.
    const dates = result.records.map((r) => r.date).sort()
    // A schedule-based import also looks at the whole scope, so "no punch" days are checked against leave and the roster.
    const spanFrom = currentScope ? [dates[0], currentScope.from].filter(Boolean).sort()[0] : dates[0]
    const spanTo = currentScope ? [dates[dates.length - 1], currentScope.to].filter(Boolean).sort().reverse()[0] : dates[dates.length - 1]
    const leaves = spanFrom ? await fetchApprovedLeaves(spanFrom, spanTo) : []
    const leave = annotateImportWithLeaves(result.records, leaves, employees, schedules)
    const roster = spanFrom ? await fetchRosterMap(spanFrom, spanTo) : new Map<string, string | null>()
    const wfhDays = spanFrom ? await fetchWfhDayLookup(spanFrom, spanTo) : new Set<string>()
    setParseError(null)
    setMappingDraft(null)
    setOverrides(new Map())
    setDecisions(new Map())
    setEdits(new Map())
    setManual(new Map())
    setEditingKey(null)
    setTab(result.records.length === 0 ? 'issues' : mode === 'schedule' ? 'schedule' : 'records')
    setPreview({ sourceName, result, leave, employees, schedules, existing, roster, wfhDays, leaves, scope: currentScope })
  }

  function applyMapping(mapping: ColumnMapping) {
    if (source) void showPreview(source.name, source.text, mapping)
  }

  function openMappingEditor() {
    const columns = preview?.result.columns
    if (!columns) return
    setMappingDraft({ headers: columns.headers, sample: columns.sample, mapping: columns.mapping })
    setPreview(null)
  }

  async function handleDownloadSample(kind: 'dat' | 'csv') {
    const employees = await fetchAllEmployees()
    if (kind === 'dat') downloadText('ZK3969_1_attlog.dat', buildSampleAttlog(employees, date))
    else downloadCsv(`ZK3969_attendance_${date}.csv`, toCsv(buildSampleZkCsv(employees, date)))
  }

  async function handleDownloadTemplate() {
    const employees = await fetchAllEmployees()
    downloadCsv('biometrics_standard_template.csv', toCsv(buildStandardTemplateCsv(employees, date)))
  }

  async function handleTrySample() {
    const employees = await fetchAllEmployees()
    await showPreview('the ZK3969 sample log', buildSampleAttlog(employees, date))
  }

  async function handleImport() {
    if (!file) return
    setIsProcessing(true)
    const name = file.name.toLowerCase()
    const allowed = device === 'zkteco' ? ['.csv', '.dat', '.txt', '.xlsx'] : ['.csv']
    try {
      if (!allowed.some((ext) => name.endsWith(ext))) {
        setParseError(device === 'zkteco' ? 'Upload an attlog .dat, GLog .txt, .csv or .xlsx exported from the ZKTeco ZK3969.' : 'Other biometrics devices must follow the standard CSV template (.csv).')
        return
      }
      const buffer = await file.arrayBuffer()
      await showPreview(file.name, name.endsWith('.xlsx') ? await xlsxToCsv(buffer) : decodeBiometricsFile(buffer))
    } catch {
      setParseError(
        name.endsWith('.xlsx')
          ? `Couldn't read ${file.name}. Make sure it's an .xlsx workbook with the punch log on the first sheet (saved from Excel, not renamed from another format).`
          : `Couldn't read ${file.name}. Make sure it's the original file exported from the device${device === 'other' ? ' or the standard CSV template' : ''}.`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleApply() {
    if (!preview) return
    setIsProcessing(true)
    const punches = review
      ? review.rows.filter(isIncluded).map((r) => ({ employeeId: r.record.employeeId, date: r.record.date, timeIn: r.timeIn!, timeOut: r.timeOut, breakOut: r.record.breakOut, breakIn: r.record.breakIn, scheduleId: r.schedule?.id, status: r.status }))
      : records
          .filter((r) => (r.action === 'create' || r.action === 'update') && r.timeIn)
          .map((r) => ({ employeeId: r.employeeId, date: r.date, timeIn: r.timeIn!, timeOut: r.timeOut, breakOut: r.breakOut, breakIn: r.breakIn }))
    let count: number
    try {
      const result = await importPunches(punches)
      count = result.saved
      if (result.refused.length > 0) notify({ title: `${result.refused.length} row${result.refused.length === 1 ? ' was' : 's were'} refused`, description: result.refused[0].errors[0], tone: 'danger' })
    } catch (error) {
      setIsProcessing(false)
      return notify({ title: "Couldn't import the punches", description: apiErrorMessage(error), tone: 'danger' })
    }
    setIsProcessing(false)
    const errors = preview.result.issues.filter((i) => i.severity === 'error').length
    const onLeave = preview.leave.byKey.size + preview.leave.leaveOnly.length
    finish(count, preview.sourceName, errors, onLeave)
  }

  function downloadIssues() {
    if (!preview) return
    downloadCsv(
      `biometrics-import-issues-${date}.csv`,
      toCsv([['Line', 'Severity', 'Problem', 'Raw line'], ...preview.result.issues.map((i) => [String(i.line), i.severity, i.message, i.raw.replace(/\t/g, ' ⇥ ')])]),
    )
  }

  function finish(count: number, context: string, skippedLines = 0, onLeave = 0) {
    notify({
      title: 'Biometrics import complete',
      description: `${count} attendance record${count === 1 ? '' : 's'} updated (${context})${skippedLines ? ` · ${skippedLines} invalid line${skippedLines === 1 ? '' : 's'} skipped` : ''}${onLeave ? ` · ${onLeave} on approved leave shown as On Leave` : ''}.`,
      tone: 'success',
    })
    reset()
    setOpen(false)
    onImported()
  }

  const result = preview?.result
  const applicable = review ? review.rows.filter(isIncluded).length : records.filter((r) => r.action === 'create' || r.action === 'update').length
  const reviewFlagged = review?.rows.filter((r) => r.needsReview && r.applicable) ?? []
  const pendingReview = reviewFlagged.filter((r) => !isIncluded(r)).length
  const adjustments = review?.rows.filter((r) => !r.needsReview && r.discrepancies.length > 0).length ?? 0
  const unchanged = records.filter((r) => r.action === 'unchanged').length
  const errorCount = result?.issues.filter((i) => i.severity === 'error').length ?? 0
  const warningCount = result?.issues.filter((i) => i.severity === 'warning').length ?? 0
  const dates = result ? [...new Set(records.map((r) => r.date))].sort() : []
  const onLeaveCount = preview ? preview.leave.byKey.size + preview.leave.leaveOnly.length : 0
  const reviewCount = preview ? [...preview.leave.byKey.values(), ...preview.leave.leaveOnly.map((l) => l.resolution)].filter((r) => r.review).length : 0

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" icon={<UploadCloud className="size-4" />}>
          Import Biometrics Record
        </Button>
      </DialogTrigger>
      <DialogContent className={preview ? 'max-w-5xl' : 'max-w-xl'}>
        <DialogTitle>Import Biometrics Record</DialogTitle>
        <DialogDescription>
          {preview
            ? `Review what was read from ${preview.sourceName}. Valid records are applied; invalid lines are skipped and listed under Issues.`
            : 'Upload the punch log exported from your biometrics device.'}
        </DialogDescription>

        {preview && result ? (
          <>
            <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs">
              <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                <Cpu className="size-3.5 text-primary" />
                Detected: {result.format ? FORMAT_LABEL[result.format] : 'Unknown'}
              </p>
              {result.format && <p className="mt-1 text-muted-foreground">Field mapping: {FORMAT_MAPPING[result.format]}</p>}
              <p className="mt-1 text-muted-foreground">
                {result.stats.lines} line{result.stats.lines === 1 ? '' : 's'} read · {result.stats.punches} punch{result.stats.punches === 1 ? '' : 'es'}
                {dates.length > 0 && ` · ${dates.length === 1 ? formatDate(dates[0]) : `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`}`}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 font-medium text-success">
                <CheckCircle2 className="size-3.5" />
                {applicable} record{applicable === 1 ? '' : 's'} ready to apply
              </span>
              {review && pendingReview > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 font-medium text-danger">
                  <ListChecks className="size-3.5" />
                  {pendingReview} need{pendingReview === 1 ? 's' : ''} your review before they can be applied
                </span>
              )}
              {lateInfo && lateInfo.late > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 font-medium text-warning">
                  <AlertTriangle className="size-3.5" />
                  {lateInfo.late} late{lateInfo.repeat > 0 && ` · ${lateInfo.repeat} not their first this cycle`}
                </span>
              )}
              {review && adjustments > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 font-medium text-warning">
                  <CalendarClock className="size-3.5" />
                  {adjustments} late / undertime / overtime
                </span>
              )}
              {review && review.missing.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  <AlertCircle className="size-3.5" />
                  {review.missing.length} scheduled day{review.missing.length === 1 ? '' : 's'} with no punch
                </span>
              )}
              {unchanged > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  <Copy className="size-3.5" />
                  {unchanged} already imported (no change)
                </span>
              )}
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 font-medium text-danger">
                  <AlertCircle className="size-3.5" />
                  {errorCount} invalid line{errorCount === 1 ? '' : 's'} skipped
                  {result.stats.unmapped > 0 && ` (${result.stats.unmapped} unmapped ID${result.stats.unmapped === 1 ? '' : 's'})`}
                </span>
              )}
              {onLeaveCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                  <Plane className="size-3.5" />
                  {onLeaveCount} on approved leave{reviewCount > 0 && ` · ${reviewCount} need review`}
                </span>
              )}
              {review && review.excluded > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  <Info className="size-3.5" />
                  {review.excluded} day{review.excluded === 1 ? '' : 's'} outside the selected range, department or schedule left out
                </span>
              )}
              {result.stats.outOfScope > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  <Info className="size-3.5" />
                  {result.stats.outOfScope} punch line{result.stats.outOfScope === 1 ? '' : 's'} of other employees ignored (outside the selected branch / department)
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 font-medium text-warning">
                  <AlertTriangle className="size-3.5" />
                  {warningCount} duplicate punch{warningCount === 1 ? '' : 'es'} ignored
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs font-medium">
                {(
                  [
                    ...(review
                      ? [
                          { value: 'schedule', label: `Schedule Review (${review.rows.length})` },
                          { value: 'missing', label: `No Punch (${review.missing.length})` },
                        ]
                      : [{ value: 'records', label: `Daily Records (${records.length})` }]),
                    { value: 'leave', label: `On Leave (${onLeaveCount})` },
                    { value: 'issues', label: `Issues (${result.issues.length})` },
                  ] as { value: PreviewTab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTab(t.value)}
                    className={cn('rounded-md px-3 py-1.5 transition-colors', tab === t.value ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground')}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {result.columns && (
                  <Button type="button" size="sm" variant="ghost" icon={<Columns3 className="size-3.5" />} onClick={openMappingEditor}>
                    Adjust Column Mapping
                  </Button>
                )}
                {result.issues.length > 0 && (
                  <Button type="button" size="sm" variant="ghost" icon={<FileWarning className="size-3.5" />} onClick={downloadIssues}>
                    Download Issue Log
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-border">
              {tab === 'schedule' && review ? (
                <ScheduleReviewTable
                  rows={review.rows}
                  lateNote={lateNote}
                  editingKey={editingKey}
                  onEdit={setEditingKey}
                  isEdited={(key) => edits.has(key)}
                  renderEditor={(row) => editorFor(row.record)}
                  schedules={preview.schedules}
                  isIncluded={isIncluded}
                  onToggle={(key, include) => setDecisions((d) => new Map(d).set(key, include))}
                  onOverride={(key, scheduleId) => {
                    setOverrides((o) => new Map(o).set(key, scheduleId))
                    setDecisions((d) => {
                      const next = new Map(d)
                      next.delete(key)
                      return next
                    })
                  }}
                  hasLeave={(key) => preview.leave.byKey.has(key)}
                />
              ) : tab === 'missing' && review ? (
                review.missing.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">Every scheduled working day in this file has a punch or an approved leave.</p>
                ) : (
                  <>
                    <p className="border-b border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      Scheduled working days inside the file's dates with no punch and no approved leave. Nothing is written for these — check whether the export covers every device, or file an adjustment.
                    </p>
                    <Table className="whitespace-nowrap">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Expected schedule</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {review.missing.map((m) => (
                          <Fragment key={m.key}>
                          <TableRow>
                            <TableCell>
                              <p className="font-medium">
                                {m.employee.personal.firstName} {m.employee.personal.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{m.employee.employeeNumber}</p>
                            </TableCell>
                            <TableCell>{formatDate(m.date)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {m.schedule.name} · {m.schedule.startTime}–{m.schedule.endTime}
                              {m.scheduleSource === 'default' && ' (default)'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button type="button" size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={() => setEditingKey(m.key)}>
                                Add times
                              </Button>
                            </TableCell>
                          </TableRow>
                          {editingKey === m.key && (
                            <TableRow>
                              <TableCell colSpan={4}>
                                <PunchEditor
                                  key={m.key}
                                  initial={{ timeIn: '', timeOut: '', breakOut: '', breakIn: '' }}
                                  onCancel={() => setEditingKey(null)}
                                  onSave={(t) => {
                                    const record: DailyImportRecord = {
                                      key: m.key,
                                      employeeId: m.employee.id,
                                      employeeNumber: m.employee.employeeNumber,
                                      deviceUserId: '—',
                                      employeeName: `${m.employee.personal.firstName} ${m.employee.personal.lastName}`,
                                      date: m.date,
                                      timeIn: null,
                                      timeOut: null,
                                      breakOut: null,
                                      breakIn: null,
                                      punchCount: 0,
                                      verifyModes: [],
                                      deviceIds: [],
                                      notes: [],
                                      action: 'skip',
                                    }
                                    setManual((mm) => new Map(mm).set(m.key, record))
                                    saveEdit(m.key, t)
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )
              ) : tab === 'records' ? (
                records.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">No valid punches to import — see Issues.</p>
                ) : (
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device ID → Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>AM In</TableHead>
                        <TableHead>AM Out</TableHead>
                        <TableHead>PM In</TableHead>
                        <TableHead>PM Out</TableHead>
                        <TableHead>Punches</TableHead>
                        <TableHead>Verify</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((r) => (
                        <Fragment key={r.key}>
                        <TableRow>
                          <TableCell>
                            <p className="font-medium">{r.employeeName}</p>
                            <p className="text-xs text-muted-foreground">
                              User {r.deviceUserId} → {r.employeeNumber}
                            </p>
                          </TableCell>
                          <TableCell>{formatDate(r.date)}</TableCell>
                          <TableCell className="tabular-nums">{r.timeIn ?? '—'}</TableCell>
                          <TableCell className="tabular-nums">{r.breakOut ?? '—'}</TableCell>
                          <TableCell className="tabular-nums">{r.breakIn ?? '—'}</TableCell>
                          <TableCell className="tabular-nums">{r.timeOut ?? '—'}</TableCell>
                          <TableCell className="tabular-nums">{r.punchCount}</TableCell>
                          <TableCell className="text-muted-foreground">{r.verifyModes.join(', ') || '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{r.deviceIds.join(', ') || '—'}</TableCell>
                          <TableCell className="whitespace-normal">
                            <Badge tone={ACTION_META[r.action].tone}>{ACTION_META[r.action].label}</Badge>
                            {r.action === 'update' && r.previous && (
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                was {r.previous.timeIn ?? '—'}–{r.previous.timeOut ?? '—'}
                              </p>
                            )}
                            {r.notes.map((n) => (
                              <p key={n} className={cn('mt-0.5 max-w-56 text-[11px]', r.action === 'skip' ? 'text-danger' : 'text-muted-foreground')}>
                                {n}
                              </p>
                            ))}
                            {(r.action === 'create' || r.action === 'update') && r.timeIn && standardStatus(r) !== 'present' && (
                              <Badge tone="warning" className="mt-1 capitalize">
                                {standardStatus(r)}
                              </Badge>
                            )}
                            {(r.action === 'create' || r.action === 'update') && lateNoteFor(r.employeeId, r.date, standardStatus(r)) && (
                              <p className="mt-0.5 max-w-56 text-[11px] font-medium text-warning">{lateNoteFor(r.employeeId, r.date, standardStatus(r))}</p>
                            )}
                            {preview.leave.byKey.get(r.key) && <LeaveNote resolution={preview.leave.byKey.get(r.key)!} />}
                            <Button type="button" size="sm" variant="ghost" className="-ml-2 mt-0.5 h-7" icon={<Pencil className="size-3" />} onClick={() => setEditingKey(r.key)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                        {editingKey === r.key && (
                          <TableRow>
                            <TableCell colSpan={10}>{editorFor(r)}</TableCell>
                          </TableRow>
                        )}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                )
              ) : tab === 'leave' ? (
                onLeaveCount === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nobody in this file is on approved leave on these dates.</p>
                ) : (
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Punches in file</TableHead>
                        <TableHead>Attendance status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ...result.records
                          .filter((r) => preview.leave.byKey.has(r.key))
                          .map((r) => ({ key: r.key, name: r.employeeName, number: r.employeeNumber, date: r.date, punches: `${r.timeIn ?? '—'} – ${r.timeOut ?? '—'}`, resolution: preview.leave.byKey.get(r.key)! })),
                        ...preview.leave.leaveOnly.map((l) => ({
                          key: l.key,
                          name: `${l.employee.personal.firstName} ${l.employee.personal.lastName}`,
                          number: l.employee.employeeNumber,
                          date: l.date,
                          punches: 'None',
                          resolution: l.resolution,
                        })),
                      ]
                        .sort((a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number))
                        .map((row) => (
                          <TableRow key={row.key}>
                            <TableCell>
                              <p className="font-medium">{row.name}</p>
                              <p className="text-xs text-muted-foreground">{row.number}</p>
                            </TableCell>
                            <TableCell>{formatDate(row.date)}</TableCell>
                            <TableCell className="tabular-nums text-muted-foreground">{row.punches}</TableCell>
                            <TableCell className="whitespace-normal">
                              <LeaveNote resolution={row.resolution} />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )
              ) : result.issues.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No issues — every line was read successfully.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Line</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead>Raw line</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.issues.map((i) => (
                      <TableRow key={`${i.line}-${i.message}`}>
                        <TableCell className="tabular-nums text-muted-foreground">{i.line}</TableCell>
                        <TableCell>
                          <span className={cn('inline-flex items-start gap-1.5 text-xs font-medium', i.severity === 'error' ? 'text-danger' : 'text-warning')}>
                            {i.severity === 'error' ? <AlertCircle className="mt-px size-3.5 shrink-0" /> : <AlertTriangle className="mt-px size-3.5 shrink-0" />}
                            {i.message}
                          </span>
                        </TableCell>
                        <TableCell>
                          <code className="block max-w-80 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground" title={i.raw}>
                            {i.raw.replace(/\t/g, ' ⇥ ').trim() || '(empty)'}
                          </code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <p className="max-w-md text-xs text-muted-foreground">
                {review
                  ? 'Rows flagged for review are skipped until you approve them. Late, undertime and overtime are computed from each employee’s schedule. Approved leave always shows as On Leave, never Absent.'
                  : 'Only New and Update records are written; re-importing the same log changes nothing. Approved leave always shows as On Leave, never Absent.'}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setPreview(null)}>
                  Back
                </Button>
                <Button type="button" onClick={handleApply} isLoading={isProcessing} disabled={applicable === 0}>
                  Apply {applicable} Record{applicable === 1 ? '' : 's'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {methodChosen ? (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
                <span className="font-medium">{mode === 'schedule' ? 'Schedule-based import' : 'Standard import'}</span>
                <button type="button" onClick={() => setMethodChosen(false)} className="font-medium text-primary hover:underline">
                  Change method
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    { value: 'standard', icon: Upload, title: 'Standard Import', hint: 'No fixed schedules — records are applied as they are.' },
                    { value: 'schedule', icon: CalendarClock, title: 'Schedule-Based Import', hint: 'Matches employee, date and assigned schedule against the biometric records, then lets you review discrepancies first. Best for different departments, shifting employees, rest days, different work hours, flexible or manager-assigned schedules.' },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setMode(o.value)
                      setMethodChosen(true)
                    }}
                    className="flex items-start gap-2.5 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <o.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="block text-sm font-medium">{o.title}</span>
                      <span className="block text-xs text-muted-foreground">{o.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {methodChosen && mode === 'schedule' && (
              <div className="mt-3 rounded-xl border border-border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date range — from" required>
                    <Input type="date" value={scopeFrom} onChange={(e) => setScopeFrom(e.target.value)} />
                  </FormField>
                  <FormField label="Date range — to" required error={scopeInvalid ? 'End date is before the start date' : undefined}>
                    <Input type="date" value={scopeTo} min={scopeFrom} onChange={(e) => setScopeTo(e.target.value)} />
                  </FormField>
                  <FormField label="Branch">
                    <Select
                      value={scopeBranch}
                      onValueChange={(v) => {
                        setScopeBranch(v)
                        setScopeDepartment('all')
                      }}
                      aria-label="Branch"
                      options={[{ value: 'all', label: 'All branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
                    />
                  </FormField>
                  <FormField label="Department">
                    <Select
                      value={scopeDepartment}
                      onValueChange={setScopeDepartment}
                      aria-label="Department"
                      options={[{ value: 'all', label: 'All departments' }, ...departmentOptions.map((d) => ({ value: d, label: d }))]}
                    />
                  </FormField>
                  <FormField label="Schedule">
                    <Select
                      value={scopeScheduleId}
                      onValueChange={setScopeScheduleId}
                      aria-label="Schedule"
                      options={[{ value: 'all', label: 'All schedules' }, ...scopeMeta.schedules.map((s) => ({ value: s.id, label: s.name }))]}
                    />
                  </FormField>
                </div>
                {isNarrowed && (
                  <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs">
                    <p className="font-medium text-foreground">
                      Reading {scopedEmployees.length} employee{scopedEmployees.length === 1 ? '' : 's'} only — punches of anyone else in the file are ignored.
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {scopedEmployees.length === 0
                        ? 'Nobody matches this branch / department.'
                        : `${scopedEmployees.slice(0, 12).map((e) => e.employeeNumber).join(', ')}${scopedEmployees.length > 12 ? ` and ${scopedEmployees.length - 12} more` : ''}`}
                    </p>
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  The system matches <span className="font-medium text-foreground">employee + date + assigned schedule + biometric record</span>, then shows a review screen. Schedules come from the Schedules roster.
                </p>
              </div>
            )}

            {methodChosen && (
              <>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(
                [
                  { value: 'zkteco', icon: Cpu, title: 'ZKTeco ZK3969', hint: 'Raw files are read directly: .dat, .txt, .csv or Excel .xlsx' },
                  { value: 'other', icon: FileSpreadsheet, title: 'Other biometrics device', hint: 'Follow the standard CSV template' },
                ] as const
              ).map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setDevice(o.value)
                    setFile(null)
                    setParseError(null)
                    setMappingDraft(null)
                  }}
                  className={cn('flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors', device === o.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40')}
                >
                  <o.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <span className="block text-sm font-medium">{o.title}</span>
                    <span className="block text-xs text-muted-foreground">{o.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                {device === 'zkteco' ? (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Note: all raw files from a ZKTeco ZK3969 are read directly</p>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                      <li>
                        <span className="font-medium text-foreground">USB attlog (.dat)</span> — User ID, Date-Time, Device ID, In/Out State, Verify Mode
                      </li>
                      <li>
                        <span className="font-medium text-foreground">GLog (.txt)</span> — No, Mchn, EnNo, Name, Mode, IOMd, DateTime
                      </li>
                      <li>
                        <span className="font-medium text-foreground">CSV or Excel (.xlsx)</span> — User ID / AC-No., Timestamp (or Date + Time), Verification Mode, In/Out State, Device ID. The first sheet is read.
                      </li>
                    </ul>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Device User IDs map to employee IDs by number (User 6 → FR-0006). Punches become one time-in and time-out per employee per day.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={() => handleDownloadSample('dat')}>
                        Sample .dat
                      </Button>
                      <Button type="button" size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={() => handleDownloadSample('csv')}>
                        Sample .csv
                      </Button>
                      <Button type="button" size="sm" variant="ghost" icon={<FlaskConical className="size-3.5" />} onClick={handleTrySample}>
                        Preview with Sample Data
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Note: other biometrics devices must follow the standard CSV template</p>
                    <p className="mt-1 text-xs text-muted-foreground">Export or copy your device's records into this format — one row per employee per day. The header row must be exactly:</p>
                    <code className="mt-1.5 block rounded bg-muted px-2 py-1 font-mono text-[11px]">{STANDARD_TEMPLATE_HEADERS.join(',')}</code>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                      <li>Employee ID as in the employee list (e.g. FR-0006)</li>
                      <li>Date as YYYY-MM-DD, times as HH:MM in 24-hour format</li>
                      <li>Optional columns <span className="font-medium text-foreground">Break Out</span> and <span className="font-medium text-foreground">Break In</span> (HH:MM) are the AM time out and PM time in</li>
                      <li>Time Out may be left blank; for an overnight shift, a Time Out earlier than Time In means it ended the next day</li>
                    </ul>
                    <div className="mt-3">
                      <Button type="button" size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={handleDownloadTemplate}>
                        Download template
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
              <UploadCloud className="size-8 text-muted-foreground" />
              {file ? <p className="text-sm font-medium">{file.name}</p> : <p className="text-sm text-muted-foreground">No file selected yet</p>}
              <Button type="button" size="sm" variant="secondary" icon={<Upload className="size-3.5" />} onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <input ref={fileInputRef} type="file" accept={device === 'zkteco' ? '.dat,.txt,.csv,.xlsx' : '.csv'} className="hidden" onChange={onFileSelected} />
              <p className="text-[11px] text-muted-foreground">{device === 'zkteco' ? '.dat, .txt, .csv, .xlsx' : '.csv (standard template)'}</p>
            </div>

            {parseError && (
              <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-danger">
                <AlertCircle className="mt-px size-3.5 shrink-0" />
                {parseError}
              </p>
            )}
            {mappingDraft && (
              <ColumnMappingForm
                key={JSON.stringify(mappingDraft.mapping)}
                headers={mappingDraft.headers}
                sample={mappingDraft.sample}
                initial={mappingDraft.mapping}
                onApply={applyMapping}
                onCancel={() => setMappingDraft(null)}
              />
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {/* While mapping columns, the form's own "Apply Mapping & Preview" is the next step. */}
              {!mappingDraft && (
                <Button type="button" onClick={handleImport} isLoading={isProcessing} disabled={!file || scopeInvalid || (mode === 'schedule' && isNarrowed && scopedEmployees.length === 0)}>
                  Import & Preview
                </Button>
              )}
            </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
