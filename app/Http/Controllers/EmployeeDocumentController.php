<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Files on an employee's record. They sit on the private disk and are only reached through a temporary signed link,
 * which is handed out to people who may see the employee's pay and documents.
 */
class EmployeeDocumentController extends Controller
{
    private const DISK = 'local';

    public function store(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx'],
            'name' => ['nullable', 'string', 'max:150'],
        ]);
        $file = $data['file'];

        $document = $employee->documents()->create([
            'company_id' => $employee->company_id,
            'name' => $data['name'] ?? $file->getClientOriginalName(),
            'file_type' => strtolower($file->getClientOriginalExtension()),
            'size' => $file->getSize(),
            'path' => $file->store("employee-documents/{$employee->company_id}", self::DISK),
            'uploaded_by' => $request->user()->id,
        ]);
        ActivityLogger::log(module: 'Employees', action: 'Uploaded', title: 'Document', description: $document->name, subject: $employee);

        return response()->json(['data' => $this->present($document)], 201);
    }

    public function destroy(Employee $employee, EmployeeDocument $document): JsonResponse
    {
        abort_unless($document->employee_id === $employee->id, 404);

        Storage::disk(self::DISK)->delete($document->path);
        $document->delete();
        ActivityLogger::log(module: 'Employees', action: 'Deleted', title: 'Document', description: $document->name, subject: $employee);

        return response()->json(null, 204);
    }

    /** A link that works for five minutes. */
    public function link(Employee $employee, EmployeeDocument $document): JsonResponse
    {
        abort_unless($document->employee_id === $employee->id, 404);

        return response()->json(['data' => ['url' => URL::temporarySignedRoute('api.employee-documents.download', now()->addMinutes(5), ['document' => $document->id])]]);
    }

    /** The file itself. The `signed` middleware rejects a link that was altered or has expired; the employee must still be in the user's scope. */
    public function download(EmployeeDocument $document): StreamedResponse
    {
        abort_unless($document->employee()->exists(), 404);

        return Storage::disk(self::DISK)->download($document->path, "{$document->name}.{$document->file_type}");
    }

    /** @return array<string, mixed> */
    public static function present(EmployeeDocument $document): array
    {
        return ['id' => $document->id, 'name' => $document->name, 'file_type' => $document->file_type, 'size' => $document->size, 'uploaded_at' => $document->created_at->toIso8601String()];
    }
}
