<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('frequency', 20);          // App\Enums\PayrollFrequency
            $table->string('compensation_type', 20);  // App\Enums\CompensationType
            // Shape depends on the frequency; validated by StorePayrollGroupRequest and read by App\Support\PayrollCalendar.
            $table->json('cutoff_config');
            $table->json('pay_date_config');
            $table->string('deduction_schedule', 30); // App\Enums\DeductionScheduleType
            $table->foreignId('work_schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->date('effective_date');
            $table->string('status', 10)->default('active');
            $table->timestamps();

            $table->unique(['company_id', 'name']);
            $table->index(['company_id', 'status']);
        });

        // One payroll group per employee: a plain foreign key is enough (no pivot table needed).
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('payroll_group_id')->nullable()->after('branch_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payroll_group_id');
        });
        Schema::dropIfExists('payroll_groups');
    }
};
