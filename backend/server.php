<?php

/**
 * Custom PHP built-in server router para `php artisan serve`.
 * Injeta cabeçalhos CORS em arquivos de storage (imagens, etc.)
 * antes que o servidor os sirva diretamente.
 *
 * Uso: php -S 127.0.0.1:8000 server.php
 * O artisan serve usa automaticamente este arquivo se estiver na raiz.
 */

$publicPath = __DIR__ . '/public';

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

$filePath = $publicPath . $uri;

// Se for um arquivo de storage existente, injeta CORS e serve
if ($uri !== '/' && file_exists($filePath) && is_file($filePath)) {
    // Injetar CORS para imagens do storage
    if (str_starts_with($uri, '/storage/')) {
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'svg'  => 'image/svg+xml',
            'pdf'  => 'application/pdf',
        ];

        if (isset($mimeTypes[$ext])) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
            header('Access-Control-Allow-Headers: *');
            header('Content-Type: ' . $mimeTypes[$ext]);
            header('Cache-Control: public, max-age=86400');
            readfile($filePath);
            exit;
        }
    }

    // Para outros arquivos estáticos (CSS, JS), serve normalmente
    return false;
}

// Para rotas dinâmicas, passa para o Laravel
$formattedDateTime = date('D M j H:i:s Y');
$requestMethod     = $_SERVER['REQUEST_METHOD'];
$remoteAddress     = $_SERVER['REMOTE_ADDR'] . ':' . $_SERVER['REMOTE_PORT'];

file_put_contents('php://stdout', "[$formattedDateTime] $remoteAddress [$requestMethod] URI: $uri\n");

require_once $publicPath . '/index.php';

