<?php

namespace App\Providers;

use App\Models\Holiday;
use App\Support\MailLink;
use App\Support\Notifier;
use App\Support\Webhooks;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
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
        $this->configureDefaults();

        // {holiday} resolves only inside the signed-in user's own company, so another company's id is a plain 404.
        Route::bind('holiday', fn (string $id) => Holiday::activeForCompany((int) auth()->user()?->company_id)->findOrFail($id));

        // Invite / reset-access emails: at most 3 per person per 10 minutes (so one user's inbox cannot be spammed),
        // and 20 per minute per admin overall. Over the limit the API answers 429 with a Retry-After header.
        RateLimiter::for('user-mail', function (Request $request) {
            $target = $request->route('user');
            $targetId = $target instanceof Model ? $target->getKey() : $target;

            return [
                Limit::perMinutes(10, 3)->by('user-mail:target:'.$targetId),
                Limit::perMinute(20)->by('user-mail:actor:'.$request->user()?->id),
            ];
        });

        Notifier::watch();
        Webhooks::watch();

        // The public API: 60 calls a minute per key (per user when no key is sent, so a bad caller cannot hide behind the key limit).
        RateLimiter::for('api-keys', fn (Request $request) => Limit::perMinute(60)->by('api-key:'.($request->user()?->currentAccessToken()?->id ?? $request->ip())));

        // Feeds the "Last login" column and tells pending invites apart from active users.
        Event::listen(Login::class, fn (Login $event) => $event->user->forceFill(['last_login_at' => now()])->saveQuietly());
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // An N+1 query throws outside production, so it is caught by tests instead of by slow pages.
        Model::preventLazyLoading(! app()->isProduction());

        // Every environment: 8+ characters with upper and lowercase letters, a number and a special character
        // (same rules as the checklist on the reset-password page). Production also rejects leaked passwords.
        Password::defaults(function (): Password {
            $rule = Password::min(8)->mixedCase()->letters()->numbers()->symbols();

            return app()->isProduction() ? $rule->uncompromised() : $rule;
        });

        // Branded reset email (replaces the framework's default look).
        ResetPassword::toMailUsing(fn (object $notifiable, string $token) => (new MailMessage)
            ->subject('Reset your FBS Payroll password')
            ->view('mail.reset-password', [
                'name' => $notifiable->first_name,
                'url' => MailLink::passwordReset($token, $notifiable->getEmailForPasswordReset()),
                'expires' => MailLink::expiryText(),
            ]));
    }
}
