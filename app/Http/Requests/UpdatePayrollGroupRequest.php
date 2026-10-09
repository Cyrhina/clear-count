<?php

namespace App\Http\Requests;

class UpdatePayrollGroupRequest extends PayrollGroupRequest
{
    protected function ignoredGroupId(): ?int
    {
        return $this->route('payrollGroup')?->id;
    }
}
