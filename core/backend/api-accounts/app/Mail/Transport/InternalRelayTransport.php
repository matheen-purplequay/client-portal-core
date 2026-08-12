<?php

namespace App\Mail\Transport;

use Illuminate\Support\Facades\Http;
use RuntimeException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

class InternalRelayTransport extends AbstractTransport
{
    public function __construct(
        protected string $endpoint,
        protected string $apiKey,
    ) {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = $message->getOriginalMessage();

        if (! $email instanceof Email) {
            throw new RuntimeException('InternalRelayTransport only supports Email messages.');
        }

        $payload = [
            'from' => $this->formatAddresses($email->getFrom()),
            'to' => $this->formatAddresses($email->getTo()),
            'cc' => $this->formatAddresses($email->getCc()),
            'bcc' => $this->formatAddresses($email->getBcc()),
            'reply_to' => $this->formatAddresses($email->getReplyTo()),
            'subject' => $email->getSubject(),
            'html' => $email->getHtmlBody(),
            'text' => $email->getTextBody(),
        ];

        $response = Http::withHeaders(['X-Api-Key' => $this->apiKey])
            ->timeout(15)
            ->post($this->endpoint, $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                "Internal mail relay failed with status {$response->status()}: {$response->body()}"
            );
        }
    }

    /**
     * @param Address[] $addresses
     */
    protected function formatAddresses(array $addresses): array
    {
        return array_map(fn (Address $address) => [
            'email' => $address->getAddress(),
            'name' => $address->getName(),
        ], $addresses);
    }

    public function __toString(): string
    {
        return 'internal-relay://'.parse_url($this->endpoint, PHP_URL_HOST);
    }
}
