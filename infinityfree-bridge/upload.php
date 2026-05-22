<?php
/**
 * Качване на снимки на InfinityFree (за Vercel admin)
 * URL: https://твоят-сайт.infinityfreeapp.com/db-bridge/upload.php
 */
header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Missing config.php']);
    exit;
}

$config = require $configFile;

$key = $_POST['key'] ?? '';
if (!hash_equals($config['api_key'], $key)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$maxSize = 8 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Max 8 MB']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mime, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid image type']);
    exit;
}

$uploadDir = dirname(__DIR__) . '/uploads/properties';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'webp';
$ext = preg_replace('/[^a-z0-9]/i', '', $ext);
if ($ext === '') $ext = 'webp';

$fileName = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$dest = $uploadDir . '/' . $fileName;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Save failed']);
    exit;
}

$baseUrl = rtrim($config['public_url'] ?? '', '/');
$path = '/uploads/properties/' . $fileName;
$url = $baseUrl ? ($baseUrl . $path) : $path;

echo json_encode([
    'success' => true,
    'url'     => $url,
    'path'    => $path,
]);
