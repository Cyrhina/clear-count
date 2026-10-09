<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCompanyInfoRequest;
use App\Http\Resources\CompanyInfoResource;
use App\Models\Company;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Company Info tab of Company & Payroll Settings. Always works on the signed-in user's own company;
 * the route group requires `settings.company.edit`.
 */
class CompanyInfoController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return (new CompanyInfoResource($this->company($request)))->response();
    }

    /** Saves the form. Send multipart/form-data (POST) to include a `logo` file, or JSON (PUT) without one. */
    public function update(UpdateCompanyInfoRequest $request): JsonResponse
    {
        $company = $this->company($request);
        $data = $request->safe()->only(Company::INFO_FIELDS);

        // "Same as registered": the server is the source of truth, so the two can never drift apart.
        if ($data['same_as_registered'] ?? $company->same_as_registered) {
            $data['same_as_registered'] = true;
            $data['office_address'] = $data['registered_address'] ?? $company->registered_address;
        }

        $oldLogo = $company->logo_path;
        $newLogo = $request->file('logo') ? $this->storeLogo($request->file('logo')) : null;

        DB::transaction(function () use ($company, $data, $newLogo, $request) {
            $company->fill($data);
            if ($newLogo) {
                $company->logo_path = $newLogo;
            } elseif ($request->boolean('remove_logo')) {
                $company->logo_path = null;
            }
            $company->save();
        });

        // Only after the row is saved: a failed save must not leave the company without its old logo.
        if ($oldLogo && $oldLogo !== $company->logo_path) {
            Storage::disk('public')->delete($oldLogo);
        }

        ActivityLogger::log(module: 'Company Settings', action: 'Updated', title: 'Company information', description: $company->name, subject: $company);

        return (new CompanyInfoResource($company->fresh()))->response();
    }

    /** Logo only: replaces the current logo and deletes the old file. */
    public function uploadLogo(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('settings.company.edit'), 403);
        $request->validate(['logo' => ['required', ...UpdateCompanyInfoRequest::logoRules()]]);

        $company = $this->company($request);
        $old = $company->logo_path;
        $company->forceFill(['logo_path' => $this->storeLogo($request->file('logo'))])->save();
        if ($old) {
            Storage::disk('public')->delete($old);
        }

        ActivityLogger::log(module: 'Company Settings', action: 'Updated', title: 'Company logo', description: $company->name, subject: $company);

        return (new CompanyInfoResource($company->fresh()))->response();
    }

    public function removeLogo(Request $request): JsonResponse
    {
        $company = $this->company($request);
        if ($company->logo_path) {
            Storage::disk('public')->delete($company->logo_path);
            $company->forceFill(['logo_path' => null])->save();
            ActivityLogger::log(module: 'Company Settings', action: 'Updated', title: 'Company logo removed', description: $company->name, subject: $company);
        }

        return (new CompanyInfoResource($company))->response();
    }

    private function company(Request $request): Company
    {
        return $request->user()->company ?? abort(404, 'This account is not linked to a company.');
    }

    /** Files get a random name (never the client's), so uploads cannot overwrite each other or smuggle a path. */
    private function storeLogo(UploadedFile $file): string
    {
        return $file->store('company-logos', 'public');
    }
}
