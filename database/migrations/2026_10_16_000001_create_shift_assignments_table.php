<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The employee's default work schedule; the roster below overrides it for single days.
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('work_schedule_id')->nullable()->after('payroll_group_id')->constrained()->nullOnDelete();
        });

        // One row per employee per rostered day. No schedule = a rostered rest day; no row = not yet scheduled.
        Schema::create('shift_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->foreignId('work_schedule_id')->nullable()->constrained()->cascadeOnDelete();
            $table->boolean('is_rest_day')->default(false);
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index(['company_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_assignments');
        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('work_schedule_id');
        });
    }
};
