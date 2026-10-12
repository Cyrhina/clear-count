<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compliance_deadlines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category', 20);   // SSS | PhilHealth | Pag-IBIG | BIR | Payroll | Other
            $table->text('description');       // {period} is replaced with the month a monthly remittance covers
            $table->string('frequency', 10);   // monthly | yearly | one_time
            $table->unsignedTinyInteger('due_day')->nullable();   // monthly and yearly
            $table->unsignedTinyInteger('due_month')->nullable(); // 0-11, yearly only (same as the JavaScript month)
            $table->date('due_date')->nullable();                  // one_time only
            $table->unsignedSmallInteger('remind_days_before')->default(7);
            $table->boolean('enabled')->default(true);
            $table->string('link')->nullable(); // in-app page where the admin acts on it; set by the defaults only
            $table->boolean('is_custom')->default(false); // custom ones can be deleted; built-in ones can only be switched off
            $table->timestamps();

            $table->index(['company_id', 'enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_deadlines');
    }
};
