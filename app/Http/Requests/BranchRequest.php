<?php

namespace App\Http\Requests;

use App\Models\Branch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Creates and updates a branch. */
class BranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('branches.manage');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $current = $this->route('branch');

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('branches', 'name')->where('company_id', $this->user()->company_id)->ignore($current instanceof Branch ? $current->id : null)],
            'code' => ['nullable', 'string', 'max:40'],
            'is_head_office' => ['sometimes', 'boolean'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'contact_number' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'opened_date' => ['nullable', 'date'],
        ];
    }
}
