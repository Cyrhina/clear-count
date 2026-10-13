<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('is_paid')->default(true);
            $table->decimal('default_credits', 5, 1)->default(0);
            $table->decimal('max_carry_over', 5, 1)->default(0);
            // Yearly credits per hierarchy tier: {executive, managerial, rank_and_file}. A tier left out gets default_credits.
            $table->json('tier_credits')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained()->restrictOnDelete();
            $table->date('date_from');
            $table->date('date_to');
            $table->string('day_portion', 8)->default('full'); // full | half_am | half_pm
            // Credits the request uses, worked out when it was filed: working days in the range, minus rest days and holidays.
            $table->decimal('days', 5, 1);
            $table->string('reason')->nullable();
            $table->string('status', 10)->default('pending'); // pending | approved | rejected | cancelled
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'date_from']);
            $table->index(['company_id', 'status']);
        });

        // The ledger: balance = sum of entries. Nothing is edited in place; a change is a new entry.
        Schema::create('leave_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained()->cascadeOnDelete();
            $table->string('entry_type', 12); // grant | adjustment | used | reversal | expiry
            $table->decimal('days', 6, 1); // signed: credits in are positive, credits out are negative
            $table->unsignedSmallInteger('leave_year');
            $table->date('effective_date');
            $table->foreignId('leave_request_id')->nullable()->constrained('leave_requests')->nullOnDelete();
            $table->string('reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['employee_id', 'leave_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_ledger');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_types');
    }
};
