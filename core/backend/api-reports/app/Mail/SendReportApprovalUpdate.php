<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendReportApprovalUpdate extends Mailable
{
    use Queueable, SerializesModels;

    public $client_name, $month, $year, $portal_link, $primary_color, $support_email, $subject_line;

    /**
     * Create a new message instance.
     */
    public function __construct($client_name, $month, $year, $portal_link, $primary_color, $support_email)
    {
        $this->client_name = $client_name;
        $this->month = $month;
        $this->year = $year;
        $this->portal_link = $portal_link;
        $this->primary_color = $primary_color;
        $this->support_email = $support_email;
        $this->subject_line = 'Monthly Connect Report, [' . $month . '-' . $year . '] is now available in Client Portal';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject_line,
            from: new Address('projects@carisma-solutions.com.au', 'Carisma Admin')
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.client-report-notification',
            with: [
                'company_name' => $this->client_name,
                'portal_link' => $this->portal_link,
                'primary_color' => $this->primary_color,
                'support_email' => $this->support_email,
            ]
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
