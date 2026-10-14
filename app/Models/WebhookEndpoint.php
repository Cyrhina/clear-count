<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A URL a company wants told about events. The signing secret is encrypted and never serialized. */
#[Hidden(['secret'])]
#[Fillable(['company_id', 'created_by', 'url', 'events', 'secret', 'is_active'])]
class WebhookEndpoint extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['events' => 'array', 'secret' => 'encrypted', 'is_active' => 'boolean'];
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }
}
