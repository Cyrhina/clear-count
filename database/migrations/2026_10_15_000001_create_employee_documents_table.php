<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Files live on the private disk; they are only ever reached through a temporary signed link.
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('file_type', 20);
            $table->unsignedInteger('size');
            $table->string('path');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // A mixed pay structure (base plus a commission, piece rate or daily allowance) belongs to the pay change that set it.
        Schema::table('employee_compensations', function (Blueprint $table) {
            $table->json('mixed')->nullable()->after('allowances');
        });
    }

    public function down(): void
    {
        Schema::table('employee_compensations', fn (Blueprint $table) => $table->dropColumn('mixed'));
        Schema::dropIfExists('employee_documents');
    }
};
