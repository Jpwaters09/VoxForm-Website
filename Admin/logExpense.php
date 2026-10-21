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
    $stmt = $pdo->prepare("UPDATE Expenses SET expense_date = ?, category = ?, description = ?, amount_pence = ? WHERE id = ?");
    $stmt->execute([$_POST['expense_date'], $_POST['category'], $_POST['description'], $_POST['amount'], $_POST['id']]);
}

else {
    $stmt = $pdo->prepare("INSERT INTO Expenses (expense_date, category, description, amount_pence, created_by) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$_POST['expense_date'], $_POST['category'], $_POST['description'], $_POST['amount'], $_POST['created_by']]);
}

echo json_encode(['success' => true]);

?>