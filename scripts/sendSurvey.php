<?php
header('Content-Type: text/plain');

require '/home/www/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$dotenv = Dotenv\Dotenv::createImmutable('/home/www/public/');
$dotenv->load();

if (!hash_equals($_ENV['CRON_SECRET'], $_GET['key'] ?? '')) {
    http_response_code(403);
    exit('Forbidden');
}

$surveyBase = $_ENV['SURVEY_LINK'];
$html = file_get_contents('/home/www/public/Email Templates/survey.html');

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$orders = $pdo->query("SELECT order_id, name, email FROM Orders WHERE status = 'Completed' AND delivered_at <= NOW() - INTERVAL 1 DAY AND delivered_at >= NOW() - INTERVAL 7 DAY AND survey_sent_at IS NULL")->fetchAll(PDO::FETCH_ASSOC);

foreach ($orders as $o) {
    $link = $surveyBase . '?order_id=' . urlencode($o['order_id']) . '&email=' . urlencode($o['email']);

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $_ENV['EMAIL_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['EMAIL_USERNAME_NOREPLY'];
    $mail->Password = $_ENV['EMAIL_PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;

    $mail->setFrom($_ENV['EMAIL_USERNAME_NOREPLY'], 'VoxForm No-Reply');
    $mail->addAddress($o['email']);
    $mail->addReplyTo($_ENV['EMAIL_USERNAME_CONTACT']);

    $body = str_replace(
        ['{{NAME}}', '{{ORDER_ID}}', '{{SURVEY_LINK}}'],
        [
            htmlspecialchars(trim($o['name'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($o['order_id'] ?? ''), ENT_QUOTES, 'UTF-8'),
            htmlspecialchars(trim($link), ENT_QUOTES, 'UTF-8')
        ],
        $html
    );

    $mail->Body = $body;
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'quoted-printable';
    $mail->Subject = "How Did Your VoxForm Order Go?";
    $mail->AltBody = strip_tags($body);

    $mail->sign(
        '/home/www/Email Certificate/certificate.crt',
        '/home/www/Email Certificate/private.key',
        '',
        '/home/www/Email Certificate/ca-chain.crt'
    );

    $mail->send();

    $pdo->prepare("UPDATE Orders SET survey_sent_at = NOW() WHERE order_id = ?")->execute([$o['order_id']]);
}

?>