<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A company's payment for a plan upgrade, waiting for the super admin to confirm it (status pending | approved | rejected).
 * The proof of payment is a private file: it is only served through the authorized proof route.
 */
#[Hidden(['proof_path'])]
#[Fillable(['company_id', 'requested_by', 'from_tier', 'to_tier', 'amount', 'payment_reference', 'receipt_reference', 'proof_path', 'terms_accepted_at', 'status', 'decided_by', 'decided_at', 'decision_remarks'])]
class SubscriptionPayment extends Model
{
    use BelongsToCompany;

    protected $attributes = ['status' => 'pending'];

    protected function casts(): array
    {
        return ['amount' => 'float', 'terms_accepted_at' => 'datetime', 'decided_at' => 'datetime'];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
