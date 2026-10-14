<?php

namespace App\Support;

use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/** Reads `config/plans.php`: what a company's plan includes, what it costs and how much of it the company uses. */
final class Plans
{
    public static function tiers(): array
    {
        return config('plans.tiers');
    }

    public static function order(): array
    {
        return config('plans.order');
    }

    /** @return array<string, mixed> */
    public static function tier(string $tier): array
    {
        return config("plans.tiers.{$tier}") ?? config('plans.tiers.basic');
    }

    public static function has(Company $company, string $feature): bool
    {
        return in_array($feature, self::tier($company->plan_tier)['features'], true);
    }

    /** The lowest plan that includes the feature. */
    public static function minimumTierFor(string $feature): string
    {
        foreach (self::order() as $tier) {
            if (in_array($feature, self::tier($tier)['features'], true)) {
                return $tier;
            }
        }

        return 'enterprise';
    }

    /** Employees that are not archived, and the admin and manager accounts: what the plan limits count. */
    public static function usage(Company $company): array
    {
        return [
            'employees' => Employee::withoutGlobalScopes()->where('company_id', $company->id)->where('employment->status', '!=', 'archived')->count(),
            // Seats are the admin and manager accounts: the employees' self-service logins are free.
            'users' => User::where('company_id', $company->id)->where('is_active', true)->whereDoesntHave('roles', fn ($r) => $r->where('name', 'employee'))->count(),
        ];
    }

    /** Base price plus the add-on for each employee above the plan's limit. Null for a plan that is quoted by hand. */
    public static function quote(string $tier, int $employees): ?float
    {
        $plan = self::tier($tier);
        if ($plan['monthly_price'] === null || $plan['employee_limit'] === null || $plan['extra_employee_price'] === null) {
            return null;
        }

        return (float) ($plan['monthly_price'] + max(0, $employees - $plan['employee_limit']) * $plan['extra_employee_price']);
    }

    /** Refuses to add `$count` more active user accounts past the plan's seat limit. */
    public static function assertSeats(Company $company, int $count = 1): void
    {
        $limit = self::tier($company->plan_tier)['user_limit'];
        if ($limit !== null && self::usage($company)['users'] + $count > $limit) {
            $label = self::tier($company->plan_tier)['label'];
            throw ValidationException::withMessages(['users' => "The {$label} plan includes {$limit} user accounts. Upgrade the plan or deactivate an account first."]);
        }
    }
}
