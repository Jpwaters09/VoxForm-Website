<?php
require '/home/www/vendor/autoload.php';

header('Content-Type: application/json');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$orderID = $_GET['order_id'] ?? '';
$email   = $_GET['email'] ?? '';

if (!$orderID || !$email) {
    echo json_encode(['error' => true]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM Orders WHERE order_id = ? AND email = ? AND status = 'Confirmed'");
$stmt->execute([$orderID, $email]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    echo json_encode(['error' => true]);
    exit;
}

\Stripe\Stripe::setApiKey($_ENV['STRIPE_MAIN_API']); // Main Mode
// \Stripe\Stripe::setApiKey($_ENV['STRIPE_TEST_API']); // Test Mode

$existing = \Stripe\Customer::search(['query' => "email:'$email'"]);

if (count($existing->data) > 0 && !$existing->data[0]->deleted) {
    $customer = $existing->data[0];
}

else {
    $customer = \Stripe\Customer::create(['name' => $order['name'], 'email' => $email]);
}

if (count($existing->data) > 0) {
    $retrieved = \Stripe\Customer::retrieve($existing->data[0]->id);
    if (!$retrieved->deleted) {
        $customer = $retrieved;
    }
}

if (!$customer) {
    $customer = \Stripe\Customer::create([
        'name' => $order['name'],
        'email' => $email
    ]);
}

$intent = \Stripe\PaymentIntent::create([
    'amount' => (int) ($order['total_price'] * 100),
    'currency' => 'gbp',
    'customer' => $customer->id,
    'description' => $order['item'],
    'metadata' => ['order_id' => $orderID],
    'receipt_email' => $email
]);

$pdo->prepare("UPDATE Orders SET payment_intent_id = ? WHERE order_id = ?")
    ->execute([$intent->id, $orderID]);

echo json_encode([
    'clientSecret' => $intent->client_secret,
    'itemName' => $order['item'],
    'totalPrice' => $order['total_price'],
    'price' => $order['price'],
    'shippingPrice' => $order['shipping_price'],
    'quantity' => $order['quantity'],
    'shipping' => $order['shipping']
]);

?>