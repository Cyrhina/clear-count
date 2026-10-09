<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Set when an admin invites the user; `last_login_at` stays null until they first sign in (= invite still pending).
            $table->timestamp('invited_at')->nullable()->after('is_active');
            $table->timestamp('last_login_at')->nullable()->after('invited_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['invited_at', 'last_login_at']);
        });
    }
};
