<?php

namespace App\Models;

use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $name Registered name
 * @property string|null $trade_name
 * @property string|null $logo_path Path on the public disk
 * @property string $company_type corporation | partnership | sole_proprietorship | other
 * @property string $plan_tier
 * @property string $timezone
 * @property string $payroll_frequency
 * @property bool $use_logo_colors
 * @property bool $same_as_registered
 * @property array<string, mixed>|null $registered_address
 * @property array<string, mixed>|null $office_address
 * @property array<string, mixed>|null $primary_contact
 * @property array<string, mixed>|null $payroll_contact
 * @property array<string, mixed>|null $hr_contact
 * @property array<string, mixed>|null $profile
 */
#[Fillable([
    'name', 'trade_name', 'plan_tier', 'timezone', 'payroll_frequency', 'profile',
    'company_type', 'industry', 'website', 'email', 'phone', 'description', 'use_logo_colors', 'brand_color',
    // Philippine statutory and tax registrations
    'sec_number', 'dti_number', 'tin', 'rdo_code', 'philhealth_pen', 'sss_number', 'pagibig_hdmf', 'business_permit_number',
    'registered_address', 'office_address', 'same_as_registered', 'primary_contact', 'payroll_contact', 'hr_contact', 'payroll_rules',
])]
class Company extends Model
{
    /** @use HasFactory<CompanyFactory> */
    use HasFactory;

    /** Company info the Company Info form edits (everything but the logo, which has its own methods). */
    public const INFO_FIELDS = [
        'name', 'trade_name', 'company_type', 'industry', 'website', 'email', 'phone', 'description', 'use_logo_colors', 'brand_color',
        'sec_number', 'dti_number', 'tin', 'rdo_code', 'philhealth_pen', 'sss_number', 'pagibig_hdmf', 'business_permit_number',
        'registered_address', 'office_address', 'same_as_registered', 'primary_contact', 'payroll_contact', 'hr_contact',
    ];

    protected $attributes = ['status' => 'active'];

    protected function casts(): array
    {
        return [
            'profile' => 'array',
            'plan_renews_on' => 'date',
            'use_logo_colors' => 'boolean',
            'same_as_registered' => 'boolean',
            'registered_address' => 'array',
            'office_address' => 'array',
            'primary_contact' => 'array',
            'payroll_contact' => 'array',
            'hr_contact' => 'array',
            'payroll_rules' => 'array',
        ];
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }

    /**
     * The company address as one printable line for PDFs: the registered address, or the office address when the registered
     * one is empty. Both are stored as arrays (street, city ...), so they cannot be echoed as they are. The country alone does
     * not count as an address, because the form fills it in by default. Returns '' when no address is set.
     */
    public function addressLine(): string
    {
        foreach ([$this->registered_address, $this->office_address] as $address) {
            if ($address === null) {
                continue;
            }

            $parts = array_values(array_filter(array_map(
                fn (string $key) => is_scalar($address[$key] ?? null) ? trim((string) $address[$key]) : '',
                ['building_unit', 'street', 'barangay', 'city', 'province', 'region', 'zip_code'],
            )));
            if ($parts !== []) {
                $country = is_scalar($address['country'] ?? null) ? trim((string) $address['country']) : '';

                return implode(', ', [...$parts, ...($country !== '' ? [$country] : [])]);
            }
        }

        return '';
    }
}
