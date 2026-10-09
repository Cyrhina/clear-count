<?php

namespace App\Http\Requests;

class StoreHolidayRequest extends HolidayRequest
{
    protected function ignoredHolidayId(): ?int
    {
        return null;
    }
}
