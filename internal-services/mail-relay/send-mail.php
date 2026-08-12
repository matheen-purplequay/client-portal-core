<?php

require __DIR__.'/vendor/autoload.php';

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json');

function loadEnv(string $path): array
{
    $env = [];
    if (! is_file($path)) {
        return $env;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || ! str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }

    return $env;
}

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$env = loadEnv(__DIR__.'/.env');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed']);
}

$providedKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
$expectedKey = $env['RELAY_API_KEY'] ?? '';
if ($expectedKey === '' || ! hash_equals($expectedKey, $providedKey)) {
    respond(401, ['error' => 'Unauthorized']);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (! is_array($payload) || empty($payload['to']) || empty($payload['subject'])) {
    respond(422, ['error' => 'Invalid payload: "to" and "subject" are required']);
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $env['SMTP_HOST'] ?? 'smtp-mail.outlook.com';
    $mail->SMTPAuth = true;
    $mail->Username = $env['SMTP_USERNAME'] ?? '';
    $mail->Password = $env['SMTP_PASSWORD'] ?? '';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = (int) ($env['SMTP_PORT'] ?? 587);

    foreach ($payload['from'] ?? [] as $addr) {
        $mail->setFrom($addr['email'], $addr['name'] ?? '');
    }
    foreach ($payload['to'] as $addr) {
        $mail->addAddress($addr['email'], $addr['name'] ?? '');
    }
    foreach ($payload['cc'] ?? [] as $addr) {
        $mail->addCC($addr['email'], $addr['name'] ?? '');
    }
    foreach ($payload['bcc'] ?? [] as $addr) {
        $mail->addBCC($addr['email'], $addr['name'] ?? '');
    }
    foreach ($payload['reply_to'] ?? [] as $addr) {
        $mail->addReplyTo($addr['email'], $addr['name'] ?? '');
    }

    $mail->Subject = $payload['subject'];

    if (! empty($payload['html'])) {
        $mail->isHTML(true);
        $mail->Body = $payload['html'];
        $mail->AltBody = $payload['text'] ?? strip_tags($payload['html']);
    } else {
        $mail->isHTML(false);
        $mail->Body = $payload['text'] ?? '';
    }

    $mail->send();

    respond(200, ['status' => 'sent']);
} catch (Exception $e) {
    respond(502, ['error' => 'Mail send failed', 'detail' => $mail->ErrorInfo ?: $e->getMessage()]);
}
