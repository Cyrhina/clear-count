<?php

namespace App\Http\Requests;

class UpdateHolidayRequest extends HolidayRequest
{
    protected function ignoredHolidayId(): ?int
    {
        return $this->route('holiday')?->id;
    }
}
