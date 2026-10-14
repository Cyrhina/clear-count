<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslip_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 20)->default('payroll'); // payroll now; thirteenth_month and bonus with P12
            $table->unsignedBigInteger('source_id'); // the payroll period (or, later, the 13th month run or bonus)
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('subject');
            $table->string('recipient')->nullable();
            $table->string('status', 10)->default('queued'); // queued | sent | failed
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->text('error')->nullable();
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['kind', 'source_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslip_emails');
    }
};
