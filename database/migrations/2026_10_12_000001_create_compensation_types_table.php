<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compensation_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('kind', 30); // App\Enums\CompensationKind
            $table->json('config')->nullable(); // rates and output/commission settings; shape depends on the kind
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        // A group points at one of the company's compensation types instead of a fixed list of four.
        Schema::table('payroll_groups', function (Blueprint $table) {
            $table->foreignId('compensation_type_id')->nullable()->after('frequency')->constrained('compensation_types')->nullOnDelete();
            $table->dropColumn('compensation_type');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_groups', function (Blueprint $table) {
            $table->string('compensation_type', 20)->default('monthly_rate');
            $table->dropConstrainedForeignId('compensation_type_id');
        });

        Schema::dropIfExists('compensation_types');
    }
};
