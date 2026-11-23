<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

Route::get('/', function () {
    return view('welcome');
});

/**
 * Rota de proxy para servir arquivos do storage com cabeçalhos CORS corretos.
 * Necessário para o `php artisan serve` (built-in PHP ignora .htaccess).
 */
Route::get('/storage/{path}', function (string $path) {
    // Bloqueia tentativas de path traversal
    if (str_contains($path, '..')) {
        abort(403);
    }

    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }

    $content  = Storage::disk('public')->get($path);
    $mimeType = Storage::disk('public')->mimeType($path);

    return response($content, Response::HTTP_OK)
        ->header('Content-Type',                $mimeType)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Cache-Control',               'public, max-age=86400');
})->where('path', '.+');
