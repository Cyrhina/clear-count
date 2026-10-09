<?php

namespace App\Notifications;

use App\Support\MailLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Invite email: a one-time link to create a password (framework password broker; Fortify's reset screen handles it).
 * Queued, so the API answers at once however slow the mail server is. A queue worker must be running to send it.
 */
class UserInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** Seconds to wait before each retry. @var list<int> */
    public array $backoff = [30, 120];

    public function __construct(private readonly string $token, private readonly string $roleLabel)
    {
        // Queue only once the user row is committed, so the worker never looks for a user that is not there yet.
        $this->afterCommit();
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Create your FBS Payroll password')
            ->view('mail.invitation', [
                'name' => $notifiable->first_name,
                'roleLabel' => $this->roleLabel,
                'url' => MailLink::passwordReset($this->token, $notifiable->getEmailForPasswordReset()),
                'expires' => MailLink::expiryText(),
            ]);
    }
}
