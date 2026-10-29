<?php
session_start();

require '/home/www/vendor/autoload.php';

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    exit;
}

$dotenv = Dotenv\Dotenv::createImmutable('/home/www/public/');
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

function discordRequest(string $method, string $url, ?array $payload = null): array {
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $payload ? json_encode($payload) : null
    ]);

    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    return ['code' => $code, 'data' => $body ? json_decode($body, true) : null];
}

function formatPrice(int $pence): string {
    return '£' . number_format($pence / 100, 2);
}

$webhook = $_ENV['DISCORD_INCOME_WEBHOOK'];

if ($_POST['id'] != "null") {
    $stmt = $pdo->prepare("SELECT discord_message_id FROM Income WHERE id = ?");
    $stmt->execute([$_POST['id']]);
    $messageId = $stmt->fetchColumn();

    discordRequest('PATCH', "$webhook/messages/$messageId", ['content' => formatPrice($_POST['profit']) . " - " . $_POST['description'] . " - " . $_POST['channel']]);
    
    $stmt2 = $pdo->prepare("UPDATE Income SET reference = ?, channel = ?, taker_partner = ?, order_type = ?, order_date = ?, description = ?, price_pence = ?, shipping_price_pence = ?, print_partner = ?, cost_pence = ?, profit_pence = ? WHERE id = ?");
    $stmt2->execute([$_POST['reference'], $_POST['channel'], $_POST['took_by'], $_POST['order_type'], $_POST['order_date'], $_POST['description'], $_POST['item_price'], $_POST['shipping_price'], $_POST['printed_by'], $_POST['costs_price'], $_POST['profit'], $_POST['id']]);
}

else {
    $res = discordRequest('POST', "$webhook?wait=true", ['content' => formatPrice($_POST['profit']) . " - " . $_POST['description'] . " - " . $_POST['channel']]);
    $messageId = $res['data']['id'];

    $stmt = $pdo->prepare("INSERT INTO Income (reference, channel, taker_partner, order_type, order_date, description, price_pence, shipping_price_pence, print_partner, cost_pence, profit_pence, discord_message_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$_POST['reference'], $_POST['channel'], $_POST['took_by'], $_POST['order_type'], $_POST['order_date'], $_POST['description'], $_POST['item_price'], $_POST['shipping_price'], $_POST['printed_by'], $_POST['costs_price'], $_POST['profit'], $messageId]);
}

echo json_encode(['success' => true]);

?>