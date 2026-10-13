<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/** One stored in-app notice: a request waiting for the approver, or the decision on a request. Shown in the bell and on the Notifications page. */
class ApprovalNotice extends Notification
{
    public function __construct(
        private readonly string $message,
        private readonly string $tone,
        private readonly string $link,
        private readonly ?string $tab = null,
        private readonly ?int $highlightId = null,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return ['message' => $this->message, 'tone' => $this->tone, 'link' => $this->link, 'tab' => $this->tab, 'highlight_id' => $this->highlightId];
    }
}
