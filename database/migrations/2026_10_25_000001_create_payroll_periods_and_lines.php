<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payroll_group_id')->nullable()->constrained()->nullOnDelete(); // empty: every active employee, each on their own group's frequency
            $table->string('payroll_number', 12); // PR001, restarting every year (by pay date)
            $table->unsignedSmallInteger('payroll_year');
            $table->string('label');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('pay_date');
            $table->string('status', 10)->default('draft'); // draft | review | approved | finalized
            $table->json('excluded_employee_ids')->nullable(); // held out of the run
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('finalized_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'payroll_year', 'payroll_number']);
            $table->index(['company_id', 'start_date']);
        });

        Schema::create('payroll_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payroll_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            // Totals for queries and reports; `breakdown` is the whole line as the engine produced it (earnings, deductions, benefits, statutory detail).
            $table->decimal('gross_pay', 12, 2);
            $table->decimal('total_deductions', 12, 2);
            $table->decimal('net_pay', 12, 2);
            $table->decimal('withholding_tax', 12, 2);
            $table->decimal('sss_employee', 12, 2);
            $table->decimal('sss_employer', 12, 2);
            $table->decimal('philhealth_employee', 12, 2);
            $table->decimal('philhealth_employer', 12, 2);
            $table->decimal('pagibig_employee', 12, 2);
            $table->decimal('pagibig_employer', 12, 2);
            $table->json('breakdown');
            $table->timestamps();

            $table->unique(['payroll_period_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_lines');
        Schema::dropIfExists('payroll_periods');
    }
};
