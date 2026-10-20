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

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$income = $pdo->query("SELECT * FROM Income ORDER BY order_date DESC")->fetchAll(PDO::FETCH_ASSOC);

$paidMonths = $pdo->query("SELECT * FROM `Paid Months` ORDER BY paid_at DESC")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([$income, $paidMonths]);