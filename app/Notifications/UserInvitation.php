<?php

namespace App\Notifications;

use App\Support\MailLink;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Invite email: a one-time link to create a password (framework password broker; Fortify's reset screen handles it). */
class UserInvitation extends Notification
{
    public function __construct(private readonly string $token, private readonly string $roleLabel) {}

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
