<?php

namespace App\Enums;

enum HolidayScope: string
{
    case NATIONAL = 'national';
    case REGIONAL = 'regional';
    case BRANCH_SPECIFIC = 'branch_specific';

    public function label(): string
    {
        return match ($this) {
            self::NATIONAL => 'National',
            self::REGIONAL => 'Regional',
            self::BRANCH_SPECIFIC => 'Branch-specific',
        };
    }
}
