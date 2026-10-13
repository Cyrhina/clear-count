<?php

namespace App\Support;

use App\Exceptions\ConflictException;
use App\Models\User;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * The shared decide step of every request that waits for approval (attendance adjustments, WFH, leave, overtime, work logs).
 * The model needs `status`, `decided_by` and `decided_at`. Only a pending request can be decided, and the row is locked so
 * two people deciding at once cannot both win; the second gets a ConflictException.
 */
final class Approval
{
    /**
     * @param  Closure(Model): void|null  $apply  runs in the same transaction when the decision is `approved`
     */
    public static function decide(Model $request, string $decision, User $by, ?Closure $apply = null): void
    {
        $decided = DB::transaction(function () use ($request, $decision, $by, $apply): Model {
            $current = $request->newQuery()->lockForUpdate()->find($request->getKey());
            if (! $current || $current->status !== 'pending') {
                throw new ConflictException('This request was already decided.');
            }

            $current->forceFill(['status' => $decision, 'decided_by' => $by->id, 'decided_at' => now()])->save();
            if ($decision === 'approved' && $apply) {
                $apply($current);
            }

            return $current;
        });

        // After the commit, so a rolled-back approval never sends one.
        Notifier::decided($decided);
    }
}
