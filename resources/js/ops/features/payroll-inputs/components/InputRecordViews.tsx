import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import type { PayrollInputs } from '@ops/lib/services/payrollInputsService'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'

type TimeRow = PayrollInputs['time'][number]
type OutputRow = PayrollInputs['output'][number]
type OtherRow = PayrollInputs['other'][number]

const hours = (n: number) => (n === 0 ? '—' : n.toLocaleString('en-PH', { maximumFractionDigits: 2 }))
const count = (n: number) => (n === 0 ? '—' : String(n))
const outputTone = (status: OutputRow['status']) => (status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning')

function Person({ name, number }: { name: string; number?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{name}</p>
      {number && <p className="text-[11px] text-muted-foreground">{number}</p>}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('text-sm tabular-nums', value === '—' ? 'text-muted-foreground' : 'font-medium', highlight && value !== '—' && 'text-warning')}>{value}</p>
    </div>
  )
}

/** Phones and tablets show cards (one column, two from `sm`); `lg` and up show the table. */
const CARD_GRID = 'grid gap-2.5 sm:grid-cols-2 lg:hidden'

export function TimeRecordsView({ rows }: { rows: TimeRow[] }) {
  return (
    <>
      <div className={CARD_GRID}>
        {rows.map((row) => (
          <Card key={row.employeeId} watermark={null} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <Person name={row.name} number={row.employeeNumber} />
              <span className="shrink-0 text-xs text-muted-foreground">{row.department}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2.5 border-t border-border pt-3">
              <Stat label="Days present" value={count(row.daysPresent)} />
              <Stat label="Regular hrs" value={hours(row.regularHours)} />
              <Stat label="OT hrs" value={hours(row.overtimeHours)} />
              <Stat label="ND hrs" value={hours(row.nightDiffHours)} />
              <Stat label="Late" value={count(row.late)} highlight />
              <Stat label="Undertime" value={count(row.undertime)} highlight />
              <Stat label="Absent" value={count(row.absent)} highlight />
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Days present</TableHead>
              <TableHead className="text-right">Regular hrs</TableHead>
              <TableHead className="text-right">Late</TableHead>
              <TableHead className="text-right">Undertime</TableHead>
              <TableHead className="text-right">Absent</TableHead>
              <TableHead className="text-right">OT hrs</TableHead>
              <TableHead className="text-right">ND hrs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.employeeId}>
                <TableCell>
                  <Person name={row.name} number={row.employeeNumber} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.department}</TableCell>
                <TableCell className="text-right tabular-nums">{count(row.daysPresent)}</TableCell>
                <TableCell className="text-right tabular-nums">{hours(row.regularHours)}</TableCell>
                <TableCell className="text-right tabular-nums">{count(row.late)}</TableCell>
                <TableCell className="text-right tabular-nums">{count(row.undertime)}</TableCell>
                <TableCell className="text-right tabular-nums">{count(row.absent)}</TableCell>
                <TableCell className="text-right tabular-nums">{hours(row.overtimeHours)}</TableCell>
                <TableCell className="text-right tabular-nums">{hours(row.nightDiffHours)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}

export function OutputRecordsView({ rows }: { rows: OutputRow[] }) {
  return (
    <>
      <div className={CARD_GRID}>
        {rows.map((row) => (
          <Card key={row.id} watermark={null} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <Person name={row.name} number={row.employeeNumber} />
              <Badge tone={outputTone(row.status)} className="shrink-0 capitalize">
                {row.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm">{row.description || row.unitLabel}</p>
            <p className="text-xs text-muted-foreground">{formatDate(row.workDate)}</p>
            <div className="mt-3 grid grid-cols-3 gap-x-3 border-t border-border pt-3">
              <Stat label="Piece rate" value={formatCurrency(row.rate)} />
              <Stat label="Quantity" value={`${row.quantity} ${row.unitLabel}`} />
              <Stat label="Amount" value={formatCurrency(row.amount)} />
            </div>
            {row.payrollNumber && <p className="mt-2 text-[11px] text-muted-foreground">Paid in {row.payrollNumber}</p>}
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Output</TableHead>
              <TableHead className="text-right">Piece rate</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Person name={row.name} number={row.employeeNumber} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(row.workDate)}</TableCell>
                <TableCell className="text-sm">{row.description || row.unitLabel}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(row.rate)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.quantity} {row.unitLabel}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(row.amount)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={outputTone(row.status)} className="capitalize">
                      {row.status}
                    </Badge>
                    {row.payrollNumber && <span className="text-[11px] text-muted-foreground">Paid in {row.payrollNumber}</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}

export function OtherInputsView({ rows }: { rows: OtherRow[] }) {
  return (
    <>
      <div className={CARD_GRID}>
        {rows.map((row) => (
          <Card key={row.id} watermark={null} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <Badge tone="brand">{row.kind}</Badge>
              <span className="text-xs capitalize text-muted-foreground">{row.status}</span>
            </div>
            <div className="mt-2">
              <Person name={row.name} number={row.employeeNumber} />
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-sm capitalize text-muted-foreground">{row.detail}</p>
              <p className="shrink-0 text-sm font-medium tabular-nums">{row.amount === undefined ? '—' : formatCurrency(row.amount)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Employee / item</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Badge tone="brand">{row.kind}</Badge>
                </TableCell>
                <TableCell>
                  <Person name={row.name} number={row.employeeNumber} />
                </TableCell>
                <TableCell className="text-sm capitalize text-muted-foreground">{row.detail}</TableCell>
                <TableCell className="text-right tabular-nums">{row.amount === undefined ? '—' : formatCurrency(row.amount)}</TableCell>
                <TableCell className="text-sm capitalize text-muted-foreground">{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
