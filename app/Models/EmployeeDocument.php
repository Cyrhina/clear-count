<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A file on an employee's record (contract, ID copy ...), kept on the private disk.
 *
 * @property int $id
 * @property int $employee_id
 * @property string $name
 * @property string $file_type
 * @property int $size
 * @property string $path
 */
#[Fillable(['company_id', 'employee_id', 'name', 'file_type', 'size', 'path', 'uploaded_by'])]
class EmployeeDocument extends Model
{
    use BelongsToCompany;

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
