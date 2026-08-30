<?php
require '/home/www/vendor/autoload.php';
require '/home/www/public/scripts/PHPMailer.php';
require '/home/www/public/scripts/SMTP.php';
require '/home/www/public/scripts/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

\Stripe\Stripe::setApiKey($_ENV['STRIPE_MAIN_API']); // Main Mode
// \Stripe\Stripe::setApiKey($_ENV['STRIPE_TEST_API']); // Test Mode

$payload = file_get_contents('php://input');
$sig = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$secret = $_ENV['STRIPE_MAIN_SECRET']; // Main Mode
// $secret = $_ENV['STRIPE_TEST_SECRET']; // Test Mode

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

function sendDiscordNotification($order_id, $pdo) {
    $webhookurl = $_ENV['DISCORD_ORDERS_WEBHOOK'];

    $stmt = $pdo->prepare("SELECT * FROM Orders WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    $threadId = $order['discord_thread_id'];
    $totalCost = $order['total_cost'];

    $payload = json_encode([
        'content' => "Order Paid - £{$totalCost}"
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
        'content' => "Order #{$order_id} Paid - £{$totalCost}: <#{$threadId}>"
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

try {
    $event = \Stripe\Webhook::constructEvent($payload, $sig, $secret);
}

catch (Exception $e) {
    http_response_code(400);
    exit;
}

if ($event->type === 'payment_intent.succeeded') {
    $intent = $event->data->object;

    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $pdo->prepare("UPDATE Orders SET status = 'Paid' WHERE payment_intent_id = ?")
        ->execute([$intent->id]);

    $stmt = $pdo->prepare("SELECT * FROM Orders WHERE payment_intent_id = ?");
    $stmt->execute([$intent->id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(200);
        exit;
    }

    sendDiscordNotification($order['id'], $pdo);

    $shipping = $order['shipping'];

    if ($shipping === 'RMT24') {
        $shipping = 'Royal Mail Tracked 24';
    }

    if ($shipping === 'RMT48') {
       $shipping = 'Royal Mail Tracked 48';
    }

    if ($shipping === 'IPLS') {
        $shipping = 'InPost (Locker or Shop)';
    }

    if ($shipping === 'IPHA') {
        $shipping = 'InPost (Home Address)';
    }
                    
    $body = "An order has been paid.\n\n";

    $body .= "ORDER DETAILS\n";
    $body .= "----------------------------------------\n";
    $body .= "Order: #{$order['order_id']}\n";
    $body .= "Status: Paid\n";
    $body .= "Shipping: {$shipping}\n\n";

    $body .= "PAYMENT AMOUNT\n";
    $body .= "----------------------------------------\n";
    $body .= "Subtotal: £{$order['price']}\n";
    $body .= "Shipping: £{$order['shipping_price']}\n";
    $body .= "Total: £{$order['total_price']}\n";

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
    $mail1->addReplyTo($order['email']);
    
    $mail1->CharSet = 'UTF-8';
    $mail1->Encoding = 'quoted-printable';
    $mail1->Subject = "Order #{$order['order_id']} Paid";
    $mail1->Body = $body;
    
    $mail1->sign(
        '/home/www/Email Certificate/certificate.crt',
        '/home/www/Email Certificate/private.key',
        '',
        '/home/www/Email Certificate/ca-chain.crt'
    );

    $mail1->send();

    $mail2 = new PHPMailer(true);
    $mail2->isSMTP();
    $mail2->Host = $_ENV['EMAIL_HOST'];
    $mail2->SMTPAuth = true;
    $mail2->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
    $mail2->Password = $_ENV['EMAIL_PASSWORD'];
    $mail2->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail2->Port = 465;

    $mail2->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
    $mail2->addAddress($order['email']);
    $mail2->addReplyTo($_ENV['EMAIL_USERNAME_CONTACT']);

    $html = file_get_contents('/home/www/public/Email Templates/payment.html');
    
    $body1 = str_replace(
        [
            '{{NAME}}',
            '{{ORDER_ID}}',
            '{{ITEM}}',
            '{{MATERIAL1}}',
            '{{COLOUR1}}',
            '{{MATERIAL2}}',
            '{{COLOUR2}}',
            '{{FINISH}}',
            '{{PERSONALISATION}}',
            '{{STYLE}}',
            '{{QUANTITY}}',
            '{{ITEM_PRICE}}',
            '{{SHIPPING}}',
            '{{SHIPPING_PRICE}}',
            '{{TOTAL_PRICE}}',
            '{{ADDRESS_LINE_1}}',
            '{{ADDRESS_LINE_2}}',
            '{{CITY}}',
            '{{POSTCODE}}',
            '{{COUNTY}}',
            '{{COUNTRY}}'
        ],
        [
            htmlspecialchars(trim($order['name'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['order_id'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['item'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['filament_type1'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['filament_colour1'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['filament_type2'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['filament_colour2'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['finish'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['personalisation'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['style'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['quantity'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['price'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($shipping ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['shipping_price'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['total_price'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['address_line_1'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['address_line_2'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['city'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['postcode'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['county'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($order['country'] ?? ''), ENT_QUOTES, 'UTF-8')
        ],
        $html
    );

    $mail2->isHTML(true);
    $mail2->CharSet = 'UTF-8';
    $mail2->Encoding = 'quoted-printable';
    $mail2->Subject = "We've received your payment and your order is now being processed.";
    $mail2->Body = $body1;
    $mail2->AltBody = strip_tags($body1);
    
    $mail2->sign(
        '/home/www/Email Certificate/certificate.crt',
        '/home/www/Email Certificate/private.key',
        '',
        '/home/www/Email Certificate/ca-chain.crt'
    );

    $mail2->send();
}

http_response_code(200);

?>