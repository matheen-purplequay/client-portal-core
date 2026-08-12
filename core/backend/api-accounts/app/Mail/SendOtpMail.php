<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp, $name;

    /**
     * Create a new message instance.
     */
    public function __construct($otp, $name)
    {
        $this->otp = $otp;
        $this->name = $name;
        // $this->host = $host;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $csSender = [ 'email' => 'clientportalsupport@carisma-solutions.com.au', 'name' => 'Client Portal Support' ];
        $pqSender = [ 'email' => 'clientportalsupport@purplequay.com.au', 'name' => 'Purplequay Support' ];

        $sender =  [];
        // if(str_contains($this->host, 'carisma-solutions.com.au')){
        //     $sender['email'] = 'clientportalsupport@carisma-solutions.com.au';
        //     $sender['name'] = 'Client Portal Support';
        // } 
        // else if(str_contains($this->host, 'purplequay.com.au')) {
        //     $sender['email'] = 'clientportalsupport@purplequay.com.au';
        //     $sender['name'] = 'Purplequay Support';
        // }
        // else {
        //     $sender['email'] = 'clientportalsupport@carisma-solutions.com.au';
        //     $sender['name'] = 'Carisma Solutions Support';
        // }

        return new Envelope(
            subject: 'Your One-Time Password (OTP) for Secure Access',
            from: new Address('clientportalsupport@carisma-solutions.com.au', 'Client Portal Support'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.otp-email',
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
