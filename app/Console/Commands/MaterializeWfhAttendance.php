<?php

namespace App\Console\Commands;

use App\Support\WfhPlanner;
use Illuminate\Console\Command;

class MaterializeWfhAttendance extends Command
{
    protected $signature = 'attendance:materialize-wfh';

    protected $description = 'Fill in attendance for approved work-from-home days that have come and have no record yet';

    public function handle(): int
    {
        $this->info(WfhPlanner::materialize().' day(s) filled in.');

        return self::SUCCESS;
    }
}
