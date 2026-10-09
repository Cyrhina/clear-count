<?php

namespace App\Http\Requests;

class StorePayrollGroupRequest extends PayrollGroupRequest
{
    protected function ignoredGroupId(): ?int
    {
        return null;
    }
}
