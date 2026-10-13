<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

/** The signed-in user's stored notifications: list, mark one read, mark all read. */
class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rows = $user->notifications()->latest()->limit(50)->get()->map(fn (DatabaseNotification $n) => [
            'id' => $n->id, 'message' => $n->data['message'], 'tone' => $n->data['tone'], 'link' => $n->data['link'], 'tab' => $n->data['tab'] ?? null,
            'highlight_id' => $n->data['highlight_id'] ?? null, 'read' => $n->read_at !== null, 'created_at' => $n->created_at,
        ]);

        return response()->json(['data' => $rows, 'unread' => $user->unreadNotifications()->count()]);
    }

    public function read(Request $request, string $id): JsonResponse
    {
        $request->user()->notifications()->whereKey($id)->firstOrFail()->markAsRead();

        return response()->json(['data' => ['read' => true]]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['data' => ['read' => true]]);
    }
}
