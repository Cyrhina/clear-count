<?php

namespace App\Http\Requests;

use App\Models\ActivityLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class ActivityLogFilterRequest extends FormRequest
{
    public const RANGES = ['today', '7_days', '30_days', 'custom'];

    public function authorize(): bool
    {
        return $this->user()->can('users.manage');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'date_range' => ['nullable', Rule::in(self::RANGES)],
            'start_date' => ['required_if:date_range,custom', 'nullable', 'date'],
            'end_date' => ['required_if:date_range,custom', 'nullable', 'date', 'after_or_equal:start_date'],
            'module' => ['nullable', 'string', 'max:50'],
            'action' => ['nullable', 'string', 'max:50'],
            // Only users of the same company can be filtered on (super admins: any).
            'user_id' => ['nullable', Rule::exists('users', 'id')->when(! $this->user()->hasRole('super_admin'), fn ($rule) => $rule->where('company_id', $companyId))],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /** The [from, to] window for the chosen preset; both null means no date limit. @return array{0: ?Carbon, 1: ?Carbon} */
    public function window(): array
    {
        return match ($this->input('date_range', '30_days')) {
            'today' => [now(), now()],
            '7_days' => [now()->subDays(6), now()],
            'custom' => [Carbon::parse($this->input('start_date')), Carbon::parse($this->input('end_date'))],
            default => [now()->subDays(29), now()],
        };
    }

    public function perPage(): int
    {
        return (int) $this->input('per_page', 10);
    }
}
