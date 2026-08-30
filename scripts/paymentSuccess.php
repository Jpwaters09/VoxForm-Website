<?php
header('Content-Type: application/json');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$intentId = $_GET['payment_intent'] ?? '';

if (!$intentId) {
    echo json_encode(['error' => true]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM Orders WHERE payment_intent_id = ?");
$stmt->execute([$intentId]);

$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    echo json_encode(['error' => true]);
    exit;
}

echo json_encode([
    'orderID' => $order['order_id'],
    'email' => $order['email']
]);

?>