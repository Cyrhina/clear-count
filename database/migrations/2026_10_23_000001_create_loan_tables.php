<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('key', 80); // stored on each loan; a custom type gets custom_<label>
            $table->string('label');
            $table->string('provider', 10); // SSS | Pag-IBIG | Company | Other
            $table->string('description')->nullable();
            $table->string('typical_term')->nullable(); // reference only
            $table->string('typical_amount')->nullable(); // reference only
            $table->string('amount_type', 6)->default('custom'); // fixed (every loan has the type's amounts) | custom (set per employee)
            $table->decimal('fixed_principal', 12, 2)->nullable();
            $table->decimal('fixed_monthly_deduction', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('built_in')->default(false); // built-in types can be edited or deactivated, never deleted
            $table->timestamps();

            $table->unique(['company_id', 'key']);
        });

        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('type', 80); // a loan_types key
            $table->string('label');
            $table->decimal('principal', 12, 2);
            $table->decimal('monthly_deduction', 12, 2);
            $table->date('start_date');
            $table->string('status', 10)->default('active'); // active | completed | suspended | cancelled
            $table->timestamps();

            $table->index(['employee_id', 'status']);
        });

        // The ledger: balance = principal - sum of entries. Payroll writes a repayment when a run finalizes (P10); nothing is edited in place.
        Schema::create('loan_repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained()->cascadeOnDelete();
            $table->string('entry_type', 10)->default('repayment'); // repayment | adjustment
            $table->decimal('amount', 12, 2); // signed: a repayment is positive and lowers the balance
            $table->date('paid_on');
            $table->string('payroll_reference')->nullable();
            $table->unsignedBigInteger('payroll_period_id')->nullable();
            $table->timestamps();

            $table->index('loan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('loan_types');
    }
};
