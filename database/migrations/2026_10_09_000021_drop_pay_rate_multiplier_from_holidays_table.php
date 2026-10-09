<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Holiday pay rates are set once, in Payroll Settings > Overtime & Holiday Rates; a holiday only records its type.
    public function up(): void
    {
        Schema::table('holidays', function (Blueprint $table) {
            $table->dropColumn('pay_rate_multiplier');
        });
    }

    public function down(): void
    {
        Schema::table('holidays', function (Blueprint $table) {
            $table->decimal('pay_rate_multiplier', 4, 2)->default(1);
        });
    }
};
