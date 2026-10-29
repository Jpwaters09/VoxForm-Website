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

$webhook = $_ENV['DISCORD_EXPENSES_WEBHOOK'];

if ($_POST['id'] != "null") {
    $stmt = $pdo->prepare("SELECT discord_message_id FROM Expenses WHERE id = ?");
    $stmt->execute([$_POST['id']]);
    $messageId = $stmt->fetchColumn();

    discordRequest('PATCH', "$webhook/messages/$messageId", ['content' => formatPrice($_POST['amount']) . " - " . $_POST['description'] . " - " . $_POST['category']]);

    $stmt = $pdo->prepare("UPDATE Expenses SET expense_date = ?, category = ?, description = ?, amount_pence = ? WHERE id = ?");
    $stmt->execute([$_POST['expense_date'], $_POST['category'], $_POST['description'], $_POST['amount'], $_POST['id']]);
}

else {
    $res = discordRequest('POST', "$webhook?wait=true", ['content' => formatPrice($_POST['amount']) . " - " . $_POST['description'] . " - " . $_POST['category']]);
    $messageId = $res['data']['id'];

    $stmt = $pdo->prepare("INSERT INTO Expenses (expense_date, category, description, amount_pence, created_by, discord_message_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$_POST['expense_date'], $_POST['category'], $_POST['description'], $_POST['amount'], $_POST['created_by'], $messageId]);
}

echo json_encode(['success' => true]);

?>