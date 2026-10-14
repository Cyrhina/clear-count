<?php

namespace App\Mail;

use App\Models\PayrollLine;
use App\Support\PayslipPdf;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** The payslip email: a short note with the PDF attached. */
class PayslipMail extends Mailable
{
    public function __construct(private readonly PayrollLine $line, private readonly string $subjectLine, private readonly string $firstName, private readonly string $periodLabel) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.payslip', with: ['firstName' => $this->firstName, 'periodLabel' => $this->periodLabel, 'url' => url('/ess/payslips')]);
    }

    /** @return list<Attachment> */
    public function attachments(): array
    {
        return [Attachment::fromData(fn () => PayslipPdf::render($this->line), PayslipPdf::fileName($this->line))->withMime('application/pdf')];
    }
}
