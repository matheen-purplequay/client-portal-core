<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendReportStatus extends Mailable
{
    use Queueable, SerializesModels;

    public $report_title, $uploaded_by, $client_name, $subject, $status;

    /**
     * Create a new message instance.
     */
    public function __construct($report_title, $uploaded_by, $client_name, $subject, $status)
    {
        $this->report_title = $report_title;
        $this->uploaded_by = $uploaded_by;
        $this->status = $status;
        $this->client_name = $client_name;
        $this->subject = $subject;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Report ' . $this->status,
            from: new Address('projects@carisma-solutions.com.au', 'Carisma Admin')
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.report-status-changed',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
