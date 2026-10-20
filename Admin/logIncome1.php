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

if ($_POST['id'] != "null") {
    $stmt = $pdo->prepare("UPDATE Income SET reference = ?, channel = ?, taker_partner = ?, order_type = ?, order_date = ?, description = ?, price_pence = ?, shipping_price_pence = ?, print_partner = ?, cost_pence = ?, profit_pence = ? WHERE id = ?");
    $stmt->execute([$_POST['reference'], $_POST['channel'], $_POST['took_by'], $_POST['order_type'], $_POST['order_date'], $_POST['description'], $_POST['item_price'], $_POST['shipping_price'], $_POST['printed_by'], $_POST['costs_price'], $_POST['profit'], $_POST['id']]);
}

else {
    $stmt = $pdo->prepare("INSERT INTO Income (reference, channel, taker_partner, order_type, order_date, description, price_pence, shipping_price_pence, print_partner, cost_pence, profit_pence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$_POST['reference'], $_POST['channel'], $_POST['took_by'], $_POST['order_type'], $_POST['order_date'], $_POST['description'], $_POST['item_price'], $_POST['shipping_price'], $_POST['printed_by'], $_POST['costs_price'], $_POST['profit']]);
}

echo json_encode(['success' => true]);

?>