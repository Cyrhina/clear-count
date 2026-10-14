<?php

namespace App\Http\Controllers;

use App\Jobs\DeliverWebhook;
use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use App\Support\ActivityLogger;
use App\Support\Webhooks;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** Webhook endpoints of the company and how their deliveries went. The route group requires `integrations.manage`. */
class WebhookController extends Controller
{
    public function index(): JsonResponse
    {
        $endpoints = WebhookEndpoint::latest('id')->get();
        // The newest delivery of each endpoint (one query: a limit inside an eager load would cut the list as a whole).
        $last = WebhookDelivery::whereIn('id', WebhookDelivery::whereIn('webhook_endpoint_id', $endpoints->modelKeys())->groupBy('webhook_endpoint_id')->selectRaw('max(id)'))->get()->keyBy('webhook_endpoint_id');
        $rows = $endpoints->map(fn (WebhookEndpoint $e) => $this->summary($e, $last[$e->id] ?? null));

        return response()->json(['data' => $rows]);
    }

    /** The signing secret is in this answer and nowhere else: the company copies it now. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2048'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['string', Rule::in(array_keys(config('webhooks.events')))],
        ]);
        Webhooks::assertPublicUrl($data['url']);

        $endpoint = WebhookEndpoint::create([
            'created_by' => $request->user()->id, 'url' => $data['url'], 'events' => array_values(array_unique($data['events'])), 'secret' => 'whsec_'.Str::random(40),
        ]);
        ActivityLogger::log(module: 'Integrations', action: 'Created', title: 'Webhook', description: $endpoint->url, subject: $endpoint);

        return response()->json(['data' => $this->summary($endpoint), 'secret' => $endpoint->secret], 201);
    }

    /** Turns an endpoint on or off, or changes the events it hears. */
    public function update(Request $request, WebhookEndpoint $endpoint): JsonResponse
    {
        $data = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'events' => ['sometimes', 'array', 'min:1'],
            'events.*' => ['string', Rule::in(array_keys(config('webhooks.events')))],
        ]);
        $endpoint->update($data);

        return response()->json(['data' => $this->summary($endpoint)]);
    }

    public function destroy(WebhookEndpoint $endpoint): JsonResponse
    {
        $endpoint->delete();
        ActivityLogger::log(module: 'Integrations', action: 'Removed', title: 'Webhook', description: $endpoint->url);

        return response()->json(['message' => 'Webhook removed.']);
    }

    public function deliveries(WebhookEndpoint $endpoint): JsonResponse
    {
        $rows = $endpoint->deliveries()->latest('id')->limit(50)->get()->map(fn (WebhookDelivery $d) => [
            'id' => $d->id, 'event' => $d->event, 'status' => $d->status, 'attempts' => $d->attempts, 'response_code' => $d->response_code,
            'error' => $d->error, 'created_at' => $d->created_at?->toIso8601String(), 'delivered_at' => $d->delivered_at?->toIso8601String(),
        ]);

        return response()->json(['data' => $rows]);
    }

    /** Sends a failed delivery again, with a fresh set of attempts. */
    public function retry(WebhookDelivery $delivery): JsonResponse
    {
        if ($delivery->status !== 'failed') {
            return response()->json(['message' => 'Only a failed delivery can be sent again.'], 422);
        }
        $delivery->forceFill(['status' => 'pending', 'attempts' => 0, 'error' => null])->save();
        DeliverWebhook::dispatch($delivery->id);

        return response()->json(['data' => ['id' => $delivery->id, 'status' => $delivery->fresh()->status]]);
    }

    /** @return array<string, mixed> */
    private function summary(WebhookEndpoint $e, ?WebhookDelivery $last = null): array
    {
        return [
            'id' => $e->id, 'url' => $e->url, 'events' => $e->events, 'is_active' => $e->is_active, 'created_at' => $e->created_at?->toIso8601String(),
            'last_delivery' => $last ? ['status' => $last->status, 'event' => $last->event, 'at' => $last->updated_at?->toIso8601String()] : null,
        ];
    }
}
