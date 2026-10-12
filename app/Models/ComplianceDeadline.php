<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A government filing or remittance deadline, or a custom reminder, shown on the dashboard's Reminders card.
 *
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string $category
 * @property string $description
 * @property string $frequency
 * @property int|null $due_day
 * @property int|null $due_month
 * @property Carbon|null $due_date
 * @property int $remind_days_before
 * @property bool $enabled
 * @property string|null $link
 * @property bool $is_custom
 */
#[Fillable(['company_id', 'name', 'category', 'description', 'frequency', 'due_day', 'due_month', 'due_date', 'remind_days_before', 'enabled', 'link', 'is_custom'])]
class ComplianceDeadline extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['due_date' => 'date:Y-m-d', 'enabled' => 'boolean', 'is_custom' => 'boolean'];
    }
}
