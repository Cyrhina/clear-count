<?php

namespace App\Mail;

use Closure;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** The payslip email: a short note with the PDF attached. `$pdf` renders the PDF when the mail is built. */
class PayslipMail extends Mailable
{
    public function __construct(private readonly string $subjectLine, private readonly string $firstName, private readonly string $periodLabel, private readonly Closure $pdf, private readonly string $fileName) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine);
    }

    public function content(): Content
    {
<<<<<<< HEAD
        // `name` is what the shared mail layout greets ("Hi {name}"); `firstName` is what the payslip view's own text uses.
=======
>>>>>>> e731c9e5c3b48c308ac17191e8af06e02382c028
        return new Content(view: 'mail.payslip', with: ['name' => $this->firstName, 'firstName' => $this->firstName, 'periodLabel' => $this->periodLabel, 'url' => url('/ess/payslips')]);
    }

    /** @return list<Attachment> */
    public function attachments(): array
    {
        return [Attachment::fromData($this->pdf, $this->fileName)->withMime('application/pdf')];
    }
}
