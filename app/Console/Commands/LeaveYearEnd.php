<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\LeaveType;
use App\Support\LeaveLedger;
use Illuminate\Console\Command;

class LeaveYearEnd extends Command
{
    protected $signature = 'leave:year-end {--year= : The leave year that is ending (default: last year)}';

    protected $description = 'Close the leave year: carry over credits up to each type\'s limit, expire the rest, and grant the new year\'s credits';

    public function handle(): int
    {
        $ending = (int) ($this->option('year') ?: now()->subYear()->year);
        $expired = 0.0;
        $granted = 0;

        // Active employees only. No signed-in user here, so the scopes let the command see every company.
        foreach (Employee::where('status', 'active')->get() as $employee) {
            foreach (LeaveType::where('company_id', $employee->company_id)->get() as $type) {
                $expired += LeaveLedger::closeYear($employee, $type, $ending);
            }
            $granted += LeaveLedger::grantYear($employee, $ending + 1);
        }

        $this->info("Leave year {$ending} closed: {$expired} day(s) expired, {$granted} new credit grant(s) for ".($ending + 1).'.');

        return self::SUCCESS;
    }
}
