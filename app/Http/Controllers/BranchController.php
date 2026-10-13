<?php

namespace App\Http\Controllers;

use App\Http\Requests\BranchRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

/** Branches of the signed-in user's company. The route group requires `branches.manage`. */
class BranchController extends Controller
{
    /** @return Builder<Branch> */
    private function withCounts(): Builder
    {
        return Branch::withCount(['employees', 'employees as active_count' => fn ($q) => $q->where('status', 'active')])->orderBy('id');
    }

    public function index(): JsonResponse
    {
        return BranchResource::collection($this->withCounts()->get())->response();
    }

    /**
     * Headcount per branch for the Consolidated Report tab.
     * shortcut: gross and net pay of the latest payroll run are null until payroll runs exist (P10).
     */
    public function summaries(): JsonResponse
    {
        $rows = $this->withCounts()->get()->map(fn (Branch $b) => [
            'branch' => new BranchResource($b),
            'headcount' => $b->employees_count,
            'active_count' => $b->active_count,
            'gross_pay' => null,
            'net_pay' => null,
        ]);

        return response()->json(['data' => $rows]);
    }

    public function store(BranchRequest $request): JsonResponse
    {
        $branch = Branch::create([...$request->validated(), 'company_id' => $request->user()->company_id]);
        ActivityLogger::log(module: 'Branches', action: 'Added', title: 'Branch', description: $branch->name, subject: $branch);

        return (new BranchResource($this->withCounts()->findOrFail($branch->id)))->response()->setStatusCode(201);
    }

    public function update(BranchRequest $request, Branch $branch): JsonResponse
    {
        $branch->update($request->validated());
        ActivityLogger::log(module: 'Branches', action: 'Updated', title: 'Branch', description: $branch->name, subject: $branch);

        return (new BranchResource($this->withCounts()->findOrFail($branch->id)))->response();
    }

    /** A branch that still has employees cannot be removed; move them first. */
    public function destroy(Branch $branch): JsonResponse
    {
        if ($branch->employees()->exists()) {
            return response()->json(['message' => "{$branch->name} still has employees. Move them to another branch first."], 422);
        }

        $branch->delete();
        ActivityLogger::log(module: 'Branches', action: 'Deleted', title: 'Branch', description: $branch->name, subject: $branch);

        return response()->json(null, 204);
    }
}
