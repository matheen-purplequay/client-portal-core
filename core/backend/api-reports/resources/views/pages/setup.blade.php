@extends('layouts.master')

@section('styles')
<style>
    .prompt {
        color: #63de00;
    }

    .cursor-blink::after {
        content: "";
        margin-left: 5px;
        top: 0;
        right: -0;
        /* Remove display: inline-block if not required to be on the same line as text etc */
        display: inline-block;
        background-color: green;
        vertical-align: top;
        width: 10px;
        /* Set height to the line height of .text */
        height: 24px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 1px;
        /* 
        Animation paramaters:
        blink = animation-name, 
        1s = animation-duration, 
        step-end = animation-timing-function,
        infinite = animation-iteration-count
        */
        -webkit-animation: blink 1s step-end infinite;
        animation: blink 1s step-end infinite;
    }

    @-webkit-keyframes blink {
        0% {
            opacity: 1.0;
            box-shadow: 0 0 2px green;
        }

        50% {
            opacity: 0.0;
            box-shadow: 0 0 0 transparent;
        }

        100% {
            opacity: 1.0;
            box-shadow: 0 0 2px green;
        }
    }

    @keyframes blink {
        0% {
            opacity: 1.0;
            box-shadow: 0 0 2px green;
        }

        50% {
            opacity: 0.0;
            box-shadow: 0 0 0 transparent;
        }

        100% {
            opacity: 1.0;
            box-shadow: 0 0 2px green;
        }
    }
</style>
@endsection

@section('content')

<div class="vstack align-items-start justify-content-center h-100 mt-5">
    <img style="height: 32px; width: auto;" src="https://purplequay.com.au/img/pqLogo/PQ%20LOGO.png" alt="">
    <h1 style="margin: 0px;">PQ Suite</h1>
    <h3 style="margin: 0px;">Super Admin Configuration Status</h3>


    <nav class="navbar navbar-expand-lg bg-light my-3 rounded">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle hstack gap-1 align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="material-symbols-outlined">database</span>    
                            Database
                        </a>
                        <ul class="dropdown-menu shadow-lg">
                            <li><a class="dropdown-item" href="/setup/wipe">Wipe all data</a></li>
                            <li><a class="dropdown-item" href="/setup/seed">Add test data</a></li>
                            <li><a class="dropdown-item" href="/setup/backup">Backup database</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="card mt-4 bg-dark shadow-input-2 color-success">
        <div class="card-body">
            @include('partials.setup.status', ['activity' => $activity])
        </div>
    </div>
</div>

@endsection