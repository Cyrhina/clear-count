<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            // NULL = a system default (the shared Philippine calendar). Companies get their own copy of it, so each can edit freely.
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->date('date')->index();
            // Kept as a plain column (not a generated one) so it behaves the same on SQLite and MySQL; the model fills it from `date`.
            $table->unsignedSmallInteger('year');
            $table->string('type', 30);            // App\Enums\HolidayType
            $table->string('scope', 20)->default('national'); // App\Enums\HolidayScope
            $table->json('branch_ids')->nullable(); // branches a local holiday applies to
            // Pay multiplier when worked: 2.00 regular, 1.30 special non-working, 3.00 double.
            $table->decimal('pay_rate_multiplier', 4, 2);
            $table->text('description')->nullable();
            // True for rows that came from the Philippine default calendar; false for holidays a company added itself.
            $table->boolean('is_default')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
