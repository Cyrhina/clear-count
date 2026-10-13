<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('benefit_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('category', 12); // hmo | allowance | insurance | other
            $table->string('name');
            $table->string('provider')->nullable();
            $table->string('coverage')->nullable();
            $table->decimal('monthly_value', 12, 2)->default(0); // company-paid cost per employee per month (the default amount of a custom plan)
            $table->string('amount_type', 6)->default('fixed'); // fixed | custom (each employee has their own amount)
            $table->decimal('employee_share', 12, 2)->default(0); // monthly payroll deduction
            $table->string('notes')->nullable();
            $table->string('status', 10)->default('active'); // active | archived
            $table->timestamps();

            $table->unique(['company_id', 'category', 'name']);
        });

        // One row per employee per enrolment. A plan edit is copied onto the live rows; a transfer ends one row and starts another.
        Schema::create('employee_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('benefit_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category', 12);
            $table->string('name');
            $table->string('provider')->nullable();
            $table->string('coverage')->nullable();
            $table->decimal('monthly_value', 12, 2)->default(0);
            $table->decimal('employee_share', 12, 2)->default(0);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('status', 10)->default('active'); // active | paused | cancelled
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'status']);
        });

        Schema::create('deduction_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('amount', 12, 2)->default(0); // monthly (the default amount of a custom plan)
            $table->string('amount_type', 6)->default('fixed');
            $table->string('reason')->nullable();
            $table->string('status', 10)->default('active');
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        // A recurring deduction (a monthly amount split over the month's pay runs) or a one-time one (taken in the run covering due_date).
        Schema::create('employee_deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('deduction_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('kind', 10); // recurring | one_time
            $table->decimal('amount', 12, 2);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('status', 10)->default('active'); // active | paused | completed | cancelled
            // Set when a payroll run takes a one-time deduction (P10).
            $table->unsignedBigInteger('settled_in_period_id')->nullable();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_deductions');
        Schema::dropIfExists('deduction_plans');
        Schema::dropIfExists('employee_benefits');
        Schema::dropIfExists('benefit_plans');
    }
};
