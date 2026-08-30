<?php
session_start();

require '/home/www/vendor/autoload.php';

header('Content-Type: application/json');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    exit;
}

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$u = $_SESSION['username'];
$isManager = $_SESSION['role'] === 'manager';

if ($isManager) {
    $stmt = $pdo->prepare("SELECT * FROM Orders");
    $stmt->execute();
}

else {
    $stmt = $pdo->prepare("SELECT * FROM Orders WHERE assignee = ? OR status = 'Completed'");
    $stmt->execute([$u]);
}

$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($orders);

?>