<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OtpController;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Mail\SendOtpMail;
use App\Models\Company;
use App\Models\UserDetails;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\CompaniesController;
use App\Mail\SendMessage;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::middleware('guest')->get('/', function () {
    return redirect('/');
    
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::post('/generate-otp', [OtpController::class, 'generateAndSendOtp'])->name('generate-otp');

// Admin Routes
Route::prefix('admin')->group(function() {
    Route::get('/client-chooser', function() {
        $companies = Company::all();
        return view('pages.admin.companies.companies-list')->with(compact('companies'));
    });

    Route::get('/choose-client/{id}', function($id) {
        $company = Company::where('id', $id)->first();
        session(['selected_client' => $company]);
        return redirect('/admin/dashboard');
    });

    Route::get('/dashboard', function () {
        if(Session::has('selected_client')) {
            return view('pages.admin.dashboard');
        } else {
            return redirect('/admin/client-chooser');
        }
    })->middleware(['auth', 'verified'])->name('dashboard');    

    Route::get('/dbmanage', function() {
        return view('pages.admin.database.setup');
    });

    Route::get('super', function() {
        $role = Role::where('name', 'super')->first();
        $user = User::where('id', 1)->first();
        $user->assignRole($role);
        $user->save();
        // $usersWithAdminRole = $adminRole->users()->get();

        return $user;
    });

    //Users Routes
    Route::resource('users', 'App\Http\Controllers\UserController');

    // Clients
    Route::resource('companies', 'App\Http\Controllers\CompaniesController');

});

require __DIR__.'/auth.php';
require __DIR__.'/onboard.php';