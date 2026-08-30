<?php
session_start();

require '/home/www/vendor/autoload.php';

header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$dotenv = Dotenv\Dotenv::createImmutable('/home/www/public/');
$dotenv->load();

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    exit;
}

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$data = json_decode(file_get_contents('php://input'), true);
$orderId = $data["assignOrderNumber"];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->prepare("UPDATE Orders SET status = 'Completed' WHERE order_id = ?")
    ->execute([$orderId]);

$stmt = $pdo->prepare("SELECT * FROM Orders WHERE order_id = ?");
$stmt->execute([$orderId]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

function sendDiscordNotification($order_id, $pdo) {
    $webhookurl = $_ENV['DISCORD_ORDERS_WEBHOOK'];

    $stmt = $pdo->prepare("SELECT discord_thread_id FROM Orders WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $threadId = $stmt->fetchColumn();

    $payload = json_encode([
        'content' => "Order Delivered"
    ]);

    $ch = curl_init($webhookurl . '?thread_id=' . $threadId);

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);
}

sendDiscordNotification($orderId, $pdo);

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = $_ENV['EMAIL_HOST'];
$mail->SMTPAuth = true;
$mail->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
$mail->Password = $_ENV['EMAIL_PASSWORD'];
$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail->Port = 465;

$mail->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
$mail->addAddress($order['email']);
$mail->addReplyTo($_ENV['EMAIL_USERNAME_CONTACT']);

$html = file_get_contents('/home/www/public/Email Templates/submitComplete.html');

$body = str_replace(
    ['{{NAME}}', '{{ORDER_ID}}'],
    [
        htmlspecialchars(trim($order['name'] ?? ''), ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(trim($orderId ?? ''), ENT_QUOTES, 'UTF-8')
    ],
    $html
);

$mail->Body = $body . $structuredData;
$mail->isHTML(true);
$mail->CharSet = 'UTF-8';
$mail->Encoding = 'quoted-printable';
$mail->Subject = "Your VoxForm Order #{$orderId} Has Been Delivered";
$mail->AltBody = strip_tags($body);

$mail->sign(
    '/home/www/Email Certificate/certificate.crt',
    '/home/www/Email Certificate/private.key',
    '',
    '/home/www/Email Certificate/ca-chain.crt'
);

$mail->send();

echo json_encode(['success' => true]);

?>