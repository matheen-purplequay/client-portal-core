<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SendDynamicEmail extends Mailable
{
    use Queueable, SerializesModels;
    public $subject, $body, $signature = 'IT Group at Carisma Solutions', $sender;

    /**
     * Create a new message instance.
     */
    public function __construct($subject, $body, $signature = 'IT Group at Carisma Solutions', $sender)
    {
        $this->subject = $subject;
        $this->body = $body;
        $this->signature = $signature;
        $this->sender = $sender;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        if($this->sender == 'carisma') {
            return new Envelope(
                subject: $this->subject,
                from: new Address('no-reply@carisma-solutions.com.au', 'Carisma Admin'),
            );
        } 
        else {
            return new Envelope(
                subject: $this->subject,
                from: new Address('no-reply@purplequay.com.au', 'Purple Quay Admin'),
            );
        } 
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.send-dynamic-email',
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
