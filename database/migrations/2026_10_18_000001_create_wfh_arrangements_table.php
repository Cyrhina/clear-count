<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One arrangement per employee; a bulk apply shares a batch id.
        Schema::create('wfh_arrangements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 10); // standing | temporary
            $table->date('date_from');
            $table->date('date_to')->nullable(); // null = open-ended (standing only)
            $table->json('days_of_week'); // 0 = Sunday ... 6 = Saturday; empty = every working day
            $table->string('times', 10); // default | custom | self_log
            $table->json('custom')->nullable(); // {timeIn, breakOut, breakIn, timeOut}
            $table->string('reason');
            $table->string('status', 10)->default('pending'); // pending | approved | rejected | cancelled
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->uuid('batch_id')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'status']);
            $table->index(['company_id', 'status']);
        });

        // Optional cap on WFH days per employee per month. 0 = no cap. It only warns.
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedSmallInteger('wfh_monthly_limit')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('wfh_monthly_limit');
        });
        Schema::dropIfExists('wfh_arrangements');
    }
};
