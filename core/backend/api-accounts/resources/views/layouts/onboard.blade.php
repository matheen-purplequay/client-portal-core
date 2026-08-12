<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
        @vite(['resources/css/adminstyles.css'])

        <style>
            body {
                background: white;
                background-image: radial-gradient(rgba(0,0,0,0.1) 1px, transparent 0);
                background-size: 40px 40px;
                background-position: -19px -19px;
            }
            label {
                font-size: 12px;
                color: #777;
                font-weight: 500;
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen bg-gray-100 dark:bg-gray-900">

            <!-- Page Content -->
            <main>
                <!-- As a heading -->
                <nav class="navbar bg-body-tertiary border-bottom shadow-sm">
                    <div class="container">
                        <span class="navbar-brand mb-0 h1">
                            <img class='image logo-small' src="https://www.carisma-solutions.com.au/assets/img/icons/CS%20logo.png" alt="">
                        </span>
                    </div>
                </nav>
                <div class="container mt-3">
                    <div class="display-6 opacity-50">Onboarding Organization</div>
                </div>
                @yield('content')
            </main>
        </div>

        <script src="https://kit.fontawesome.com/4d763511d2.js" crossorigin="anonymous"></script>
    </body>
</html>
