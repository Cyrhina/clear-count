<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComplianceDeadlineRequest;
use App\Http\Resources\ComplianceDeadlineResource;
use App\Models\ComplianceDeadline;
use App\Support\ActivityLogger;
use App\Support\PayrollDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Government deadlines and custom reminders (Payroll Calendar tab, dashboard Reminders card). Company-scoped by the
 * model's global scope; the route group requires `settings.payroll.edit`. Built-in deadlines can be edited and switched off;
 * only custom reminders can be deleted.
 */
class ComplianceDeadlineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        PayrollDefaults::ensureComplianceDeadlines($request->user()->company_id);

        return ComplianceDeadlineResource::collection(ComplianceDeadline::orderBy('id')->get())->response();
    }

    public function store(ComplianceDeadlineRequest $request): JsonResponse
    {
        $deadline = ComplianceDeadline::create(['enabled' => true, ...$request->deadlineData(), 'company_id' => $request->user()->company_id, 'is_custom' => true]);
        ActivityLogger::log(module: 'Payroll', action: 'Added', title: 'Compliance reminder', description: $deadline->name, subject: $deadline);

        return (new ComplianceDeadlineResource($deadline))->response()->setStatusCode(201);
    }

    public function update(ComplianceDeadlineRequest $request, ComplianceDeadline $complianceDeadline): JsonResponse
    {
        $complianceDeadline->update($request->deadlineData());
        ActivityLogger::log(module: 'Payroll', action: 'Updated', title: 'Compliance reminder', description: $complianceDeadline->name, subject: $complianceDeadline);

        return (new ComplianceDeadlineResource($complianceDeadline))->response();
    }

    public function destroy(ComplianceDeadline $complianceDeadline): JsonResponse
    {
        if (! $complianceDeadline->is_custom) {
            return response()->json(['message' => 'Built-in government deadlines cannot be deleted, only switched off.'], 422);
        }
        $complianceDeadline->delete();
        ActivityLogger::log(module: 'Payroll', action: 'Deleted', title: 'Compliance reminder', description: $complianceDeadline->name);

        return response()->json(null, 204);
    }
}
