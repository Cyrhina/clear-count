<?php

use Illuminate\Routing\Route as LaravelRoute;
use Illuminate\Support\Facades\Route;

// Walks every registered route, so a new module's endpoints are checked without writing a test for it.

/** @return list<LaravelRoute> */
function apiRoutes(): array
{
    return array_values(array_filter(Route::getRoutes()->getRoutes(), fn (LaravelRoute $r) => str_starts_with($r->uri(), 'api/')));
}

function hasMiddleware(LaravelRoute $route, string $prefix): bool
{
    foreach ($route->gatherMiddleware() as $middleware) {
        if (is_string($middleware) && str_starts_with($middleware, $prefix)) {
            return true;
        }
    }

    return false;
}

test('there are api routes to check', function () {
    expect(apiRoutes())->not->toBeEmpty();
});

test('every api route requires a signed-in active user and a capability', function () {
    $unguarded = collect(apiRoutes())
        ->filter(fn (LaravelRoute $r) => ! (hasMiddleware($r, 'auth') && hasMiddleware($r, 'active') && hasMiddleware($r, 'permission:')))
        ->map(fn (LaravelRoute $r) => implode('|', $r->methods()).' '.$r->uri())
        ->values()
        ->all();

    expect($unguarded)->toBe([]);
});

test('every ops page route except forbidden requires a capability', function () {
    $unguarded = collect(Route::getRoutes()->getRoutes())
        ->filter(fn (LaravelRoute $r) => ($r->getAction('ops') ?? false) && $r->getName() !== 'forbidden')
        ->filter(fn (LaravelRoute $r) => ! hasMiddleware($r, 'permission:'))
        ->map(fn (LaravelRoute $r) => $r->uri())
        ->values()
        ->all();

    expect($unguarded)->toBe([]);
});

test('no two routes share a name, so php artisan route:cache (run on every deploy) works', function () {
    $names = collect(Illuminate\Support\Facades\Route::getRoutes()->getRoutes())->map(fn ($r) => $r->getName())->filter();

    expect($names->duplicates()->all())->toBe([]);
});
