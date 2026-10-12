<?php

namespace App\Http\Requests;

use App\Enums\CompensationKind;
use App\Models\CompensationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Creates and updates a compensation type. Which `config` fields are required follows the kind. */
class CompensationTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.payroll.edit');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $current = $this->route('compensationType');
        $rateKinds = implode(',', CompensationKind::rateKinds());

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('compensation_types', 'name')->where('company_id', $this->user()->company_id)->ignore($current instanceof CompensationType ? $current->id : null)],
            'kind' => ['required', Rule::enum(CompensationKind::class)],
            'is_active' => ['sometimes', 'boolean'],
            'config' => ['required', 'array'],
            // validated() keeps only keys that have a rule, so every key of config is listed here.
            'config.basic_rate' => ["required_if:kind,{$rateKinds}", 'nullable', 'numeric', 'min:0', 'max:100000000'],
            'config.output_rates' => ['required_if:kind,output_based', 'nullable', 'array', 'min:1', 'max:50'],
            'config.output_rates.*.label' => ['required', 'string', 'max:120'],
            'config.output_rates.*.unit' => ['required', 'string', 'max:40'],
            'config.output_rates.*.rate_per_unit' => ['required', 'numeric', 'min:0', 'max:100000000'],
            'config.output_min' => ['nullable', 'numeric', 'min:0'],
            'config.output_max' => ['nullable', 'numeric', 'min:0', 'gte:config.output_min'],
            'config.commission_type' => ['required_if:kind,commission_based', 'nullable', Rule::in(['percentage', 'fixed'])],
            'config.commission_value' => ['required_if:kind,commission_based', 'nullable', 'numeric', 'min:0', 'max:100000000'],
            'config.commission_basis' => ['nullable', 'string', 'max:120'],
            'config.mixed_components' => ['nullable', 'array', 'max:20'],
            'config.mixed_components.*' => ['string', 'max:120'],
        ];
    }

    /**
     * What the controller stores: only the config keys that belong to the chosen kind.
     *
     * @return array<string, mixed>
     */
    public function typeData(): array
    {
        $data = $this->validated();
        $kind = CompensationKind::from($data['kind']);
        $config = $data['config'];

        $data['config'] = match (true) {
            in_array($kind->value, CompensationKind::rateKinds(), true) => ['basic_rate' => $config['basic_rate']],
            $kind === CompensationKind::OutputBased => collect($config)->only(['output_rates', 'output_min', 'output_max'])->all(),
            $kind === CompensationKind::CommissionBased => collect($config)->only(['commission_type', 'commission_value', 'commission_basis'])->all(),
            default => collect($config)->only(['basic_rate', 'mixed_components'])->all(),
        };

        return $data;
    }
}
