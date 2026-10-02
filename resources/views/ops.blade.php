<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="/ops-favicon.svg" type="image/svg+xml">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <script>
            (function () {
                try {
                    var raw = localStorage.getItem('fbs-ops-theme');
                    var theme = raw ? JSON.parse(raw).state.theme : null;
                    if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {}
            })();
        </script>
        @viteReactRefresh
        @vite(['resources/css/ops.css', 'resources/js/ops-app.tsx'])
        <x-inertia::head>
            <title>FBS OPS</title>
        </x-inertia::head>
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
