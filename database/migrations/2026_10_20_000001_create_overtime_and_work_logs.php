<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('overtime_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('work_date');
            $table->time('start_time');
            $table->time('end_time'); // earlier than start_time means the shift crosses midnight
            $table->decimal('hours', 4, 1); // worked out by the server
            $table->string('type', 40); // an overtime_rates key
            $table->decimal('multiplier', 5, 3); // copied from overtime_rates when filed, so a later rate edit does not change it
            $table->string('reason')->nullable();
            $table->string('source', 8)->default('admin'); // admin | ess
            $table->string('status', 10)->default('pending'); // pending | approved | rejected
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['employee_id', 'work_date']);
        });

        // Hours of an hourly employee, or units of an output-based one, waiting for approval before payroll pays them.
        Schema::create('work_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('type', 8); // hourly | output
            $table->date('work_date');
            $table->decimal('quantity', 8, 2);
            $table->string('unit_label', 60); // "hrs", or the employee's output unit
            $table->decimal('rate', 12, 2); // the employee's rate when filed
            $table->decimal('amount', 12, 2); // quantity x rate, worked out by the server
            $table->string('description')->nullable();
            $table->string('status', 10)->default('pending');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            // Set when a payroll run pays the log (P10). A paid log is locked.
            $table->unsignedBigInteger('payroll_period_id')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['employee_id', 'work_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_logs');
        Schema::dropIfExists('overtime_records');
    }
};
