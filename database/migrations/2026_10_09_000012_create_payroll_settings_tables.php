<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('earning_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category', 40);               // Basic, De Minimis, Allowance, Overtime, Bonus ...
            $table->string('calc_type', 10)->default('fixed'); // fixed | variable
            $table->boolean('taxable')->default(true);
            $table->boolean('included_in_payroll')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('deduction_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category', 20);                    // government | tax | loan | other
            $table->string('calc_type', 10)->default('fixed'); // fixed | variable
            $table->string('recurrence', 10)->default('recurring'); // recurring | one_time
            $table->string('allocation_method', 20)->nullable();    // equal_split | specific_cutoff | custom
            $table->unsignedTinyInteger('specific_cutoff_period')->nullable();
            $table->json('custom_split_percentages')->nullable();   // must add up to 100
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('overtime_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('key', 60);                         // stable id: regular, rest_day_holiday, regular_holiday_worked ...
            $table->string('group', 10);                       // overtime | holiday
            $table->string('label');
            $table->decimal('multiplier', 6, 4);               // 1.25 = 125%
            $table->boolean('is_custom')->default(false);      // custom rows can be deleted; built-in ones cannot
            $table->timestamps();

            $table->unique(['company_id', 'key']);
        });

        // Company-wide calculation rules (late/undertime, grace period, absences, proration...), edited as one block.
        Schema::table('companies', function (Blueprint $table) {
            $table->json('payroll_rules')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('payroll_rules');
        });
        Schema::dropIfExists('overtime_rates');
        Schema::dropIfExists('deduction_types');
        Schema::dropIfExists('earning_types');
    }
};
