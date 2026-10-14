<?php

namespace App\Payroll;

/** Rounding as the browser engine does it (JavaScript `Math.round`: halves go up), so the two engines agree on every centavo. */
final class Num
{
    public static function round0(float $n): float
    {
        return floor($n + 0.5);
    }

    public static function round2(float $n): float
    {
        return floor($n * 100 + 0.5) / 100;
    }
}
