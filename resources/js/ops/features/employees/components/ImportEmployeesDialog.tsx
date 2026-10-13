import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { downloadCsv, toCsv } from '@ops/features/reports/components/shared'
import { parseCsv } from '@ops/features/reports/reportExport'
import { BRANCHES_KEY, useBranches, useDepartments } from '@ops/features/branches/hooks/useBranches'
import { EMPLOYEES_KEY } from '@ops/features/employees/hooks/useEmployeeRecords'
import { apiErrorMessage } from '@ops/lib/api/http'
import { IMPORT_COLUMNS, importTemplateRows, parseEmployeeImport, toImportRow } from '@ops/lib/payroll/employeeImport'
import { importEmployees, type ImportReport } from '@ops/lib/services/employeeService'
import { cn } from '@ops/lib/utils/cn'

/** Bulk-add employees from a CSV. A downloadable sample file shows the exact columns and formats. */
export function ImportEmployeesDialog() {
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [csvRows, setCsvRows] = useState<string[][] | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const { branches } = useBranches()
  const { departments, isLoading: departmentsLoading } = useDepartments()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  // The server's dry run of the rows the browser accepted: it finds duplicate names and anything else only it can check.
  const [report, setReport] = useState<ImportReport | null>(null)
  const [checking, setChecking] = useState(false)

  const result = useMemo(() => (csvRows && !departmentsLoading ? parseEmployeeImport(csvRows, branches, departments) : null), [csvRows, branches, departments, departmentsLoading])
  const payloads = useMemo(() => (result?.rows ?? []).filter((r) => r.input).map((r) => toImportRow(r.input!, r.line)), [result])

  useEffect(() => {
    setReport(null)
    if (payloads.length === 0) return
    let current = true
    setChecking(true)
    importEmployees(payloads, true)
      .then((r) => current && setReport(r))
      .catch((error) => current && setReadError(apiErrorMessage(error)))
      .finally(() => current && setChecking(false))
    return () => {
      current = false
    }
  }, [payloads])

  // A row is ready when the browser and the server both accept it.
  const serverRow = (line: number) => report?.rows.find((r) => r.line === line)
  const rows = (result?.rows ?? []).map((row) => {
    const server = serverRow(row.line)
    return { ...row, errors: [...row.errors, ...(server?.errors ?? [])], warnings: [...row.warnings, ...(server?.warnings ?? [])] }
  })
  const valid = rows.filter((r) => r.input && r.errors.length === 0)
  const invalid = rows.filter((r) => r.errors.length > 0)

  function reset() {
    setFileName(null)
    setCsvRows(null)
    setReadError(null)
    setReport(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  function downloadSample() {
    // Departments must exist in the branch, so the sample uses the first branch's configured ones.
    const branch = branches.find((b) => departments.some((d) => d.branchId === b.id)) ?? branches[0]
    const configured = departments.filter((d) => d.branchId === branch?.id).map((d) => d.name)
    const [header, ...rows] = importTemplateRows(branch?.name ?? 'Main Office')
    const sample = configured.length ? rows.map((row, i) => row.map((cell, c) => (c === 2 ? configured[i % configured.length] : cell))) : rows
    downloadCsv('employee-import-sample.csv', `﻿${toCsv([header, ...sample])}`)
  }

  async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setReadError(null)
    if (!/\.csv$/i.test(file.name)) {
      setCsvRows(null)
      setFileName(null)
      setReadError('Please upload a .csv file. In Excel, use Save As → CSV (Comma delimited).')
      return
    }
    const rows = parseCsv(await file.text())
    setFileName(file.name)
    setCsvRows(rows.length > 0 ? rows : null)
    if (rows.length === 0) setReadError('That file is empty.')
  }

  async function onImport() {
    setImporting(true)
    try {
      const sent = payloads.filter((p) => valid.some((r) => r.line === p.line))
      const done = await importEmployees(sent, false)
      notify({
        title: `${done.created} employee${done.created === 1 ? '' : 's'} imported`,
        description: invalid.length > 0 ? `${invalid.length} row${invalid.length === 1 ? ' was' : 's were'} skipped.` : 'Added to the roster.',
        tone: 'success',
      })
      void queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] })
      void queryClient.invalidateQueries({ queryKey: [BRANCHES_KEY] })
      setOpen(false)
      reset()
    } catch (error) {
      notify({ title: "Couldn't import the employees", description: apiErrorMessage(error), tone: 'danger' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" icon={<Upload className="size-4" />}>
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Import Employees</DialogTitle>
        <DialogDescription>Add many employees at once from a CSV file. Start from the sample file so the columns and formats match.</DialogDescription>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <FileSpreadsheet className="size-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Sample file</p>
              <p className="text-xs text-muted-foreground">Five example employees — one for each pay type — with every column filled in. Replace them with your own.</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="w-full sm:w-auto" icon={<Download className="size-3.5" />} onClick={downloadSample}>
            Download Sample CSV
          </Button>
        </div>

        <details className="mt-3 rounded-xl border border-border text-sm">
          <summary className="cursor-pointer px-4 py-2.5 font-medium">Column guide</summary>
          <div className="max-h-52 overflow-y-auto border-t border-border px-4 py-2">
            <ul className="space-y-1.5 text-xs">
              {IMPORT_COLUMNS.map((c) => (
                <li key={c.header} className="flex gap-2">
                  <span className="w-36 shrink-0 font-medium">
                    {c.header}
                    {c.required && <span className="text-danger"> *</span>}
                  </span>
                  <span className="text-muted-foreground">{c.hint}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">* Required. Rows with a name that already exists are skipped.</p>
          </div>
        </details>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm" icon={<Upload className="size-3.5" />} onClick={() => fileInput.current?.click()}>
            {fileName ? 'Choose a Different File' : 'Choose CSV File'}
          </Button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileSelected} />
          {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
        </div>

        {readError && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-danger">
            <AlertCircle className="mt-px size-3.5 shrink-0" />
            {readError}
          </p>
        )}

        {result && result.missingColumns.length > 0 && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-danger">
            <AlertCircle className="mt-px size-3.5 shrink-0" />
            Missing required column{result.missingColumns.length === 1 ? '' : 's'}: {result.missingColumns.join(', ')}. Use the sample file's headers.
          </p>
        )}

        {result && result.missingColumns.length === 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {checking && <Badge tone="neutral">Checking with the server…</Badge>}
              <Badge tone="success">{valid.length} ready to import</Badge>
              {invalid.length > 0 && <Badge tone="danger">{invalid.length} with errors (will be skipped)</Badge>}
            </div>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No employee rows found below the header.</p>
            ) : (
              <div className="max-h-72 overflow-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Pay</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.line} className={cn(row.errors.length > 0 && 'bg-danger/5')}>
                        <TableCell className="text-muted-foreground">{row.line}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.input ? `${row.input.position} · ${row.input.department}` : '—'}</TableCell>
                        <TableCell>{row.input ? `${row.input.payType.replace('_', '-')} · ${row.input.basicPay.toLocaleString('en-PH')}` : '—'}</TableCell>
                        <TableCell className="text-xs">
                          {row.errors.length > 0 ? (
                            <span className="text-danger">{row.errors.join('; ')}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle2 className="size-3.5" /> Ready
                              {row.warnings.length > 0 && <span className="text-warning"> · {row.warnings.join('; ')}</span>}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={valid.length === 0 || importing || checking} onClick={onImport}>
            {valid.length > 0 ? `Import ${valid.length} Employee${valid.length === 1 ? '' : 's'}` : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
