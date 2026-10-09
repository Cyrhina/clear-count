<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Profile & branding (`name` and `trade_name` already exist).
            $table->string('logo_path')->nullable()->after('trade_name');
            $table->string('company_type', 30)->default('corporation')->after('logo_path');
            $table->string('industry')->nullable();
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('description')->nullable();
            $table->boolean('use_logo_colors')->default(false);
            // Dominant logo colour (#rrggbb) the UI themes itself with when `use_logo_colors` is on.
            $table->string('brand_color', 7)->nullable();

            // Philippine registrations. Plain strings: they keep the dashes people type (e.g. 123-456-789-000).
            $table->string('sec_number', 30)->nullable();            // Corporations / partnerships
            $table->string('dti_number', 30)->nullable();            // Sole proprietorships
            $table->string('tin', 20)->nullable();                   // BIR Tax Identification Number
            $table->string('rdo_code', 60)->nullable();              // BIR Revenue District Office
            $table->string('philhealth_pen', 20)->nullable();        // PhilHealth Employer No.
            $table->string('sss_number', 20)->nullable();            // SSS Employer No.
            $table->string('pagibig_hdmf', 20)->nullable();          // Pag-IBIG (HDMF) Employer No.
            $table->string('business_permit_number', 60)->nullable(); // LGU business permit

            // Addresses and contacts are small fixed-shape objects that are always read and written together.
            $table->json('registered_address')->nullable();
            $table->json('office_address')->nullable();
            $table->boolean('same_as_registered')->default(false);
            $table->json('primary_contact')->nullable();
            $table->json('payroll_contact')->nullable();
            $table->json('hr_contact')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'logo_path', 'company_type', 'industry', 'website', 'email', 'phone', 'description', 'use_logo_colors', 'brand_color',
                'sec_number', 'dti_number', 'tin', 'rdo_code', 'philhealth_pen', 'sss_number', 'pagibig_hdmf', 'business_permit_number',
                'registered_address', 'office_address', 'same_as_registered', 'primary_contact', 'payroll_contact', 'hr_contact',
            ]);
        });
    }
};
