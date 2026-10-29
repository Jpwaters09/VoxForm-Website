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

$data = json_decode(file_get_contents('php://input'), true);
$username = $data["curUsr"];
$month = $data["incomeDate"];

$webhook = $_ENV['DISCORD_PAIDMONTHS_WEBHOOK'];
discordRequest('POST', $webhook, ['content' => $username . " Paid Month Beginning " . $month]);

$stmt = $pdo->prepare("INSERT INTO `Paid Months` (date, paid_by) VALUES (?, ?)");
$stmt->execute([$month, $username]);

echo json_encode(['success' => true]);

?>