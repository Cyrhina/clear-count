<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Company */
class CompanyInfoResource extends JsonResource
{
    private const ADDRESS = ['building_unit', 'street', 'barangay', 'city', 'province', 'region', 'zip_code'];

    private const CONTACT = ['name', 'position', 'email', 'contact_number'];

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'logo_url' => $this->logoUrl(),
            'name' => $this->name,
            'trade_name' => $this->trade_name,
            'company_type' => $this->company_type,
            'industry' => $this->industry,
            'website' => $this->website,
            'email' => $this->email,
            'phone' => $this->phone,
            'description' => $this->description,
            'use_logo_colors' => $this->use_logo_colors,
            'brand_color' => $this->brand_color,

            // Philippine statutory and tax registrations, grouped like the form's section.
            'registration' => [
                'sec_number' => $this->sec_number,
                'dti_number' => $this->dti_number,
                'tin' => $this->tin,
                'rdo_code' => $this->rdo_code,
                'philhealth_pen' => $this->philhealth_pen,
                'sss_number' => $this->sss_number,
                'pagibig_hdmf' => $this->pagibig_hdmf,
                'business_permit_number' => $this->business_permit_number,
            ],

            // Never null: the form always gets every field, empty ones as ''.
            'registered_address' => $this->shape($this->registered_address, self::ADDRESS, ['country' => 'Philippines']),
            'office_address' => $this->shape($this->office_address, self::ADDRESS, ['country' => 'Philippines']),
            'same_as_registered' => $this->same_as_registered,
            'primary_contact' => $this->shape($this->primary_contact, self::CONTACT),
            'payroll_contact' => $this->shape($this->payroll_contact, ['name', 'email', 'contact_number']),
            'hr_contact' => $this->shape($this->hr_contact, ['name', 'email', 'contact_number']),

            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Fills in missing keys so the frontend never has to null-check a section.
     *
     * @param  array<string, mixed>|null  $value
     * @param  list<string>  $keys
     * @param  array<string, string>  $extra  Keys with a non-empty default.
     * @return array<string, mixed>
     */
    private function shape(?array $value, array $keys, array $extra = []): array
    {
        $out = [];
        foreach ([...$keys, ...array_keys($extra)] as $key) {
            $out[$key] = $value[$key] ?? ($extra[$key] ?? '');
        }

        return $out;
    }
}
