<?php
session_start();

require '/home/www/vendor/autoload.php';

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$dotenv = Dotenv\Dotenv::createImmutable('/home/www/public/');
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$data = json_decode(file_get_contents('php://input'), true);
$orderId = $data["assignOrderNumber"];
$assignee = $data["assignOrderBox"];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->prepare("UPDATE Orders SET assignee = ? WHERE order_id = ?")
    ->execute([$assignee, $orderId]);

$stmt = $pdo->prepare("SELECT * FROM Orders WHERE order_id = ?");
$stmt->execute([$orderId]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

function sendDiscordNotification($order_id, $assignee, $pdo) {
    $webhookurl = $_ENV['DISCORD_ORDERS_WEBHOOK'];

    $stmt = $pdo->prepare("SELECT discord_thread_id FROM Orders WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $threadId = $stmt->fetchColumn();

    $payload = json_encode([
        'content' => "Order Assigned to {$assignee}"
    ]);

    $ch = curl_init($webhookurl . '?thread_id=' . $threadId);

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    $webhookurl1 = $_ENV['DISCORD_NOTIFICATIONS_WEBHOOK'];

    $payload1 = json_encode([
        'content' => "Order #{$order_id} Assigned to {$assignee}: <#{$threadId}>"
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

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = $_ENV['EMAIL_HOST'];
$mail->SMTPAuth = true;
$mail->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
$mail->Password = $_ENV['EMAIL_PASSWORD'];
$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail->Port = 465;

$mail->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
$mail->addAddress($_ENV['EMAIL_USERNAME_CONTACT']);
$mail->addReplyTo($order['email']);

$body = "Item: {$order['item']}";

$mail->CharSet = 'UTF-8';
$mail->Encoding = 'quoted-printable';
$mail->Subject = "Order #$orderId Assigned To $assignee";
$mail->Body = $body;

$mail->sign(
    '/home/www/Email Certificate/certificate.crt',
    '/home/www/Email Certificate/private.key',
    '',
    '/home/www/Email Certificate/ca-chain.crt'
);

$mail->send();

sendDiscordNotification($orderId, $assignee, $pdo);

echo json_encode(['success' => true]);

?>