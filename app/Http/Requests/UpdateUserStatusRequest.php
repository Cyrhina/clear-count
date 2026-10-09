<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('toggleStatus', $this->route('user'));
    }

    /**
     * Optional: send `status` to set it explicitly; omit it to flip the current one.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return ['status' => ['sometimes', Rule::in(['active', 'inactive'])]];
    }
}
