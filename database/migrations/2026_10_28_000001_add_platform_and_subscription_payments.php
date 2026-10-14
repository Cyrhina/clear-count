<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // A suspended company's users are signed out and cannot sign in until the super admin activates it again.
            $table->string('status')->default('active')->after('plan_tier');
            $table->date('plan_renews_on')->nullable()->after('status');
        });

        // One row per upgrade the company paid for: the plan changes only when the super admin confirms the payment.
        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_tier');
            $table->string('to_tier');
            $table->decimal('amount', 12, 2);
            $table->string('payment_reference')->unique();
            $table->string('receipt_reference');
            $table->string('proof_path');
            $table->timestamp('terms_accepted_at');
            $table->string('status')->default('pending')->index();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->string('decision_remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
        Schema::table('companies', fn (Blueprint $table) => $table->dropColumn(['status', 'plan_renews_on']));
    }
};
