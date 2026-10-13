<?php

namespace App\Http\Resources;

use App\Models\BranchDepartment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BranchDepartment */
class BranchDepartmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'branch_id' => $this->branch_id,
            'name' => $this->name,
            'supervisor_employee_id' => $this->supervisor_employee_id,
            'employee_count' => $this->employees()->count(),
        ];
    }
}
