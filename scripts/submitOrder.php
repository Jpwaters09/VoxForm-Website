<?php
header('Content-Type: application/json');

require '/home/www/public/scripts/PHPMailer.php';
require '/home/www/public/scripts/SMTP.php';
require '/home/www/public/scripts/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

define('VT_API_KEY', $_ENV['VT_API_KEY']);
define('MAX_FILE_SIZE',       50 * 1024 * 1024);
define('ZIP_MAX_UNCOMPRESSED', 200 * 1024 * 1024);
define('ZIP_MAX_FILES',        500);
define('ZIP_MAX_RATIO',        100);

$ALLOWED_EXTENSIONS = ['stl', 'obj', '3mf', 'zip', 'stp', 'step'];
$ALLOWED_MIMES = [
    'stl'  => ['application/octet-stream', 'text/plain', 'model/stl', 'model/x.stl-binary', 'model/x.stl-ascii'],
    'obj'  => ['text/plain', 'application/octet-stream', 'model/obj'],
    '3mf'  => ['application/zip', 'application/octet-stream', 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml'],
    'zip'  => ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
    'stp'  => ['application/step', 'application/x-step', 'model/step', 'text/plain', 'application/octet-stream'],
    'step' => ['application/step', 'application/x-step', 'model/step', 'text/plain', 'application/octet-stream'],
];

function sanitiseFilename(string $name): string {
    $name = basename($name);
    $name = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $name);
    $name = preg_replace('/\.{2,}/', '.', $name);

    return $name ?: 'upload';
}

function getExtension(string $filename): string {
    return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
}

function validateExtension(string $filename, array $allowed): bool {
    return in_array(getExtension($filename), $allowed, true);
}

function validateMime(string $path, string $ext, array $allowedMimes): bool {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($path);
    $valid = $allowedMimes[$ext] ?? [];

    return in_array($mime, $valid, true);
}

function checkZipBomb(string $path): ?string {
    $zip = new ZipArchive();

    if ($zip->open($path) !== true) {
        return 'Could not open ZIP file.';
    }
 
    $fileCount = $zip->count();
    $totalUncompressed = 0;
 
    if ($fileCount > ZIP_MAX_FILES) {
        $zip->close();

        return "ZIP contains too many files ($fileCount; max " . ZIP_MAX_FILES . ").";
    }
 
    for ($i = 0; $i < $fileCount; $i++) {
        $stat = $zip->statIndex($i);
        $totalUncompressed += $stat['size'];
 
        if ($totalUncompressed > ZIP_MAX_UNCOMPRESSED) {
            $zip->close();
            $mb = round(ZIP_MAX_UNCOMPRESSED / 1024 / 1024);

            return "ZIP uncompressed content exceeds {$mb} MB limit.";
        }
    }
 
    $zip->close();
 
    $compressedSize = filesize($path);

    if ($compressedSize > 0) {
        $ratio = $totalUncompressed / $compressedSize;

        if ($ratio > ZIP_MAX_RATIO) {
            return "ZIP compression ratio ({$ratio}x) is suspiciously high.";
        }
    }
 
    return null;
}

function virusTotalHashCheck(string $path): string { 
    $hash = hash_file('sha256', $path);
    $url  = "https://www.virustotal.com/api/v3/files/$hash";
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => ["x-apikey: " . VT_API_KEY],
    ]);

    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);
 
    if ($status === 404) {
        return 'unknown';
    }
 
    if ($status !== 200 || !$body) {
        return 'error';
    }
 
    $data      = json_decode($body, true);
    $malicious = $data['data']['attributes']['last_analysis_stats']['malicious'] ?? 0;
 
    return ($malicious > 0) ? 'malicious' : 'clean';
}

function validateUpload(array $file, array $allowedExtensions, array $allowedMimes): ?string {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return 'File upload failed (error code ' . $file['error'] . ').';
    }
 
    if ($file['size'] > MAX_FILE_SIZE) {
        $mb = MAX_FILE_SIZE / 1024 / 1024;
        return "File exceeds maximum size of {$mb} MB.";
    }

    $safeName = sanitiseFilename($file['name']);
    $ext = getExtension($safeName);

    if (!validateExtension($safeName, $allowedExtensions)) {
        return "File type '.$ext' is not permitted. Accepted: " . implode(', ', $allowedExtensions) . '.';
    }
 
    if (!validateMime($file['tmp_name'], $ext, $allowedMimes)) {
        return "File content does not match the expected type for '.$ext'.";
    }

    if ($ext === 'zip' || $ext === '3mf') {
        $zipError = checkZipBomb($file['tmp_name']);

        if ($zipError !== null) {
            return "ZIP validation failed: $zipError";
        }
    }

    $vtResult = virusTotalHashCheck($file['tmp_name']);

    if ($vtResult === 'malicious') {
        return 'File was flagged as malicious by VirusTotal.';
    }

    return null;
}

