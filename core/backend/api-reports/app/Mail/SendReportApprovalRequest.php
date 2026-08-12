<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SendReportApprovalRequest extends Mailable
{
    use Queueable, SerializesModels;
    
    public $report_title, $approver_name, $requester_name, $client_name, $subject, $template = 'report-approval-request';

    /**
     * Create a new message instance.
     */
    public function __construct($report_title, $approver_name, $requester_name, $client_name, $subject, $type)
    {
        $this->report_title = $report_title;
        $this->approver_name = $approver_name;
        $this->requester_name = $requester_name;
        $this->client_name = $client_name;
        $this->subject = $subject;

        if($type == 'failed') $this->template = $this->template . '-failure';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
            from: new Address('projects@carisma-solutions.com.au', 'Carisma Admin'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.' . $this->template,
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
