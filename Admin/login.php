<?php
session_start();

require '/home/www/vendor/autoload.php';

header('Content-Type: application/json');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$users = [
    $_ENV['USER1'] => ['password' => $_ENV['USER1_PASS'], 'role' => 'manager'],
    $_ENV['USER2'] => ['password' => $_ENV['USER2_PASS'], 'role' => 'worker']
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'loggedIn' => isset($_SESSION['username']),
        'username' => $_SESSION['username'] ?? null,
        'isManager' => $_SESSION['role'] === 'manager'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$u = $data['username'];
$p = $data['password'];

if (isset($users[$u]) && $users[$u]['password'] === $p) {
    session_regenerate_id(true);
    $_SESSION['username'] = $u;
    $_SESSION['role'] = $users[$u]['role'];
    echo json_encode(['success' => true]);
}

else {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
}

?>