<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
     * Government tables, each dated: a row set holds "from this date on". company_id null is the system default every company
     * starts with; a company's own rows (from its first edit) take over for it from their effective_from.
     */
    public function up(): void
    {
        Schema::create('sss_brackets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('effective_from');
            $table->decimal('min_salary', 12, 2);
            $table->decimal('max_salary', 12, 2)->nullable(); // null = no upper limit
            $table->decimal('msc', 12, 2); // monthly salary credit
            $table->decimal('employee_share', 12, 2);
            $table->decimal('employer_share', 12, 2);
            $table->decimal('ec', 12, 2); // employer-paid Employees' Compensation premium
            $table->index(['company_id', 'effective_from']);
        });

        Schema::create('philhealth_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('effective_from');
            $table->decimal('rate', 7, 5);
            $table->decimal('employee_share_percent', 5, 4);
            $table->decimal('employer_share_percent', 5, 4);
            $table->decimal('salary_floor', 12, 2);
            $table->decimal('salary_ceiling', 12, 2);
            $table->index(['company_id', 'effective_from']);
        });

        Schema::create('pagibig_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('effective_from');
            $table->decimal('rate', 7, 5);
            $table->decimal('max_fund_salary', 12, 2);
            $table->decimal('employee_amount', 12, 2);
            $table->decimal('employer_amount', 12, 2);
            $table->index(['company_id', 'effective_from']);
        });

        // One bracket table per pay period (annual, monthly, semi_monthly, weekly, daily).
        Schema::create('tax_brackets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('effective_from');
            $table->string('frequency', 12);
            $table->decimal('min', 14, 2);
            $table->decimal('max', 14, 2)->nullable();
            $table->decimal('rate', 6, 4);
            $table->decimal('base_tax', 14, 2);
            $table->index(['company_id', 'frequency', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_brackets');
        Schema::dropIfExists('pagibig_rates');
        Schema::dropIfExists('philhealth_rates');
        Schema::dropIfExists('sss_brackets');
    }
};
