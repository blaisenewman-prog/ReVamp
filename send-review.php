<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$configFile = __DIR__ . '/private/config.php';
$config = is_file($configFile) ? require $configFile : [];
$contactEmail = (string)($config['contact_email'] ?? 'pestoai.net@gmail.com');

function respond(int $status, bool $success, string $message): never {
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_line(string $value, int $max = 180): string {
    $value = trim(preg_replace('/[\r\n]+/', ' ', $value) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function clean_text(string $value, int $max = 5000): string {
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function smtp_read($socket, array $expected): string {
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $expected, true)) {
        throw new RuntimeException('SMTP server rejected the message.');
    }
    return $response;
}

function smtp_command($socket, string $command, array $expected): string {
    if (fwrite($socket, $command . "\r\n") === false) {
        throw new RuntimeException('Could not communicate with the mail server.');
    }
    return smtp_read($socket, $expected);
}

function send_via_smtp(array $smtp, string $to, string $subject, string $body, string $replyName, string $replyEmail): bool {
    $host = trim((string)($smtp['host'] ?? ''));
    $username = trim((string)($smtp['username'] ?? ''));
    $password = (string)($smtp['password'] ?? '');
    if ($host === '' || $username === '' || $password === '') {
        return false;
    }

    $port = max(1, (int)($smtp['port'] ?? 587));
    $encryption = strtolower((string)($smtp['encryption'] ?? 'tls'));
    $transport = $encryption === 'ssl' ? 'ssl://' : 'tcp://';
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
        ],
    ]);
    $socket = @stream_socket_client($transport . $host . ':' . $port, $errorNumber, $errorString, 15, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        throw new RuntimeException('Could not connect to the configured mail server.');
    }
    stream_set_timeout($socket, 20);

    try {
        smtp_read($socket, [220]);
        $serverName = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['SERVER_NAME'] ?? 'localhost')) ?: 'localhost';
        smtp_command($socket, 'EHLO ' . $serverName, [250]);

        if ($encryption === 'tls') {
            smtp_command($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Could not secure the connection to the mail server.');
            }
            smtp_command($socket, 'EHLO ' . $serverName, [250]);
        }

        smtp_command($socket, 'AUTH LOGIN', [334]);
        smtp_command($socket, base64_encode($username), [334]);
        smtp_command($socket, base64_encode($password), [235]);

        $fromEmail = trim((string)($smtp['from_email'] ?? '')) ?: $username;
        $fromName = clean_line((string)($smtp['from_name'] ?? 'PestoAi Website'), 100);
        smtp_command($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
        smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtp_command($socket, 'DATA', [354]);

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: ' . $fromName . ' <' . $fromEmail . '>',
            'To: <' . $to . '>',
            'Reply-To: ' . $replyName . ' <' . $replyEmail . '>',
            'Subject: ' . $encodedSubject,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];
        $normalisedBody = preg_replace("/\r\n|\r|\n/", "\r\n", $body) ?? $body;
        $normalisedBody = preg_replace('/^\./m', '..', $normalisedBody) ?? $normalisedBody;
        $message = implode("\r\n", $headers) . "\r\n\r\n" . $normalisedBody . "\r\n.";
        smtp_command($socket, $message, [250]);
        smtp_command($socket, 'QUIT', [221]);
        fclose($socket);
        return true;
    } catch (Throwable $error) {
        fclose($socket);
        throw $error;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Only POST requests are accepted.');
}

if (!empty($_POST['website'] ?? '')) {
    respond(200, true, 'Received.');
}

$name = clean_line((string)($_POST['name'] ?? ''), 100);
$email = clean_line((string)($_POST['email'] ?? ''), 180);
$company = clean_line((string)($_POST['company'] ?? ''), 140);
$projectUrl = clean_line((string)($_POST['project_url'] ?? ''), 500);
$problem = clean_text((string)($_POST['problem'] ?? ''), 5000);

if ($name === '' || $email === '' || $projectUrl === '' || $problem === '') {
    respond(422, false, 'Please complete every required field.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, false, 'Please enter a valid email address.');
}
if (!filter_var($projectUrl, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $projectUrl)) {
    respond(422, false, 'Please enter a complete website or repository URL beginning with http:// or https://.');
}

$subjectCompany = $company !== '' ? $company : $name;
$subject = 'PestoAi review request - ' . $subjectCompany;
$submittedAt = gmdate('Y-m-d H:i:s') . ' UTC';
$body = implode("\n", [
    'New PestoAi review request',
    '==========================',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Company: ' . ($company !== '' ? $company : 'Not provided'),
    'Website / repository: ' . $projectUrl,
    '',
    'Problem to review:',
    $problem,
    '',
    'Submitted: ' . $submittedAt,
]);

try {
    $smtp = is_array($config['smtp'] ?? null) ? $config['smtp'] : [];
    $sent = send_via_smtp($smtp, $contactEmail, $subject, $body, $name, $email);

    if (!$sent) {
        $host = strtolower((string)($_SERVER['SERVER_NAME'] ?? 'pestoai.local'));
        $host = preg_replace('/[^a-z0-9.-]/', '', $host) ?: 'pestoai.local';
        $host = preg_replace('/^www\./', '', $host) ?: 'pestoai.local';
        $from = 'no-reply@' . $host;
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'From: PestoAi Website <' . $from . '>',
            'Reply-To: ' . $name . ' <' . $email . '>',
            'X-Mailer: PHP/' . PHP_VERSION,
        ];
        $sent = @mail($contactEmail, $subject, $body, implode("\r\n", $headers));
    }

    if (!$sent) {
        respond(503, false, 'Automatic email delivery is not configured on this server.');
    }
    respond(200, true, 'Received. We will review it and get back in touch.');
} catch (Throwable $error) {
    error_log('PestoAi contact form: ' . $error->getMessage());
    respond(503, false, 'Automatic email delivery is temporarily unavailable.');
}
