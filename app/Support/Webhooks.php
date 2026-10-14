<?php

namespace App\Support;

use App\Jobs\DeliverWebhook;
use App\Models\Company;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\PayrollPeriod;
use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Tells the companies' endpoints about events. Hooked once, on the models (`watch()`), so the three events fire from every
 * path that causes them (the API, the CSV import, the console). Each event becomes one delivery row per subscribed endpoint,
 * sent by a queued job that signs it and retries with a backoff. Only companies whose plan includes `api_integrations` send.
 */
final class Webhooks
{
    public static function watch(): void
    {
        Employee::created(fn (Employee $e) => self::dispatch($e->company_id, 'employee.created', [
            'id' => $e->id, 'employee_number' => $e->employee_number, 'name' => $e->name, 'department' => $e->department,
            'position' => $e->employment['position'] ?? null, 'date_hired' => $e->employment['dateHired'] ?? null,
        ]));

        PayrollPeriod::updated(function (PayrollPeriod $p) {
            if ($p->wasChanged('status') && $p->status === 'finalized') {
                self::dispatch($p->company_id, 'payroll.finalized', [
                    'id' => $p->id, 'payroll_number' => $p->payroll_number, 'label' => $p->label, 'start_date' => $p->start_date?->toDateString(),
                    'end_date' => $p->end_date?->toDateString(), 'pay_date' => $p->pay_date?->toDateString(), 'finalized_at' => $p->finalized_at?->toIso8601String(),
                    'employees' => $p->lines()->withoutGlobalScopes()->count(),
                ]);
            }
        });

        LeaveRequest::updated(function (LeaveRequest $l) {
            if ($l->wasChanged('status') && $l->status === 'approved') {
                self::dispatch($l->company_id, 'leave.approved', [
                    'id' => $l->id, 'employee_id' => $l->employee_id, 'leave_type_id' => $l->leave_type_id,
                    'date_from' => $l->date_from?->toDateString(), 'date_to' => $l->date_to?->toDateString(), 'days' => (float) $l->days,
                ]);
            }
        });
    }

    /** @param array<string, mixed> $data */
    public static function dispatch(int $companyId, string $event, array $data): void
    {
        // A failing webhook must never break the action that caused it.
        try {
            $company = Company::find($companyId);
            if (! $company || ! Plans::has($company, 'api_integrations')) {
                return;
            }

            WebhookEndpoint::withoutGlobalScopes()->where('company_id', $companyId)->where('is_active', true)->get()
                ->filter(fn (WebhookEndpoint $e) => in_array($event, $e->events, true))
                ->each(function (WebhookEndpoint $endpoint) use ($event, $data) {
                    $delivery = WebhookDelivery::withoutGlobalScopes()->create(['company_id' => $endpoint->company_id, 'webhook_endpoint_id' => $endpoint->id, 'event' => $event, 'payload' => $data]);
                    DeliverWebhook::dispatch($delivery->id);
                });
        } catch (Throwable $e) {
            Log::warning("Webhook {$event} could not be queued: {$e->getMessage()}");
        }
    }

    /** The body and headers of a delivery. The signature covers the timestamp and the exact body: `t=<unix>,v1=<hmac sha256 of "t.body">`. */
    public static function request(WebhookDelivery $delivery, string $secret): array
    {
        $body = json_encode(['id' => $delivery->id, 'event' => $delivery->event, 'created_at' => $delivery->created_at?->toIso8601String(), 'data' => $delivery->payload], JSON_UNESCAPED_SLASHES);
        $t = time();

        return [$body, [
            'X-FBS-Event' => $delivery->event,
            'X-FBS-Delivery' => (string) $delivery->id,
            'X-FBS-Signature' => "t={$t},v1=".hash_hmac('sha256', "{$t}.{$body}", $secret),
            'User-Agent' => 'FBS-Pay-Webhooks/1.0',
        ]];
    }

    /** A webhook URL must be https (http only for a local test) and point to the public internet: no credentials, no private or reserved address. */
    public static function assertPublicUrl(string $url): void
    {
        $parts = parse_url($url);
        $host = $parts['host'] ?? null;
        $scheme = strtolower($parts['scheme'] ?? '');
        $local = config('webhooks.allow_private');
        $fail = fn (string $why) => throw ValidationException::withMessages(['url' => $why]);

        if (! $host || ! in_array($scheme, $local ? ['http', 'https'] : ['https'], true)) {
            $fail('Use an https:// address.');
        }
        if (isset($parts['user']) || isset($parts['pass'])) {
            $fail('The address cannot contain a username or password.');
        }
        if ($local) {
            return;
        }

        $host = trim($host, '[]');
        $ips = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : (gethostbynamel($host) ?: []);
        if ($ips === []) {
            $fail('That address could not be found.');
        }
        foreach ($ips as $ip) {
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                $fail('The address must be on the public internet.');
            }
        }
    }
}
