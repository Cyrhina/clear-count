<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One event sent (or being sent) to one endpoint, with how it went. status: pending | retrying | success | failed. */
#[Fillable(['company_id', 'webhook_endpoint_id', 'event', 'payload', 'status', 'attempts', 'response_code', 'error', 'delivered_at'])]
class WebhookDelivery extends Model
{
    use BelongsToCompany;

    protected $attributes = ['status' => 'pending', 'attempts' => 0];

    protected function casts(): array
    {
        return ['payload' => 'array', 'delivered_at' => 'datetime'];
    }

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'webhook_endpoint_id');
    }
}
