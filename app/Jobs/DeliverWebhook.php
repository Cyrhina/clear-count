<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use App\Support\Webhooks;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

/** Sends one signed delivery. A failure (network error or a non-2xx answer) is retried after the configured backoff; the last one marks it failed. */
class DeliverWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 5;

    public function __construct(public int $deliveryId)
    {
        $this->afterCommit();
    }

    /** @return list<int> */
    public function backoff(): array
    {
        return config('webhooks.backoff');
    }

    public function handle(): void
    {
        $delivery = WebhookDelivery::withoutGlobalScopes()->with(['endpoint' => fn ($q) => $q->withoutGlobalScopes()])->find($this->deliveryId);
        if (! $delivery || $delivery->status === 'success') {
            return;
        }

        $endpoint = $delivery->endpoint;
        if (! $endpoint || ! $endpoint->is_active) {
            $delivery->forceFill(['status' => 'failed', 'error' => 'The endpoint is off or was removed.'])->save();

            return;
        }

        $delivery->increment('attempts');
        try {
            // Checked again at send time, not only when the endpoint was saved.
            Webhooks::assertPublicUrl($endpoint->url);
            [$body, $headers] = Webhooks::request($delivery, $endpoint->secret);
            $response = Http::timeout((int) config('webhooks.timeout'))->withoutRedirecting()->withHeaders($headers)->withBody($body, 'application/json')->post($endpoint->url);
        } catch (Throwable $e) {
            $delivery->forceFill(['status' => 'retrying', 'response_code' => null, 'error' => mb_substr($e->getMessage(), 0, 500)])->save();
            throw $e;
        }

        if ($response->successful()) {
            $delivery->forceFill(['status' => 'success', 'response_code' => $response->status(), 'error' => null, 'delivered_at' => now()])->save();

            return;
        }

        $delivery->forceFill(['status' => 'retrying', 'response_code' => $response->status(), 'error' => "The server answered {$response->status()}."])->save();
        throw new RuntimeException("Webhook {$this->deliveryId} answered {$response->status()}.");
    }

    public function failed(Throwable $e): void
    {
        WebhookDelivery::withoutGlobalScopes()->whereKey($this->deliveryId)->update(['status' => 'failed']);
    }
}
