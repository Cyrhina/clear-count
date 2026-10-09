<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            // `action` now holds the verb pill (Approved, Viewed, Processed...), `title` the subject line,
            // and `description` (was `details`) the secondary line.
            $table->renameColumn('details', 'description');
            $table->string('module', 50)->nullable()->after('actor');
            $table->string('title')->nullable()->after('action');
            $table->nullableMorphs('subject');
            // IP address, user agent and any extra context.
            $table->json('properties')->nullable();
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            // The log table is read newest-first and filtered by company plus module, user or date.
            $table->index(['company_id', 'created_at']);
            $table->index(['module', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'created_at']);
            $table->dropIndex(['module', 'created_at']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['action']);
            $table->dropMorphs('subject');
            $table->dropColumn(['module', 'title', 'properties']);
            $table->renameColumn('description', 'details');
        });
    }
};