function sendOrderToDiscord($order, $pdo) {
    $webhookurl = $_ENV['DISCORD_ORDERS_WEBHOOK'];

    $embed = [
        'title' => "New Order #{$order['id']} - Check VoxForm Contact email for more information",
        'color' => 0x00C8D4,
        'fields' => [
            [
                'name' => 'Name',
                'value' => $order['name'],
                'inline' => false
            ],
            [
                'name' => 'Email',
                'value' => $order['email'],
                'inline' => false
            ],
            [
                'name' => 'Item',
                'value' => $order['item'],
                'inline' => true
            ],
            [
                'name' => 'Quantity',
                'value' => $order['quantity'],
                'inline' => true
            ]
        ],
        'footer' => ['text' => 'VoxForm Orders'],
        'timestamp' => date('c')
    ];

    $payload = json_encode([
        'username' => 'VoxForm Orders',
        'thread_name' => "New Order #{$order['id']}",
        'embeds' => [$embed]
    ]);

    $ch = curl_init($webhookurl . '?wait=true');

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    $data = json_decode($response, true);
    $threadId = $data['channel_id'] ?? null;

    if ($threadId) {
        $stmt = $pdo->prepare("UPDATE Orders SET discord_thread_id = ? WHERE order_id = ?");
        $stmt->execute([$threadId, $order['id']]);
    }

    $webhookurl1 = $_ENV['DISCORD_NOTIFICATIONS_WEBHOOK'];

    $payload1 = json_encode([
        'content' => "New order #{$order['id']}: <#{$threadId}>"
    ]);

    $ch1 = curl_init($webhookurl1);

    curl_setopt($ch1, CURLOPT_POST, true);
    curl_setopt($ch1, CURLOPT_POSTFIELDS, $payload1);
    curl_setopt($ch1, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

    $response1 = curl_exec($ch1);
    $httpCode1 = curl_getinfo($ch1, CURLINFO_HTTP_CODE);

    curl_close($ch1);
}

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$sql = "INSERT INTO Orders 
    (name, address_line_1, address_line_2, email, postcode, county, country, item, filament_type1, filament_type2, filament_colour1, filament_colour2, status, city, personalisation, style, quantity, price, finish, extra_info, shipping, phone, social_media_consent)
    VALUES 
    (:name, :address_line_1, :address_line_2, :email, :postcode, :county, :country, :item, :filament_type1, :filament_type2, :filament_colour1, :filament_colour2, 'Pending', :city, :personalisation, :style, :quantity, :price, :finish, :extra_info, :shipping, :phone, :social_media_consent)";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':name' => $_POST['name'],
    ':address_line_1' => $_POST['address_line_1'],
    ':address_line_2' => $_POST['address_line_2'] ?? null,
    ':email' => $_POST['email'],
    ':postcode' => $_POST['postcode'],
    ':county' => $_POST['county'],
    ':country' => $_POST['country'],
    ':item' => $_POST['item'],
    ':filament_type1' => $_POST['filament_type1'] ?? null,
    ':filament_type2' => $_POST['filament_type2'] ?? null,
    ':filament_colour1' => $_POST['filament_colour1'] ?? null,
    ':filament_colour2' => $_POST['filament_colour2'] ?? null,
    ':city' => $_POST['city'],
    ':personalisation' => $_POST['personalisation'] ?? null,
    ':style' => $_POST['style'] ?? null,
    ':quantity' => $_POST['quantity'],
    ':price' => $_POST['price'] ?? null,
    ':finish' => $_POST['finish'] ?? null,
    ':extra_info' => $_POST['extra_info'] ?? null,
    ':shipping' => $_POST['shipping'] ?? null,
    ':phone' => $_POST['phone'],
    ':social_media_consent' => $_POST['social_media_consent'] ?? null
]);

$order_id = $pdo->lastInsertId();

$model_file = null;

if (isset($_FILES['model_file']) && $_FILES['model_file']['error'] === UPLOAD_ERR_OK) {
    $scanError = validateUpload($_FILES['model_file'], $ALLOWED_EXTENSIONS, $ALLOWED_MIMES);

    if ($scanError !== null) {
        $pdo->prepare("DELETE FROM Orders WHERE order_id = :order_id")
            ->execute([':order_id' => $order_id]);
 
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => $scanError]);
        exit;
    }

    $safeName = sanitiseFilename($_FILES['model_file']['name']);
    $upload_dir = '/home/www/public/Uploads/order_' . $order_id . '/';

    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $filepath = $upload_dir . $safeName;
    move_uploaded_file($_FILES['model_file']['tmp_name'], $filepath);
    $model_file = $filepath;

    $update = $pdo->prepare("UPDATE Orders SET model_file = :model_file WHERE order_id = :order_id");
    $update->execute([
        ':model_file' => $model_file,
        ':order_id'   => $order_id,
    ]);
}

$shipping = $_POST['shipping'];

if ($shipping === 'RMT24') {
    $shipping = 'Royal Mail Tracked 24';
}

if ($shipping === 'RMT48') {
    $shipping = 'Royal Mail Tracked 48';
}

if ($shipping === 'YODEL') {
    $shipping = 'Yodel';
}

