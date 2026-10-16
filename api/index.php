<?php

/**
 * Vercel entrypoint for the Laravel app (served by the vercel-php runtime, see vercel.json).
 *
 * Vercel functions have a read-only filesystem except /tmp, so everything Laravel writes (storage, compiled views,
 * bootstrap caches) is pointed there. Nothing in /tmp survives a cold start or is shared between instances, so for
 * anything beyond a demo set DB_CONNECTION=pgsql (and DB_* values) in the Vercel project's environment variables.
 */

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/** Sets an environment value only when the Vercel project has not already defined it. */
$default = static function (string $key, string $value): void {
    if (getenv($key) === false && ! isset($_ENV[$key]) && ! isset($_SERVER[$key])) {
        putenv("{$key}={$value}");
        $_ENV[$key] = $_SERVER[$key] = $value;
    }
};

$tmp = '/tmp/laravel';
foreach (['storage/framework/cache/data', 'storage/framework/sessions', 'storage/framework/views', 'storage/logs', 'bootstrap/cache'] as $dir) {
    if (! is_dir("{$tmp}/{$dir}")) {
        mkdir("{$tmp}/{$dir}", 0777, true);
    }
}

$default('LARAVEL_STORAGE_PATH', "{$tmp}/storage");
$default('APP_SERVICES_CACHE', "{$tmp}/bootstrap/cache/services.php");
$default('APP_PACKAGES_CACHE', "{$tmp}/bootstrap/cache/packages.php");
$default('APP_CONFIG_CACHE', "{$tmp}/bootstrap/cache/config.php");
$default('APP_ROUTES_CACHE', "{$tmp}/bootstrap/cache/routes-v7.php");
$default('APP_EVENTS_CACHE', "{$tmp}/bootstrap/cache/events.php");
$default('VIEW_COMPILED_PATH', "{$tmp}/storage/framework/views");
$default('LOG_CHANNEL', 'stderr');

// Demo mode: with no database configured, use a throw-away SQLite file in /tmp. Every instance has its own copy, so
// sessions live in the cookie and there is no shared cache or queue.
$demoDatabase = getenv('DB_CONNECTION') === false || getenv('DB_CONNECTION') === 'sqlite';
if ($demoDatabase) {
    $default('DB_CONNECTION', 'sqlite');
    $default('DB_DATABASE', "{$tmp}/database.sqlite");
    $default('SESSION_DRIVER', 'cookie');
    $default('CACHE_STORE', 'array');
    $default('QUEUE_CONNECTION', 'sync');
}

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';

if ($demoDatabase && ! file_exists($database = getenv('DB_DATABASE'))) {
    touch($database);
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->call('migrate', ['--force' => true]);
    $kernel->call('db:seed', ['--force' => true]);
}

// Laravel can lose the original exception behind a "headers already sent" error here, so log it first.
try {
    $app->handleRequest(Request::capture());
} catch (Throwable $e) {
    error_log('[clear-count] '.$e::class.': '.$e->getMessage().' in '.$e->getFile().':'.$e->getLine());

    throw $e;
}
