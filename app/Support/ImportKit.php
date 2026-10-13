<?php

namespace App\Support;

use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Row-by-row import for any list the browser parses (CSV, spreadsheet) and posts as JSON. Each row is validated with the
 * caller's rules, then checked by the caller for things only the database knows (duplicates ...). A dry run stops there and
 * reports every row; a real run also commits the rows that passed, all inside one transaction.
 */
final class ImportKit
{
    public const MAX_ROWS = 500;

    /**
     * @param  list<array<string, mixed>>  $rows  each may carry a `line` (the row number in the file) for the report
     * @param  Closure(array<string, mixed>): array<string, mixed>  $rules  validation rules of one row
     * @param  Closure(array<string, mixed>): list<string>  $check  extra errors for a row that passed the rules
     * @param  Closure(array<string, mixed>): mixed  $commit  stores one valid row
     * @return array{rows: list<array{line: int, ok: bool, errors: list<string>}>, created: int, skipped: int}
     */
    public static function run(array $rows, Closure $rules, Closure $check, Closure $commit, bool $dryRun): array
    {
        $report = [];
        $valid = [];

        foreach (array_values($rows) as $i => $row) {
            $validator = Validator::make($row, $rules($row));
            $errors = $validator->fails() ? collect($validator->errors()->all())->unique()->values()->all() : $check($validator->validated());
            $report[] = ['line' => (int) ($row['line'] ?? $i + 1), 'ok' => $errors === [], 'errors' => $errors];
            if ($errors === []) {
                $valid[] = $validator->validated();
            }
        }

        if (! $dryRun) {
            DB::transaction(fn () => array_map($commit, $valid));
        }

        return ['rows' => $report, 'created' => $dryRun ? 0 : count($valid), 'skipped' => count($rows) - count($valid)];
    }
}
