<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Last employee number handed out per company; incremented under a row lock.
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedInteger('employee_sequence')->default(0);
        });

        // The list filters on these.
        Schema::table('employees', function (Blueprint $table) {
            $table->index('branch_id');
            $table->index('status');
            $table->index('payroll_group_id');
        });

        // Pay history: one row per change, effective from a date. Payroll reads the row effective on each date.
        Schema::create('employee_compensations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('effective_from');
            $table->string('rate_type', 30);
            $table->decimal('basic_rate', 12, 2);
            $table->string('output_unit')->nullable();
            $table->json('allowances')->nullable();
            $table->string('reason');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['employee_id', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_compensations');
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['branch_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['payroll_group_id']);
        });
        Schema::table('companies', fn (Blueprint $table) => $table->dropColumn('employee_sequence'));
    }
};
