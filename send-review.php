<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const REVIEW_EMAIL = 'blaisenewman@gmail.com';

function respond(int $status, bool $success, string $message): never {
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_line(string $value, int $max = 180): string {
    $value = trim(preg_replace('/[\r\n]+/', ' ', $value) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function clean_text(string $value, int $max = 4000): string {
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Only POST requests are accepted.');
}

// Honeypot field: bots commonly fill hidden inputs.
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
$ip = clean_line((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 80);
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
    'IP: ' . $ip,
]);

$host = strtolower((string)($_SERVER['SERVER_NAME'] ?? 'sybix.com'));
$host = preg_replace('/[^a-z0-9.-]/', '', $host) ?: 'sybix.com';
$host = preg_replace('/^www\./', '', $host) ?: 'sybix.com';
$from = 'no-reply@' . $host;

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: PestoAi Website <' . $from . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail(REVIEW_EMAIL, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(500, false, 'The message could not be sent by this server.');
}

respond(200, true, 'Received. We will review it and get back in touch.');
