<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompensationTypeRequest;
use App\Http\Resources\CompensationTypeResource;
use App\Models\CompensationType;
use App\Support\ActivityLogger;
use App\Support\PayrollDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Compensation Types of Payroll Settings: the named pay schemes a payroll group can default to. Company-scoped by the
 * model's global scope; the route group requires `settings.payroll.edit`. There is no delete: a type is switched off
 * with `is_active` so groups that point at it keep working.
 */
class CompensationTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        PayrollDefaults::ensureCompensationTypes($request->user()->company_id);

        return CompensationTypeResource::collection(CompensationType::orderBy('id')->get())->response();
    }

    public function store(CompensationTypeRequest $request): JsonResponse
    {
        $type = CompensationType::create([...$request->typeData(), 'company_id' => $request->user()->company_id]);
        ActivityLogger::log(module: 'Payroll', action: 'Added', title: 'Compensation type', description: $type->name, subject: $type);

        return (new CompensationTypeResource($type))->response()->setStatusCode(201);
    }

    public function update(CompensationTypeRequest $request, CompensationType $compensationType): JsonResponse
    {
        $compensationType->update($request->typeData());
        ActivityLogger::log(module: 'Payroll', action: 'Updated', title: 'Compensation type', description: $compensationType->name, subject: $compensationType);

        return (new CompensationTypeResource($compensationType))->response();
    }
}
