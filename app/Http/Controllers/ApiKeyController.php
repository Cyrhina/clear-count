<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * API keys of the company: Sanctum tokens, hashed in the database and shown once when made. A key acts as the user who made it,
 * limited to the abilities picked here, so it can never do more than that user can. The route group requires `integrations.manage`.
 */
class ApiKeyController extends Controller
{
    /** Ability of a key => the capability the creator needs to hand it out (and that the read route itself requires). */
    public const ABILITIES = [
        'employees.read' => 'employees.view',
        'attendance.read' => 'attendance.view',
        'payroll.read' => 'payroll.view',
    ];

    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->keys($request)->get()->map(fn (PersonalAccessToken $t) => $this->summary($t))->values()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:80'],
            'abilities' => ['required', 'array', 'min:1'],
            'abilities.*' => ['string', Rule::in(array_keys(self::ABILITIES))],
            'expires_in_days' => ['nullable', 'integer', Rule::in([30, 90, 365])],
        ]);

        $user = $request->user();
        foreach ($data['abilities'] as $ability) {
            if (! $user->can(self::ABILITIES[$ability])) {
                throw ValidationException::withMessages(['abilities' => 'You cannot give a key access that you do not have yourself.']);
            }
        }

        $token = $user->createToken($data['label'], array_values(array_unique($data['abilities'])), isset($data['expires_in_days']) ? now()->addDays($data['expires_in_days']) : null);
        ActivityLogger::log(module: 'Integrations', action: 'Created', title: 'API key', description: $data['label']);

        return response()->json(['data' => $this->summary($token->accessToken->load('tokenable')), 'token' => $token->plainTextToken], 201);
    }

    public function destroy(Request $request, int $key): JsonResponse
    {
        $token = $this->keys($request)->findOrFail($key);
        $token->delete();
        ActivityLogger::log(module: 'Integrations', action: 'Revoked', title: 'API key', description: $token->name);

        return response()->json(['message' => 'API key revoked.']);
    }

    /** Keys made by users of the signed-in company. */
    private function keys(Request $request)
    {
        return PersonalAccessToken::query()->with('tokenable')->whereHasMorph('tokenable', [User::class], fn ($q) => $q->where('company_id', $request->user()->company_id))->latest('id');
    }

    /** @return array<string, mixed> */
    private function summary(PersonalAccessToken $t): array
    {
        return [
            'id' => $t->id, 'label' => $t->name, 'abilities' => $t->abilities, 'created_by' => $t->tokenable?->name,
            'created_at' => $t->created_at?->toIso8601String(), 'last_used_at' => $t->last_used_at?->toIso8601String(),
            'expires_at' => $t->expires_at?->toIso8601String(), 'expired' => $t->expires_at?->isPast() ?? false,
        ];
    }
}