$body  = "A new order has been submitted.\n\n";
$body .= "ORDER DETAILS\n";
$body .= "----------------------------------------\n";
$body .= "Order ID: #$order_id\n";
if ($_POST['social_media_consent']) {
    $body .= "Status: Pending\n";
    $body .= "Social Media Consent: {$_POST['social_media_consent']}\n\n";
}

else {
    $body .= "Status: Pending\n\n";
}

$body .= "CUSTOMER\n";
$body .= "----------------------------------------\n";
$body .= "Name: {$_POST['name']}\n";
$body .= "Email: {$_POST['email']}\n";
$body .= "Phone: {$_POST['phone']}\n\n";

$body .= "DELIVERY\n";
$body .= "----------------------------------------\n";
$body .= "Shipping Method: {$shipping}\n";
$body .= "Address Line 1: {$_POST['address_line_1']}\n";
if (!empty($_POST['address_line_2'])) {
    $body .= "Address Line 2: {$_POST['address_line_2']}\n";
}
$body .= "City: {$_POST['city']}\n";
$body .= "County: {$_POST['county']}\n";
$body .= "Postcode: {$_POST['postcode']}\n";
$body .= "Country: {$_POST['country']}\n\n";

$body .= "ITEM\n";
$body .= "----------------------------------------\n";
$body .= "Item: {$_POST['item']}\n";
$body .= "Quantity: {$_POST['quantity']}\n";
if (!empty($_POST['style'])) {
    $body .= "Style: {$_POST['style']}\n";
}
if (!empty($_POST['personalisation'])) {
    $body .= "Personalisation: {$_POST['personalisation']}\n";
}
if (!empty($_POST['finish'])) {
    $body .= "Finish: {$_POST['finish']}\n";
}

if (!empty($_POST['filament_type1'])) {
    $body .= "\nFILAMENT\n";
    $body .= "----------------------------------------\n";
    if (!empty($_POST['filament_type1'])) {
        $body .= "Type 1: {$_POST['filament_type1']}\n";
    }
    if (!empty($_POST['filament_colour1'])) {
        $body .= "Colour 1: {$_POST['filament_colour1']}\n";
    }
    if (!empty($_POST['filament_type2'])) {
        $body .= "Type 2: {$_POST['filament_type2']}\n";
    }
    if (!empty($_POST['filament_colour2'])) {
        $body .= "Colour 2: {$_POST['filament_colour2']}\n";
    }
}

if ($model_file) {
    $body .= "\nMODEL FILE\n";
    $body .= "----------------------------------------\n";
    $body .= "File: $model_file\n";
}

if (!empty($_POST['extra_info'])) {
    $body .= "\nEXTRA INFO\n";
    $body .= "----------------------------------------\n";
    $body .= "{$_POST['extra_info']}\n";
}

$mail1 = new PHPMailer(true);
$mail1->isSMTP();
$mail1->Host = $_ENV['EMAIL_HOST'];
$mail1->SMTPAuth = true;
$mail1->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
$mail1->Password = $_ENV['EMAIL_PASSWORD'];
$mail1->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail1->Port = 465;

$mail1->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
$mail1->addAddress($_ENV['EMAIL_USERNAME_CONTACT']);
$mail1->addReplyTo($_POST['email']);

$mail1->CharSet = 'UTF-8';
$mail1->Encoding = 'quoted-printable';
$mail1->Subject = "New Order #$order_id";
$mail1->Body = $body;

$mail1->sign(
    '/home/www/Email Certificate/certificate.crt',
    '/home/www/Email Certificate/private.key',
    '',
    '/home/www/Email Certificate/ca-chain.crt'
);

$mail1->send();

$mail2 = new PHPMailer(true);
$mail2->isSMTP();
$mail2->Host = $_ENV['EMAIL_HOST'];
$mail2->SMTPAuth = true;
$mail2->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
$mail2->Password = $_ENV['EMAIL_PASSWORD'];
$mail2->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail2->Port = 465;

$mail2->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
$mail2->addAddress($order['email']);
$mail2->addReplyTo($_ENV['EMAIL_USERNAME_CONTACT']);

$html = file_get_contents('/home/www/public/Email Templates/submitOrder.html');

$body = str_replace(
    ['{{NAME}}', '{{ORDER_ID}}'],
    [
        htmlspecialchars(trim($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8'),
        htmlspecialchars(trim($order_id ?? ''), ENT_QUOTES, 'UTF-8')
    ],
    $html
);

$mail2->isHTML(true);
$mail2->CharSet = 'UTF-8';
$mail2->Encoding = 'quoted-printable';
$mail2->Subject = "We've received your quote - we'll be in touch soon";
$mail2->Body = $body;
$mail2->AltBody = strip_tags($body);

$mail2->sign(
    '/home/www/Email Certificate/certificate.crt',
    '/home/www/Email Certificate/private.key',
    '',
    '/home/www/Email Certificate/ca-chain.crt'
);

$mail2->send();

sendOrderToDiscord([
    'id' => $order_id,
    'name' => $_POST['name'],
    'email' => $_POST['email'],
    'item' => $_POST['item'],
    'quantity' => $_POST['quantity']
], $pdo);

echo json_encode(['success' => true, 'order_id' => $order_id]);

?>