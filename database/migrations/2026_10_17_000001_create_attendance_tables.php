<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per employee per day. No row = nothing logged yet (the screen shows it as absent or on leave).
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('work_schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->time('break_out')->nullable();
            $table->time('break_in')->nullable();
            $table->string('status', 12); // present | late | undertime | absent
            $table->string('work_type', 10)->default('onsite'); // onsite | wfh | field
            $table->string('source', 12)->default('manual'); // manual | biometric | wfh | adjustment
            // A day the system filled in from a WFH arrangement (P5b); a real punch replaces it.
            $table->boolean('auto_recorded')->default(false);
            $table->unsignedBigInteger('wfh_id')->nullable();
            $table->unsignedSmallInteger('late_minutes')->default(0);
            $table->unsignedSmallInteger('undertime_minutes')->default(0);
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index(['company_id', 'date']);
            $table->index(['employee_id', 'status']);
        });

        Schema::create('attendance_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attendance_record_id')->constrained()->cascadeOnDelete();
            $table->time('requested_time_in')->nullable();
            $table->time('requested_time_out')->nullable();
            $table->string('reason');
            $table->string('reason_category', 60)->nullable();
            $table->string('status', 10)->default('pending'); // pending | approved | rejected
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_adjustments');
        Schema::dropIfExists('attendance_records');
    }
};
