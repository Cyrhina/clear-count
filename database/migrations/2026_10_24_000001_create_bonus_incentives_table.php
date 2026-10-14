<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bonus_incentives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('bonus_type', 20); // fixed_amount | percentage | performance_based | output_based
            $table->string('target_type', 10); // employee | employees | department | company
            $table->foreignId('target_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->json('target_employee_ids')->nullable();
            $table->string('target_department')->nullable();
            // Pesos, or for percentage the percentage points (10 = 10%) of the employee's monthly-equivalent basic pay.
            $table->decimal('amount', 12, 2);
            // The label of the payroll period that pays it, e.g. "December 2026". Payroll pulls in approved bonuses whose label matches the period it runs (P10).
            $table->string('period_label');
            $table->boolean('taxable')->default(true);
            $table->string('frequency', 10); // one_time | recurring
            $table->string('payout_mode', 20)->default('regular_payroll'); // regular_payroll | separate_payslip
            $table->string('notes')->nullable();
            $table->string('status', 10)->default('draft'); // draft | pending | approved | rejected
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bonus_incentives');
    }
};
