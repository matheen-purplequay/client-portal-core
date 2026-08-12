<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SendMessage extends Mailable
{
    use Queueable, SerializesModels;

    public $clientEmail, $clientName, $query, $company;

    /**
     * Create a new message instance.
     */
    public function __construct($clientEmail, $clientName, $query, $company)
    {
        $this->clientEmail = $clientEmail;
        $this->clientName = $clientName;
        $this->query = $query;
        $this->company = $company;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New enquiry - Client Portal',
            from: new Address('clientportalsupport@carisma-solutions.com.au', 'Client Portal Support'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.send-message',
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
