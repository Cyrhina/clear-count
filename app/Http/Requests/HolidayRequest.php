<?php

namespace App\Http\Requests;

use App\Enums\HolidayScope;
use App\Enums\HolidayType;
use App\Models\Holiday;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Shared rules for adding and editing a holiday. */
abstract class HolidayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.company.edit');
    }

    /** The holiday being edited, if any, so it does not conflict with itself. */
    abstract protected function ignoredHolidayId(): ?int;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'date' => ['required', 'date_format:Y-m-d'],
            'type' => ['required', Rule::enum(HolidayType::class)],
            'scope' => ['sometimes', Rule::enum(HolidayScope::class)],
            // Branches this holiday applies to; only the company's own branches are accepted.
            'branch_ids' => ['nullable', 'array', 'max:200'],
            'branch_ids.*' => ['integer', 'distinct', Rule::exists('branches', 'id')->where('company_id', $this->user()->company_id)],
            'description' => ['nullable', 'string', 'max:1000'],
            // Explicitly allow a second holiday on a date that is already taken.
            'allow_overlap' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<int, \Closure(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $scope = HolidayScope::tryFrom((string) $this->input('scope', 'national'));
            $branchIds = array_map('intval', $this->input('branch_ids') ?? []);

            if ($scope === HolidayScope::BRANCH_SPECIFIC && $branchIds === []) {
                $validator->errors()->add('branch_ids', 'Choose at least one branch for a branch-specific holiday.');

                return;
            }
            // A national holiday covers everyone, so a branch list on it would only mislead.
            $covers = $scope === HolidayScope::NATIONAL ? [] : $branchIds;

            if (! $this->boolean('allow_overlap') && ($clash = $this->clashingHoliday($covers))) {
                $validator->errors()->add('date', "\"{$clash->name}\" is already on {$clash->date->format('M j, Y')} for these branches. Edit it, or set allow_overlap to add another.");
            }
        }];
    }

    /** What the controller stores: no branch list on national holidays. @return array<string, mixed> */
    public function holidayData(): array
    {
        $data = $this->safe()->except('allow_overlap');
        $scope = HolidayScope::from($data['scope'] ?? 'national');
        $data['scope'] = $scope->value;
        $data['branch_ids'] = $scope === HolidayScope::NATIONAL ? null : array_map('intval', $data['branch_ids'] ?? []);

        return $data;
    }

    /**
     * Another holiday of this company on the same date that applies to any of the same branches.
     * An empty list means "all branches", on either side.
     *
     * @param  list<int>  $covers
     */
    private function clashingHoliday(array $covers): ?Holiday
    {
        return Holiday::activeForCompany($this->user()->company_id)
            ->whereDate('date', $this->input('date'))
            ->when($this->ignoredHolidayId(), fn ($q, $id) => $q->where('id', '!=', $id))
            ->get()
            ->first(fn (Holiday $other) => $covers === [] || empty($other->branch_ids) || array_intersect($covers, $other->branch_ids) !== []);
    }
}
