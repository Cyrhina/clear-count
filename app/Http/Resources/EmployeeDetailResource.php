<?php

namespace App\Http\Resources;

use App\Http\Controllers\EmployeeDocumentController;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * One employee with everything the profile page shows: the change history (from the activity log) and, for people who may
 * see pay, the compensation history.
 *
 * @mixin Employee
 */
class EmployeeDetailResource extends EmployeeResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'history' => $this->history(),
            // The sign-in account linked to this employee, for people who manage accounts.
            $this->mergeWhen($request->user()->can('users.manage'), fn () => ['account' => User::where('employee_id', $this->id)->first(['id', 'email', 'is_active'])?->only(['id', 'email', 'is_active'])]),
            $this->mergeWhen(self::seesPay($request, $this->id), fn () => [
                'compensation_history' => $this->compensationHistory(),
                'documents' => $this->documents->map(fn ($d) => EmployeeDocumentController::present($d))->all(),
            ]),
        ];
    }

    /** @return list<array<string, mixed>> */
    private function history(): array
    {
        return ActivityLog::where('subject_type', $this->resource->getMorphClass())->where('subject_id', $this->id)
            ->latest()->latest('id')->limit(100)->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'timestamp' => $log->created_at->toIso8601String(),
                'actor' => $log->actor,
                'action' => trim("{$log->title} ".strtolower($log->action)),
                'details' => $log->description,
            ])->all();
    }

    /** @return list<array<string, mixed>> */
    private function compensationHistory(): array
    {
        $rows = $this->compensations()->with('changedBy')->get();

        // Newest first; each entry's previous salary is the next row down.
        return $rows->values()->map(fn ($row, int $i) => [
            'id' => $row->id,
            'effective_date' => $row->effective_from->toDateString(),
            'type' => $row->reason,
            'previous_salary' => isset($rows[$i + 1]) ? (float) $rows[$i + 1]->basic_rate : null,
            'new_salary' => (float) $row->basic_rate,
            'approved_by' => $row->changedBy?->name ?? '—',
        ])->all();
    }
}
