<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyInfoRequest extends FormRequest
{
    public const COMPANY_TYPES = ['corporation', 'partnership', 'sole_proprietorship', 'other'];

    // Philippine registration formats. Dashes are optional because people type them both ways.
    private const TIN = '/^\d{3}-?\d{3}-?\d{3}(-?\d{3,5})?$/';   // 123-456-789 or 123-456-789-000 (branch code)
    private const SSS = '/^\d{2}-?\d{7}-?\d$/';                  // 03-9876543-2
    private const PHILHEALTH = '/^\d{2}-?\d{9}-?\d$/';           // 13-000123456-7
    private const PAGIBIG = '/^\d{4}-?\d{4}-?\d{4}$/';           // 1234-5678-9012
    private const PHONE = '/^[0-9+()\-\s.]{7,25}$/';
    private const ZIP = '/^\d{4}$/';                             // Philippine postal codes are 4 digits

    public function authorize(): bool
    {
        return $this->user()->can('settings.company.edit');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'trade_name' => ['nullable', 'string', 'max:255'],
            'company_type' => ['required', Rule::in(self::COMPANY_TYPES)],
            'industry' => ['nullable', 'string', 'max:120'],
            'website' => ['nullable', 'url:http,https', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'regex:'.self::PHONE],
            'description' => ['nullable', 'string', 'max:2000'],
            'use_logo_colors' => ['sometimes', 'boolean'],
            'brand_color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],

            // Registrations
            'sec_number' => ['nullable', 'string', 'max:30'],
            'dti_number' => ['nullable', 'string', 'max:30'],
            'tin' => ['nullable', 'regex:'.self::TIN],
            'rdo_code' => ['nullable', 'string', 'max:60'],
            'philhealth_pen' => ['nullable', 'regex:'.self::PHILHEALTH],
            'sss_number' => ['nullable', 'regex:'.self::SSS],
            'pagibig_hdmf' => ['nullable', 'regex:'.self::PAGIBIG],
            'business_permit_number' => ['nullable', 'string', 'max:60'],

            'same_as_registered' => ['sometimes', 'boolean'],

            // Logo: optional here so one multipart request can save the form and the file together.
            'logo' => ['sometimes', 'nullable', ...self::logoRules()],
            'remove_logo' => ['sometimes', 'boolean'],
        ];

        foreach (['registered_address', 'office_address'] as $address) {
            $rules[$address] = ['nullable', 'array'];
            foreach (['building_unit', 'street', 'barangay', 'city', 'province', 'region', 'country'] as $field) {
                $rules["{$address}.{$field}"] = ['nullable', 'string', 'max:150'];
            }
            $rules["{$address}.zip_code"] = ['nullable', 'regex:'.self::ZIP];
        }

        foreach (['primary_contact', 'payroll_contact', 'hr_contact'] as $contact) {
            $rules[$contact] = ['nullable', 'array'];
            $rules["{$contact}.name"] = ['nullable', 'string', 'max:150'];
            $rules["{$contact}.position"] = ['nullable', 'string', 'max:150'];
            $rules["{$contact}.email"] = ['nullable', 'email:rfc', 'max:255'];
            $rules["{$contact}.contact_number"] = ['nullable', 'regex:'.self::PHONE];
        }

        return $rules;
    }

    /**
     * Rules shared by the update endpoint and the logo-only endpoint.
     *
     * @return array<int, mixed>
     */
    public static function logoRules(): array
    {
        return [
            'file',
            // Raster formats only: unlike SVG they cannot carry script, and logos are served from our own origin.
            'mimes:png,jpg,jpeg,webp',
            'max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'tin.regex' => 'The BIR TIN must look like 123-456-789 or 123-456-789-000.',
            'sss_number.regex' => 'The SSS employer number must look like 03-9876543-2.',
            'philhealth_pen.regex' => 'The PhilHealth employer number (PEN) must look like 13-000123456-7.',
            'pagibig_hdmf.regex' => 'The Pag-IBIG employer number must look like 1234-5678-9012.',
            '*.zip_code.regex' => 'The ZIP code must be 4 digits.',
        ];
    }
}
