<?php

namespace App\Providers;

use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureLoginRedirect();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        // A deactivated user gets the same "credentials do not match" answer as a wrong password, and no session at all.
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->input(Fortify::username()))->first();

            return $user && $user->is_active && Hash::check((string) $request->input('password'), $user->password) ? $user : null;
        });
    }

    /**
     * Employees only hold `ess.view`, so /dashboard would 403 them: land them on ESS instead.
     */
    private function configureLoginRedirect(): void
    {
        $this->app->singleton(LoginResponse::class, fn () => new class implements LoginResponse
        {
            public function toResponse($request)
            {
                if ($request->wantsJson()) {
                    return new JsonResponse(['two_factor' => false]);
                }

                $landing = $request->user()->can('dashboard.view') ? route('dashboard') : route('ess.home');

                return redirect()->intended($landing);
            }
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        // Login / forgot / reset use the frontend-ops pages (rendered through the ops root view).
        Fortify::loginView(function (Request $request) {
            Inertia::setRootView('ops');

            return Inertia::render('ops', [
                'page' => 'auth.login',
                'canResetPassword' => Features::enabled(Features::resetPasswords()),
                'status' => $request->session()->get('status'),
            ]);
        });

        Fortify::resetPasswordView(function (Request $request) {
            Inertia::setRootView('ops');

            return Inertia::render('ops', [
                'page' => 'auth.reset',
                'email' => $request->email,
                'token' => $request->route('token'),
            ]);
        });

        Fortify::requestPasswordResetLinkView(function (Request $request) {
            Inertia::setRootView('ops');

            return Inertia::render('ops', [
                'page' => 'auth.forgot',
                'status' => $request->session()->get('status'),
            ]);
        });

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

    }
}
