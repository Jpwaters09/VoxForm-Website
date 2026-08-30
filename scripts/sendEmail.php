<?php

require '/home/www/vendor/autoload.php';

header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$dotenv = Dotenv\Dotenv::createImmutable('/home/www/public/');
$dotenv->load();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

$name = htmlspecialchars(trim($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8');
$senderEmail = trim($_POST['email'] ?? '');
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''), ENT_QUOTES, 'UTF-8');
$body = htmlspecialchars(trim($_POST['messageBody'] ?? ''), ENT_QUOTES, 'UTF-8');

function sendOrderToDiscord($order) {
    $webhookurl = $_ENV['DISCORD_ORDERS_WEBHOOK'];

    $embed = [
        'title' => "New message from {$order['name']} - Check VoxForm Contact email for more information",
        'color' => 0x00C8D4,
        'fields' => [
            [
                'name' => 'Name',
                'value' => $order['name'],
                'inline' => true
            ],
            [
                'name' => 'Email',
                'value' => $order['email'],
                'inline' => true
            ],
            [
                'name' => 'Subject',
                'value' => $order['subject'],
                'inline' => false
            ],
            [
                'name' => 'Message',
                'value' => $order['body'],
                'inline' => false
            ]
        ],
        'footer' => ['text' => 'VoxForm Contact'],
        'timestamp' => date('c')
    ];

    $payload = json_encode([
        'username' => 'VoxForm Contact',
        'thread_name' => "New message from {$order['name']}",
        'embeds' => [$embed]
    ]);

    $ch = curl_init($webhookurl . '?wait=true');

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    $data = json_decode($response, true);
    $threadId = $data['channel_id'] ?? null;

    curl_close($ch);

    $webhookurl1 = $_ENV['DISCORD_NOTIFICATIONS_WEBHOOK'];

    $payload1 = json_encode([
        'content' => "New message: <#{$threadId}>"
    ]);

    $ch1 = curl_init($webhookurl1);

    curl_setopt($ch1, CURLOPT_POST, true);
    curl_setopt($ch1, CURLOPT_POSTFIELDS, $payload1);
    curl_setopt($ch1, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

    $response1 = curl_exec($ch1);
    $httpCode1 = curl_getinfo($ch1, CURLINFO_HTTP_CODE);

    curl_close($ch1);
}

sendOrderToDiscord([
    'name' => $name,
    'email' => $senderEmail,
    'subject' => $subject,
    'body' => $body
]);

$mailBody = "New message from the VoxForm contact form.\n";
$mailBody .= "----------------------------------------\n\n";
$mailBody .= "Name: {$name}\n";
$mailBody .= "Email: {$senderEmail}\n";
$mailBody .= "Subject: {$subject}\n\n";
$mailBody .= "Message:\n{$body}\n";

$mail1 = new PHPMailer(true);
$mail1->isSMTP();
$mail1->Host = $_ENV['EMAIL_HOST'];
$mail1->SMTPAuth = true;
$mail1->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
$mail1->Password = $_ENV['EMAIL_PASSWORD'];
$mail1->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail1->Port = 465;

$mail1->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
$mail1->addAddress($_ENV['EMAIL_USERNAME_CONTACT']);
$mail1->addReplyTo($_POST['email']);

$mail1->CharSet = 'UTF-8';
$mail1->Encoding = 'quoted-printable';
$mail1->Subject = "Contact Form: {$subject}";
$mail1->Body = $mailBody;

$mail1->sign(
    '/home/www/Email Certificate/certificate.crt',
    '/home/www/Email Certificate/private.key',
    '',
    '/home/www/Email Certificate/ca-chain.crt'
);

$sent1 = $mail1->send();

$mail2 = new PHPMailer(true);
$mail2->isSMTP();
$mail2->Host = $_ENV['EMAIL_HOST'];
$mail2->SMTPAuth = true;
$mail2->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
$mail2->Password = $_ENV['EMAIL_PASSWORD'];
$mail2->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail2->Port = 465;

$mail2->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
$mail2->addAddress($_POST['email']);
$mail2->addReplyTo($_ENV['EMAIL_USERNAME_CONTACT']);

$mail2->sign(
    '/home/www/Email Certificate/certificate.crt',
    '/home/www/Email Certificate/private.key',
    '',
    '/home/www/Email Certificate/ca-chain.crt'
);

$mail2->isHTML(true);
$mail2->Subject = "We've received your enquiry - we'll be in touch soon";
$mail2->Body = str_replace('{{NAME}}', $name, file_get_contents('/home/www/public/Email Templates/sendEmail.html'));

$sent2 = $mail2->send();

if ($sent1 && $sent2) {
    echo json_encode(['success' => true]);
}

else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Message could not be sent. Please email us directly at contact@voxform.co.uk.']);
}

?>