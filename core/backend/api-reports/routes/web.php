<?php

use App\Models\ConnectReports;
use App\Models\holidays;
use App\Models\Reports;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\WeeklyReports;
use App\Models\Newsletters;
use Carbon\Carbon;
use App\Http\Controllers\ConnectReportsController;
use App\Http\Controllers\ExcelController;
use App\Providers\RouteServiceProvider;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Guest user home route
Route::middleware('guest')->get('/', function() {
    return redirect('/login');
});

// Authenticated user home route
Route::middleware('auth:sanctum')->get('/', function() {
    return redirect('/reports');
});

Route::middleware('guest')->post('/auth/login', function(Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');
    if (Auth::attempt(['email' => $email, 'password' => $password])) {
        $user = Auth::user();
        $token = $user->createToken('authToken')->plainTextToken;
        $userdata = [ 
            'token' => $token, 
            'user' => [
                'email' => $email,
                'user_id' => $user->id, 
                'first_name' => $user->first_name, 
                'middle_name' => $user->middle_name, 
                'last_name' => $user->last_name
            ]
        ];
        // Generate a random 4-digit OTP
        $otp = rand(1000, 9999);

        // Get the customer's email address from the request or your database
        $email = $request->input('email'); 

        // Send the OTP to the customer's email
        try{
            // Mail::to($email)->send(new SendOtpMail($otp));
            $user->otp = $otp;
            $user->otp_verified = false;
            $user->save();
            return response($userdata, 200)->header('Content-Type', 'text/plain');
        } catch(Exception $exception) {
            return ["No token", $email];
        }

        // return $userdata;
    } else return ["No token", $email];

})->name('auth.login');

Route::middleware(['auth:sanctum'])->group(function() {
    // Reports
    Route::get('/reports', function() {
        return view('pages.reports');
    });
});

// Setup Databaes
Route::get('/setup/{activity}', function($activity) {  
    try {
        if($activity == 'wipe') Artisan::call('db:wipe');
        elseif($activity == 'seed') {
            Artisan::call('migrate');
            Artisan::call('db:seed');
        }
        elseif($activity == 'reset') {
            Artisan::call('db:wipe');
            Artisan::call('migrate');
            Artisan::call('db:seed');
        }
        return view('pages.setup')->with(compact('activity'));
    } catch (Exception $e) {
        return throw $e;
    }
});

Route::get('/set-token/{token}/{id}', function ($token, $id) {
    $session = new App\Models\Session;
    $session->token = $token;
    $session->user_id = $id;
    $session->save();

    return ['token saved'];
});


// admin routes

// Clear Cache and Config
Route::get('/admin/clear', function() {  
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    
    return "Cache and config are cleared";
});



Route::resource('reports', 'App\Http\Controllers\ConnectReportsController');
Route::post('reports/filter', 'App\Http\Controllers\ConnectReportsController@index')->name('reports.filter');
Route::get('reports/filter', 'App\Http\Controllers\ConnectReportsController@index')->name('reports.filter');
Route::post('reports/approve', 'App\Http\Controllers\ConnectReportsController@approve')->name('reports.approve');
Route::post('upload-excel', 'App\Http\Controllers\ExcelController@upload')->name('excel.upload');
Route::resource('agreed', 'App\Http\Controllers\AgreedController');

require __DIR__.'/auth.php';





