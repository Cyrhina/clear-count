<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('updateRole', $this->route('user'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return ['role' => ['required', Rule::in(Roles::names())]];
    }

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
