<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SendFormEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $name, $email, $subject, $data;
    public $body = 'You have received a new form submission through the website contact form. Here are the details:';

    /**
     * Create a new message instance.
     */
    public function __construct($name, $email, $subject, $data, $body)
    {
        $this->name = $name;
        $this->email = $email;
        $this->subject = $subject;
        $this->data = $data;
        $this->body = $body;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
            from: new Address('clientportalsupport@carisma-solutions.com.au', 'Client Portal Support'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.send-form-email',
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
