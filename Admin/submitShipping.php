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

$orderId = $_POST["assignOrderNumber"];
$trackingNumber = $_POST["trackingNumber"];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->prepare("UPDATE Orders SET status = 'Shipped', tracking_number = ? WHERE order_id = ?")
    ->execute([$trackingNumber, $orderId]);

$stmt = $pdo->prepare("SELECT * FROM Orders WHERE order_id = ?");
$stmt->execute([$orderId]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

function sendDiscordNotification($order_id, $trackingLink, $pdo) {
    $webhookurl = $_ENV['DISCORD_ORDERS_WEBHOOK'];

    $stmt = $pdo->prepare("SELECT discord_thread_id FROM Orders WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $threadId = $stmt->fetchColumn();

    $payload = json_encode([
        'content' => "Order Shipped: {$trackingLink}"
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

$upload_dir = '/home/www/public/Uploads/order_' . $orderId . '/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$fileName = basename($_FILES['videoFile']['name']);
$filepath = $upload_dir . $fileName;

move_uploaded_file($_FILES['videoFile']['tmp_name'], $filepath);

$shipping = $order['shipping'];
$today = new DateTime();

function addWorkingDays(DateTime $date, int $days): DateTime {
    $result = clone $date;
    $added = 0;
    while ($added < $days) {
        $result->modify('+1 day');
        $dow = (int)$result->format('N');
        if ($dow < 6) $added++;
    }
    return $result;
}

if ($shipping == "RMT48") {
    $carrier = "Royal Mail Tracked 48";
    $estDelivery = addWorkingDays($today, 2);
    $trackingLink = "http://www.royalmail.com/portal/rm/track?trackNumber={$trackingNumber}";
}

if ($shipping == "RMT24") {
    $carrier = "Royal Mail Tracked 24";
    $estDelivery = addWorkingDays($today, 1);
    $trackingLink = "http://www.royalmail.com/portal/rm/track?trackNumber={$trackingNumber}";
}

if ($shipping == "YODEL") {
    $carrier = "Yodel";
    $estDelivery = addWorkingDays($today, 4);
    $trackingLink = "https://inpost.co.uk/tracking/result?parcel_code={$trackingNumber}";
}

$estDeliveryStr = $estDelivery->format('l j F Y');

sendDiscordNotification($orderId, $trackingLink, $pdo);

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

$structuredData = '
<script type="application/json+trustpilot">
{
"recipientName": "' . htmlspecialchars($order['name']) . '",
"recipientEmail": "' . htmlspecialchars($order['email']) . '",
"referenceId": "' . htmlspecialchars($order['order_id']) . '"
}
</script>';

$html = file_get_contents('/home/www/public/Email Templates/submitShipping.html');

$body = str_replace(
        [
            '{{NAME}}',
            '{{ORDER_ID}}',
            '{{CARRIER}}',
            '{{TRACKING_NUMBER}}',
            '{{EST_DELIVERY}}',
            '{{TRACKING_LINK}}',
            '{{ORDER_ID}}',
            '{{ITEM}}',
            '{{ADDRESS_LINE_1}}',
            '{{ADDRESS_LINE_2}}',
            '{{CITY}}',
            '{{POSTCODE}}',
            '{{COUNTY}}',
            '{{COUNTRY}}'
        ],
        [
            htmlspecialchars(trim($order['name'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($orderId ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($carrier ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($trackingNumber ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($estDeliveryStr ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($trackingLink ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($orderId ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['item'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['address_line_1'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['address_line_2'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['city'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['postcode'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['county'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['country'] ?? ''), ENT_QUOTES, 'UTF-8')
        ],
        $html
    );

$mail->Body = $body . $structuredData;
$mail->addBCC($_ENV['EMAIL_TRUSTPILOT']);
$mail->isHTML(true);
$mail->CharSet = 'UTF-8';
$mail->Encoding = 'quoted-printable';
$mail->Subject = "Your VoxForm Order #{$orderId} Has Been Dispatched";
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