<?php
/**
 * DB Bridge за InfinityFree — Vercel → HTTP → MySQL (локално на хостинга)
 *
 * Качи цялата папка db-bridge/ в htdocs/ на InfinityFree:
 *   https://твоят-сайт.infinityfreeapp.com/db-bridge/api.php
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Липсва config.php']);
    exit;
}

$config = require $configFile;

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$key = $body['key'] ?? '';
if (!hash_equals($config['api_key'], $key)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$action = $body['action'] ?? '';

if ($action === 'create_table') {
    $tableName = preg_replace('/[^a-zA-Z0-9_]/', '', $body['table'] ?? '');
    $allowed = ['crm_messages', 'broker_restrictions'];

    if (!in_array($tableName, $allowed, true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Table not in whitelist']);
        exit;
    }

    $sqls = [
        'crm_messages' =>
            "CREATE TABLE IF NOT EXISTS crm_messages (
              id INT AUTO_INCREMENT PRIMARY KEY,
              sender_id INT NOT NULL DEFAULT 1,
              sender_name VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'broker_restrictions' =>
            "CREATE TABLE IF NOT EXISTS broker_restrictions (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              page_slug VARCHAR(100) NOT NULL,
              UNIQUE KEY uq_br (user_id, page_slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    ];

    try {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']);
        $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $pdo->exec($sqls[$tableName]);
        echo json_encode(['success' => true]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'DB error']);
    }
    exit;
}

// Avatar URL column (ALTER TABLE — safe to run multiple times)
if ($action === 'add_avatar_column') {
    try {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']);
        $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        // Check if column already exists
        $stmt = $pdo->prepare("SHOW COLUMNS FROM users LIKE 'avatar_url'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL");
        }
        echo json_encode(['success' => true]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'DB error']);
    }
    exit;
}

if ($action === 'upload_chunk') {
    $uploadId    = preg_replace('/[^a-zA-Z0-9_-]/', '', $body['uploadId'] ?? '');
    $chunkIndex  = (int)($body['chunkIndex'] ?? -1);
    $totalChunks = (int)($body['totalChunks'] ?? 0);
    $data        = $body['data'] ?? '';
    $fileName    = basename($body['fileName'] ?? 'photo.webp');
    $fileName    = preg_replace('/[^a-zA-Z0-9._-]/', '', $fileName);
    if ($fileName === '') $fileName = 'photo.webp';

    if ($uploadId === '' || $chunkIndex < 0 || $totalChunks < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing chunk params']);
        exit;
    }
    if ($data === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Empty chunk data']);
        exit;
    }

    $chunk = base64_decode($data, true);
    if ($chunk === false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid base64 chunk']);
        exit;
    }

    $tmpBase = dirname(__DIR__) . '/uploads/tmp';
    $tmpDir  = $tmpBase . '/' . $uploadId;
    if (!is_dir($tmpDir)) {
        mkdir($tmpDir, 0755, true);
    }

    file_put_contents($tmpDir . '/chunk_' . $chunkIndex, $chunk);

    // Not the last chunk — acknowledge and wait
    if ($chunkIndex < $totalChunks - 1) {
        echo json_encode(['success' => true, 'partial' => true, 'chunkIndex' => $chunkIndex]);
        exit;
    }

    // Last chunk received — reassemble
    $assembled = '';
    for ($i = 0; $i < $totalChunks; $i++) {
        $cf = $tmpDir . '/chunk_' . $i;
        if (!file_exists($cf)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => "Missing chunk $i"]);
            exit;
        }
        $assembled .= file_get_contents($cf);
    }

    // Clean up temp chunks
    foreach (glob($tmpDir . '/*') as $f) { @unlink($f); }
    @rmdir($tmpDir);

    // Clean up old temp dirs (> 1 hour)
    if (is_dir($tmpBase)) {
        foreach (scandir($tmpBase) as $d) {
            if ($d === '.' || $d === '..') continue;
            $dp = $tmpBase . '/' . $d;
            if (is_dir($dp) && (time() - filemtime($dp)) > 3600) {
                foreach (glob($dp . '/*') as $f) { @unlink($f); }
                @rmdir($dp);
            }
        }
    }

    $maxSize = 8 * 1024 * 1024;
    if (strlen($assembled) > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Max 8 MB']);
        exit;
    }

    // Verify MIME
    $tmp = tempnam(sys_get_temp_dir(), 'up');
    file_put_contents($tmp, $assembled);
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($tmp);
    unlink($tmp);

    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-webp'];
    if (!in_array($mime, $allowed, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid image type']);
        exit;
    }

    $uploadDir = dirname(__DIR__) . '/uploads/properties';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) $ext = 'webp';
    if ($ext === 'jpeg') $ext = 'jpg';

    $safeName = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest     = $uploadDir . '/' . $safeName;

    if (file_put_contents($dest, $assembled) === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Save failed']);
        exit;
    }

    $baseUrl = rtrim($config['public_url'] ?? '', '/');
    $path    = '/uploads/properties/' . $safeName;
    $url     = $baseUrl ? ($baseUrl . $path) : $path;

    echo json_encode(['success' => true, 'url' => $url, 'path' => $path]);
    exit;
}

$sql    = trim($body['sql'] ?? '');
$params = $body['params'] ?? [];

if (!in_array($action, ['query', 'execute'], true) || $sql === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid action or sql']);
    exit;
}

// Блокирай опасни заявки
$upper = strtoupper(ltrim($sql));
$blocked = ['DROP ', 'TRUNCATE ', 'ALTER ', 'CREATE ', 'GRANT ', 'REVOKE '];
foreach ($blocked as $word) {
    if (str_starts_with($upper, $word)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden SQL']);
        exit;
    }
}

if ($action === 'query' && !preg_match('/^\s*(SELECT|SHOW|DESCRIBE|EXPLAIN)\s/i', $sql)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'query action requires SELECT']);
    exit;
}

if ($action === 'execute' && !preg_match('/^\s*(INSERT|UPDATE|DELETE|REPLACE)\s/i', $sql)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'execute action requires INSERT/UPDATE/DELETE']);
    exit;
}

if (!is_array($params)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'params must be array']);
    exit;
}

try {
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_name']
    );
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($action === 'query') {
        echo json_encode(['success' => true, 'rows' => $stmt->fetchAll()]);
        exit;
    }

    echo json_encode([
        'success'         => true,
        'insertId'        => (int) $pdo->lastInsertId(),
        'affectedRows'    => $stmt->rowCount(),
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
