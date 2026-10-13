<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use App\Support\LeaveLedger;
use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Nested sections (personal, employment, ...) are JSON and mirror frontend-ops `Employee`.
 * `name`, `department`, `status` are denormalised from them for search/filter.
 */
#[Fillable(['company_id', 'branch_id', 'employee_number', 'name', 'department', 'status', 'personal', 'employment', 'compensation', 'benefits', 'government', 'bank'])]
class Employee extends Model
{
    /** @use HasFactory<EmployeeFactory> */
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return [
            'personal' => 'array',
            'employment' => 'array',
            'compensation' => 'array',
            'benefits' => 'array',
            'government' => 'array',
            'bank' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Employee $employee): void {
            $employee->name = trim(($employee->personal['firstName'] ?? '').' '.($employee->personal['lastName'] ?? ''));
            $employee->department = $employee->employment['department'] ?? null;
            $employee->status = $employee->employment['status'] ?? 'active';
        });
    }

    public function payrollGroup(): BelongsTo
    {
        return $this->belongsTo(PayrollGroup::class);
    }

    /** Set by `preloadLeaveCredits` so a list does not query the ledger once per employee. @var array<string, float>|null */
    public ?array $leaveCredits = null;

    /** Fills `leaveCredits` for many employees with one query. @param  iterable<Employee>  $employees */
    public static function preloadLeaveCredits(iterable $employees): void
    {
        $employees = collect($employees);
        $balances = LeaveLedger::balancesFor($employees->pluck('id')->all());
        $names = LeaveType::pluck('name', 'id');
        foreach ($employees as $employee) {
            $employee->leaveCredits = collect($balances[$employee->id] ?? [])->mapWithKeys(fn ($days, $typeId) => [$names[$typeId] ?? "#{$typeId}" => $days])->all();
        }
    }

    /** Leave credits by leave type name, from the ledger (the old `benefits.leaveCreditsByType` is now derived). @return array<string, float> */
    public function leaveCreditsByType(): array
    {
        if ($this->leaveCredits === null) {
            self::preloadLeaveCredits([$this]);
        }

        return $this->leaveCredits;
    }

    /** The default work schedule; the roster overrides it for single days (see ScheduleResolver). */
    public function workSchedule(): BelongsTo
    {
        return $this->belongsTo(WorkSchedule::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /** Files on the record (contracts, ID copies ...). */
    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class)->latest();
    }

    /** Pay history, newest first. */
    public function compensations(): HasMany
    {
        return $this->hasMany(EmployeeCompensation::class)->orderByDesc('effective_from')->orderByDesc('id');
    }
}
