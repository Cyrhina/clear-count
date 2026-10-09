<?php

namespace App\Enums;

enum CompensationType: string
{
    case MonthlyRate = 'monthly_rate';
    case DailyRate = 'daily_rate';
    case HourlyRate = 'hourly_rate';
    case PieceRate = 'piece_rate';

    public function label(): string
    {
        return match ($this) {
            self::MonthlyRate => 'Monthly Rate',
            self::DailyRate => 'Daily Rate',
            self::HourlyRate => 'Hourly Rate',
            self::PieceRate => 'Piece Rate',
        };
    }
}
