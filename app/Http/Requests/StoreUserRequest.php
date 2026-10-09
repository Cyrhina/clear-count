<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')],
            'role' => ['required', Rule::in(Roles::names())],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
            // Only a super admin may name a company other than their own (enforced in the controller).
            'company_id' => ['sometimes', 'nullable', Rule::exists('companies', 'id')],
        ];
    }

    /** Role escalation guard: Rule::in only checks the role exists, the policy checks the actor may grant it. */
    public function after(): array
    {
        return [
            function ($validator): void {
                if (! $validator->errors()->has('role') && ! $this->user()->can('assignRole', [User::class, $this->input('role')])) {
                    $validator->errors()->add('role', 'You cannot assign the Super Admin role.');
                }
            },
        ];
    }
}
