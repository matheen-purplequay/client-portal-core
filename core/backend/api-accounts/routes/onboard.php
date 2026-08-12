<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::redirect('/onboard', '/onboard/org-setup');

Route::prefix('onboard')->group(function() {

    Route::post('/form/validate', function(Request $request) {
        return redirect('/onboard/users');
    });

    Route::get('/org-setup', function() {
        return view('onboard.org-setup');
    });

    Route::get('/users', function() {
        return view('onboard.users');
    });

});
