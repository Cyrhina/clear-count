<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thirteenth_month_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->date('generation_date');
            $table->string('payout_period_label'); // printed on the payslips, e.g. "December 2026"
            $table->json('selection'); // who the batch was made for: {mode, employee_ids?, payroll_group_id?, department?}
            $table->date('coverage_start');
            $table->date('coverage_end');
            $table->string('status', 10)->default('draft'); // draft | finalized
            $table->foreignId('finalized_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'year']);
        });

        Schema::create('thirteenth_month_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('thirteenth_month_run_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('active_from');
            $table->date('active_to');
            $table->boolean('separated')->default(false);
            $table->decimal('months_credited', 5, 2);
            $table->decimal('gross_basic_earned', 12, 2);
            $table->decimal('undertime_hours', 8, 2)->default(0);
            $table->decimal('undertime_deduction', 12, 2)->default(0);
            $table->decimal('unpaid_absence_days', 8, 2)->default(0);
            $table->decimal('absence_deduction', 12, 2)->default(0);
            $table->decimal('annual_basic_earned', 12, 2);
            $table->decimal('thirteenth_month_pay', 12, 2);
            $table->decimal('taxable_excess', 12, 2)->default(0);
            $table->decimal('withholding_tax', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2);
            $table->json('breakdown'); // the whole line: month by month earnings, the rates and the dates of undertime and absences
            $table->timestamps();

            $table->unique(['thirteenth_month_run_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thirteenth_month_lines');
        Schema::dropIfExists('thirteenth_month_runs');
    }
};
