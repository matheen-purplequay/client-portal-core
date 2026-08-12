<?php

use App\Mail\SendContactForm;
use App\Mail\SendDynamicEmail;
use App\Mail\SendFormEmail;
use App\Mail\SendMail;
use App\Mail\SendMessage;
use App\Mail\SendOtpMail;
use App\Models\App;
use App\Models\Apps;
use App\Models\AppUpdates;
use App\Models\Company;
use App\Models\LoginActivity;
use App\Models\MailIgnoreList;
use App\Models\RolesMaster;
use App\Models\MasterCompany;
use App\Models\SubApps;
use App\Models\Teams;
use App\Models\User;
use App\Models\Devices;
use App\Models\UserDetails;
use App\Models\WhitelistIPs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Models\ContactFormRecipients;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Spatie\Async\Pool;
use Stevebauman\Location\Facades\Location;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;


/* $name = $request->in
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


// Not required
Route::middleware('auth:sanctum')->post('/check-login', function (Request $request) {
    $user = Auth::user();
    if (isset($user)) {
        return ['status' => true, 'message' => 'User logged in'];
    } else {
        return ['status' => false, 'message' => 'User logged out'];
    }
});

// Basic Logout
Route::middleware('auth:sanctum')->get('/logout', function (Request $request) {
    Auth::logout();
    return ['status' => true, 'message' => 'User logged out'];
});

Route::middleware('guest')->post('/verify-captcha-token', function(Request $request) {
    try {
        $captcha_token = $request->input('captchaToken');
        // Verify if it is human
        $secret = config('settings.recaptcha.secret');
    
        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret'   => $secret,
            'response' => $captcha_token,
        ]);
    
        $data = $response->json();
        
        $isHuman = isset($data['success']) && $data['success'] === true && $data['score'] >= 0.5;
        
        // If it is not Human, return error
        if(!$isHuman) return [
            'status' => false, 'error' => 'Bots are not allowed', 
            'message' => 'Invalid access.', 
            'success' => $data,
            'token' => $captcha_token,
            'response' => $response->json()
        ];
        
        return ['status' => true, 'message' => 'It is human.', 'isHuman' => $isHuman, 'token' => $captcha_token, 'response' => $response->json()];
    } catch(Exception $e) {
        return ['status' => false, 'error' => $e->getMessage(), 'message' => 'Something went wrong.', 'token' => $captcha_token];
    }
});




// Initial Login - Get Token
Route::middleware('guest')->post('/get-token-old', function (Request $request) {
    $max_login_attempts = 20;
    
    $email = $request->input('email');
    $password = $request->input('password');
    $host = request()->getHost();
    
    try {
        // Check if user record exists
        $user = User::where('email', $email)->first();
        if(isset($user)) {
            $login_attempts = $user->login_attempts;
            if($login_attempts >= $max_login_attempts) {
                $last_login_attempt = Carbon::parse($user->updated_at);
                $unlockAt = $last_login_attempt->addMinutes(15);

                if ($last_login_attempt->lt(now()->subMinutes(15))) {
                    $user->login_attempts = 0;
                    $user->save();
                } else {
                    
                    if(isset($next_login_attempt)) {
                        $next_login_attempt = now()->addMinutes(15);
                        $user->next_login_attempt = $next_login_attempt;
                        $user->save();
                    }
                    
                    return [
                        'status' => false,
                        'error' => [
                            'error_code' => 'USR400',
                            'title' => 'Login ',
                            'message' => 'Login limit reached. Please try logging again after ' . $unlockAt . ' .',
                        ]
                    ];
                }
            }
        } else {
            return [
                'status' => false,
                'error' => [
                    'error_code' => 'USR404',
                    'title' => 'User not found',
                    'message' => 'The email address and password you entered do not match our records. Please verify and try again.'
                ]
            ];

        }
        
        if (Auth::attempt(['email' => $email, 'password' => $password])) {
            $user = Auth::user();
            $token = $user->createToken('authToken')->plainTextToken;
            
            $user_details = UserDetails::where('user_id', $user->id)->where('status', 'active')->first();
            if (isset($user_details) && isset($user_details->status)) {
                if ($user_details->status == "inactive" || $user_details->status == NULL) {
                    return [
                        'status' => false,
                        'error' => [
                            'error_code' => 'USR401',
                            'title' => 'Not active ',
                            'message' => 'User is not active. ',
                        ]
                    ];
                }
            }
            
    
            $is_cooling_period = false;
            // Convert the timestamp to a Carbon instance
            $otp_generated_at = Carbon::parse($user->otp_generated_at);
    
            // Get the current time and subtract 6 hours
            $timeLimit = Carbon::now()->subHours(6);
    
            // Check if the timestamp is older than 6 hours from now
            if ($otp_generated_at->lessThan($timeLimit)) $is_cooling_period = true;
            else $is_cooling_period = false;
    
            // $company = Company::where('id', $user_details->company_id)->first();
            // if($is_cooling_period) {
            //     loginUser($user, $request->input('device_info'), $request->input('device_token'), $request->getClientIp(), $request->input('local_time'));
            // } else {
                $userdata = [
                    'token' => $token,
                    'user' => [
                        'email' => $email,
                    ]
                ];
                // Generate a random 4-digit OTP
                $otp = rand(1000, 9999);
        
                // Get the customer's email address from the request or your database
                $email = $request->input('email');
        
                // Send the OTP to the customer's email
                try {   
                    $name = $user->first_name . ' ' . $user->last_name;
                    // $ignore_emails = MailIgnoreList::where('user_id', $user->id)->first();
                    
                    // Working but slow
                    Mail::to($email)->queue(new SendOtpMail($otp, $name, $host));
                    
                    
                    // Mail::to($email)->queue(new SendOtpMail($otp, $name));
                    $response = '';
                    
                    // $response = Http::post('https://clientqueryapi.purplequay.com.au/api/Mail/SendOTP', [
                    //     'ToEmail' => $email,
                    //     'Name' => $name,
                    //     'Otp' => $otp,
                    //     'Subject' => 'New OTP from Client Portal',
                    // ]);
                    
                    // Its fast 
                    // $response = Http::withHeaders([
                    //     'Accept' => 'application/json',
                    //     'Content-Type' => 'application/json',
                    // ])->post('https://clientqueryapi.purplequay.com.au/api/Mail/SendOTP', [
                    //     'ToEmail' => (string) $email,
                    //     'Name' => (string) $name,
                    //     'Otp' => (string) $otp,
                    //     'Subject' => 'New OTP from Client Portal',
                    // ]);
                    
                    $userdata['mailresponse'] = $response;
                    // if($ignore_emails->user_id !== $user->id) {
                    // }
        
                    $user->otp = $otp;
                    $user->otp_verified = false;
                    $user->save();
                    return response($userdata, 200)->header('Content-Type', 'text/plain');
                } catch (Exception $exception) {
                    return ['status' => false, 'error' => $exception->getMessage(), 'message' => 'Something went wrong.'];
                }
            // }
        } else {
            if(isset($user)) {
                $user->login_attempts = $user->login_attempts + 1;
                $user->save();
            }
            
            return [
                'status' => false,
                'error' => [
                    'error_code' => 'ERRLGN101',
                    'title' => 'Credentials mismatch',
                    'message' => 'The email address and password you entered do not match our records. Please verify and try again.',
                    'remaining_login_attempt' => $max_login_attempts - $user->login_attempts
                ]
            ];
        }
    } catch(Exception $e) {
        return ['status' => false, 'message' => 'Something went wrong while generating otp', 'error' => $e->getMessage()];
    }

})->name('token');




// Intial Login - Get Token - New Method
Route::middleware('guest')->post('/get-token', function (Request $request) {
    $max_login_attempts = 20;

    $email    = $request->input('email');
    $password = $request->input('password');
    $host     = $request->getHost();

    try {
        // Single user fetch — reused throughout the entire flow
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'error'  => [
                    'error_code' => 'USR404',
                    'title'      => 'User not found',
                    'message'    => 'The email address and password you entered do not match our records. Please verify and try again.',
                ]
            ], 404);
        }

        // Rate limiting check
        if ($user->login_attempts >= $max_login_attempts) {
            $lastAttempt = Carbon::parse($user->updated_at);
            $unlockAt    = $lastAttempt->copy()->addMinutes(15);

            if ($lastAttempt->lt(now()->subMinutes(15))) {
                // Lock window has passed — reset silently with a single DB hit
                $user->login_attempts = 0;
                $user->save();
            } else {
                return response()->json([
                    'status' => false,
                    'error'  => [
                        'error_code' => 'USR400',
                        'title'      => 'Login locked',
                        'message'    => 'Login limit reached. Please try again after ' . $unlockAt->toDateTimeString() . '.',
                    ]
                ], 429);
            }
        }

        // Attempt authentication using the already-fetched user (avoids second DB query)
        if (!Auth::attempt(['email' => $email, 'password' => $password])) {
            // Increment attempts in a single query — no full model hydration needed
            User::where('id', $user->id)->increment('login_attempts');

            return [
                'status' => false,
                'error' => [
                    'error_code' => 'ERRLGN101',
                    'title' => 'Credentials mismatch',
                    'message' => 'The email address and password you entered do not match our records. Please verify and try again.',
                    'remaining_login_attempt' => $max_login_attempts - $user->login_attempts
                ]
            ];
            // return response()->json([
            //     'status' => false,
            //     'error'  => [
            //         'error_code'              => 'ERRLGN101',
            //         'title'                   => 'Credentials mismatch',
            //         'message'                 => 'The email address and password you entered do not match our records. Please verify and try again.',
            //         'remaining_login_attempt' => $max_login_attempts - ($user->login_attempts + 1),
            //     ]
            // ], 401);
        }

        // Auth passed — use the already-authenticated user from the guard
        $user = Auth::user();

        // Check active status — only runs after a successful auth
        $userDetails = UserDetails::where('user_id', $user->id)
        ->where('status', 'active')
        ->first();

        if (!$userDetails || $userDetails->status !== 'active') {
            return response()->json([
                'status' => false,
                'error'  => [
                    'error_code' => 'USR401',
                    'title'      => 'Account inactive',
                    'message'    => 'User is not active.',
                ]
            ], 403);
        }

        // Generate OTP and token together before any I/O
        $otp   = rand(1000, 9999);
        $token = $user->createToken('authToken')->plainTextToken;

        // Single save: reset attempts + store OTP in one DB round-trip
        $user->login_attempts  = 0;
        $user->otp             = $otp;
        $user->otp_verified    = false;
        $user->otp_generated_at = now();
        $user->save();

        $name = $user->first_name . ' ' . $user->last_name;
        Mail::to($email)->send(new SendOtpMail($otp, $name, $host));

        return response()->json([
            'token' => $token,
            'user'  => ['email' => $email],
        ], 200);

    } catch (Exception $e) {
        Log::error('OTP login error', ['error' => $e->getMessage()]);
        return response()->json([
            'status'    => false,
            'message'   => 'Something went wrong while generating OTP.',
            'error'     => $e->getMessage() 
        ], 500);
    }
})->name('token');





Route::middleware('guest')->post('/verify-otp', function(Request $request) {
    $otp = $request->input('otp');
    $email = $request->input('email');
    if($request->has('device_info'))
        $device_info = $request->input('device_info');
    else 
        $device_info = '';

    if($request->has('device_token'))
        $device_token = $request->input('device_token');
    else 
        $device_token = '';

    $user = User::where('email', $email)->where('otp', $otp)->first();
    if(!isset($user)) {
        return ['status' => false, 'error_code' => '701', 'message' => 'Invalid OTP'];
    }

    $user_details = UserDetails::where('user_id', $user->id)->first();
    $role = RolesMaster::where('id', $user_details->role_id)->first();
    $company = Company::where('id', $user_details->company_id)->first();
    $previewLink = asset(Storage::disk('local')->url($user_details->profile_picture));

    $userdata = [ 
        'email' => $email,
        'user_id' => $user->id, 
        'first_name' => $user->first_name, 
        'middle_name' => $user->middle_name, 
        'last_name' => $user->last_name,
        'role' => $user_details->role,
        'role_id' => $role->id,
        'profile_picture' => $previewLink,
        'company_id' => $company->id,
        'project_id' => $company->works_manager_client_id,
        'portal_id' => $company->sub_app_id,
        'dashboards' => $company->dashboards,
        'company_logo' => $company->company_logo,
        'company_name' => $company->name,
    ];

    if(isset($user_details->wm_user_id) && $user_details->wm_user_id != null) $userdata['staff_id'] = $user_details->wm_user_id;
    if(isset($user_details->wm_client_id) && $user_details->wm_client_id != null) $userdata['client_id'] = $user_details->wm_client_id;
    
    if(isset($company->master_company_id)) {
        $master_company = MasterCompany::where('id', $company->master_company_id)->first();
        if(isset($master_company)) {
            $userdata['master_company'] = $master_company;
        }
    }
    
    $isTester = false;
    if($user_details->company_id == 1) {
        $isTester = true;
        $userdata['test_dashboards'] = $company->test_dashboards;
    }

    $portal = Apps::find(1);
    $sub_portal_id = 1;
    if(str_contains($company->dashbards, '0') && str_contains($company->dashbards, '1')) $sub_portal_id = 3;
    if(str_contains($company->dashbards, '0') && !str_contains($company->dashbards, '1')) $sub_portal_id = 2;
    if(!str_contains($company->dashbards, '0') && str_contains($company->dashbards, '1')) $sub_portal_id = 1;
    $sub_portal = SubApps::find($sub_portal_id);
    $update = AppUpdates::where('app_id', 1)->where('is_approved', 1)->where('is_active', 1)
        ->orderBy('major_version', 'DESC')->orderBy('minor_version', 'DESC')->first();

    $app = [
        'portal' => $portal->id,
        'sub_portal' => $sub_portal->id,
        'version' => "$portal->major_version.$portal->minor_version"
    ];

    // Add latest update version to user data
    if(isset($update)) {
        $app['latest_version'] = "$update->major_version.$update->minor_version";
        $app['latest_version_id'] = $update->id;
        $app['latest_update'] = [
            'title' => $update->title,
            'notes' => $update->notes
        ];
        $app['local']['major_version'] = $user_details->app_major_version;
        $app['local']['minor_version'] = $user_details->app_minor_version;
    }

    $userdata['app'] = $app;

    
    if(isset($user)) {        
        try {
            $ip_address = $request->getClientIp();
            $position = Location::get($ip_address);
            $existing_ips = [];
            // $existing_ips = WhitelistIPs::where('user_id', $user->id)->where('status', 1)->get();
            $max_limit_reached = false;
            $is_new_device = false;
            $used_one_time_login = false;

            /* Commentted due to IP address tracking issue
            if($existing_ips->count() <= 0) {
                WhitelistIPs::insert([
                    'user_id' => $user->id, 
                    'ipv4_address' => $request->getClientIp(),
                    'device_info' => $device_info,
                    'device_token' => $device_token,
                    'status' => 1
                ]);
                $is_new_device = false;
            } else {
                foreach ($existing_ips as $existing_ip) {
                    if($existing_ip->ipv4_address == $ip_address) {
                        $is_new_device = false;
                        break;
                    }
                    else $is_new_device = true;
                }

                if($existing_ips->count() >= $user_details->network_limit) {
                    $max_limit_reached = true;
                }
            }

            if($user_details->used_one_time_login == 1) $used_one_time_login = true;
            
            */
            $login_details = [
                    'position' => $position, 
                    'is_new_device' => $is_new_device, 
                    'max_limit_reached' => $max_limit_reached, 
                    'ips' => $existing_ips, 
                    'used_one_time_login' => $used_one_time_login,
                    'ip' => $request->getClientIp(), 
            ]; 

            LoginActivity::create([
                'user_id' => $user->id,
                'device_info' => $device_info,
                'location' => json_encode($position),
                'ip_address' => $request->getClientIp(),
                'local_timestamp' => $request->input('local_time')
            ]);

            $user->otp_verified = true;
            $user->otp = null;
            $user->save();    
            
            return ['status' => true, 'message' => 'OTP verified', 'user' => $userdata, 'isTester' => $isTester, 'login_details' => $login_details];

        } catch(Exception $e) {
            if($user_details->role == 'admin' || $user_details->role == 'business_analyst')
                return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
            else 
                return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
        }
        
    } else {
        // $user->otp_verified = false;
        // $user->save();
        return ['status' => false, 'message' => 'OTP expired'];
    }
});


function loginUser($user, $device_info = '', $device_token = '', $ip_address, $now) {

    $user_details = UserDetails::where('user_id', $user->id)->first();
    $role = RolesMaster::where('id', $user_details->role_id)->first();
    $company = Company::where('id', $user_details->company_id)->first();
    $previewLink = asset(Storage::disk('local')->url($user_details->profile_picture));

    $userdata = [
        'email' => $user->email,
        'user_id' => $user->id,
        'first_name' => $user->first_name,
        'middle_name' => $user->middle_name,
        'last_name' => $user->last_name,
        'role' => $user_details->role,
        'role_id' => $role->id,
        'profile_picture' => $previewLink,
        'company_id' => $company->id,
        'project_id' => $company->works_manager_client_id,
        'portal_id' => $company->sub_app_id,
        'dashboards' => $company->dashboards,
        'company_logo' => $company->company_logo,
        'company_name' => $company->name
    ];

    if (isset($user_details->wm_user_id) && $user_details->wm_user_id != null)
        $userdata['staff_id'] = $user_details->wm_user_id;
    if (isset($user_details->wm_client_id) && $user_details->wm_client_id != null)
        $userdata['client_id'] = $user_details->wm_client_id;

    if (isset($company->master_company_id)) {
        $master_company = MasterCompany::where('id', $company->master_company_id)->first();
        if (isset($master_company)) {
            $userdata['master_company'] = $master_company;
        }
    }

    $isTester = false;
    if ($user_details->company_id == 1) {
        $isTester = true;
        $userdata['test_dashboards'] = $company->test_dashboards;
    }

    $portal = Apps::find(1);
    $sub_portal_id = 1;
    if (str_contains($company->dashbards, '0') && str_contains($company->dashbards, '1'))
        $sub_portal_id = 3;
    if (str_contains($company->dashbards, '0') && !str_contains($company->dashbards, '1'))
        $sub_portal_id = 2;
    if (!str_contains($company->dashbards, '0') && str_contains($company->dashbards, '1'))
        $sub_portal_id = 1;
    $sub_portal = SubApps::find($sub_portal_id);
    $update = AppUpdates::where('app_id', 1)->where('is_approved', 1)->where('is_active', 1)
        ->orderBy('major_version', 'DESC')->orderBy('minor_version', 'DESC')->first();

    $app = [
        'portal' => $portal->id,
        'sub_portal' => $sub_portal->id,
        'version' => "$portal->major_version.$portal->minor_version"
    ];

    // Add latest update version to user data
    if (isset($update)) {
        $app['latest_version'] = "$update->major_version.$update->minor_version";
        $app['latest_version_id'] = $update->id;
        $app['latest_update'] = [
            'title' => $update->title,
            'notes' => $update->notes
        ];
        $app['local']['major_version'] = $user_details->app_major_version;
        $app['local']['minor_version'] = $user_details->app_minor_version;
    }

    $userdata['app'] = $app;

    if (isset($user)) {
        try {
            $position = Location::get($ip_address);
            $existing_ips = WhitelistIPs::where('user_id', $user->id)->where('status', 1)->get();
            $max_limit_reached = false;
            $is_new_device = true;
            $used_one_time_login = false;

            if ($existing_ips->count() <= 0) {
                WhitelistIPs::insert([
                    'user_id' => $user->id,
                    'ipv4_address' => $ip_address,
                    'device_info' => $device_info,
                    'device_token' => $device_token,
                    'status' => 1
                ]);
                $is_new_device = false;
            } else {
                foreach ($existing_ips as $existing_ip) {
                    if ($existing_ip->ipv4_address == $ip_address) {
                        $is_new_device = false;
                        break;
                    } else
                        $is_new_device = true;
                }

                if ($existing_ips->count() >= $user_details->network_limit) {
                    $max_limit_reached = true;
                }
            }

            if ($user_details->used_one_time_login == 1)
                $used_one_time_login = true;

            $login_details = [
                'position' => $position,
                'is_new_device' => $is_new_device,
                'max_limit_reached' => $max_limit_reached,
                'ips' => $existing_ips,
                'used_one_time_login' => $used_one_time_login,
                'ip' => $ip_address
            ];

            LoginActivity::create([
                'user_id' => $user->id,
                'device_info' => $device_info,
                'location' => json_encode($position),
                'ip_address' => $ip_address,
                'local_timestamp' => $now
            ]);

            $user->otp_verified = true;
            $user->otp = null;
            $user->save();

            return ['status' => true, 'message' => 'OTP verified', 'user' => $userdata, 'isTester' => $isTester, 'login_details' => $login_details];

        } catch (Exception $e) {
            if ($user_details->role == 'admin' || $user_details->role == 'business_analyst')
                return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
            else
                return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
        }

    } else {
        // $user->otp_verified = false;
        // $user->save();
        return ['status' => false, 'message' => 'OTP expired'];
    }
}



Route::middleware('guest')->post('/test-token2', function (Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');
    if (Auth::attempt(['email' => $email, 'password' => $password])) {
        $user = Auth::user();
        $token = $user->createToken('authToken')->plainTextToken;
        $user_details = UserDetails::where('user_id', $user->id)->first();
        if (isset($user_details) && isset($user_details->status)) {
            if ($user_details->status == "inactive" || $user_details->status == NULL) {
                return ["User not active"];
            }
        }
        // $company = Company::where('id', $user_details->company_id)->first();
        $userdata = [
            'token' => $token,
            'user' => [
                'email' => $email,
                // 'user_id' => $user->id, 
                // 'first_name' => $user->first_name, 
                // 'middle_name' => $user->middle_name, 
                // 'last_name' => $user->last_name,
                // 'company_id' => $company->id,
                // 'project_id' => $company->works_manager_client_id,
                // 'dashboards' => $company->dashboards,
                // 'company_logo' => $company->company_logo,
                // 'company_name' => $company->name
            ]
        ];
        // Generate a random 4-digit OTP
        $otp = rand(1000, 9999);

        // Get the customer's email address from the request or your database
        $email = $request->input('email');

        // Send the OTP to the customer's email
        try {
            $name = $user->first_name . ' ' . $user->last_name;
            Mail::to($email)->queue(new SendOtpMail($otp, $name));

            $user->otp = $otp;
            $user->otp_verified = false;
            $user->save();
            return response($userdata, 200)->header('Content-Type', 'text/plain');
        } catch (Exception $exception) {
            return ['status' => false, 'error' => $exception, 'error_code' => config('error_codes.exception.codes.52.code')];
        }

        // return $userdata;
    } else
        return [
            'status' => false,
            'error' => [
                'error_code' => config('error_codes.login.codes.101.code'),
                'title' => config('error_codes.login.codes.101.title'),
                'message' => config('error_codes.login.codes.101.message'),
            ]
        ];

})->name('token2');

Route::middleware('guest')->post('/login-admin', function (Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');
    if (Auth::attempt(['email' => $email, 'password' => $password])) {
        $user = Auth::user();
        $token = $user->createToken('authToken')->plainTextToken;
        $user_details = UserDetails::where('user_id', $user->id)->where('status', 'active')->first();
        if ($user_details != null && $user_details->company_id == 1 && $user_details->status) {
            $roles_master = RolesMaster::where('id', $user_details->role_id)->first();
            $previewLink = asset(Storage::disk('local')->url($user_details->profile_picture));

            $userdata = [
                'token' => $token,
                'user' => [
                    'email' => $email,
                    'user_id' => $user->id,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'profile_picture' => $previewLink,
                    'role' => $user_details->role,
                    'role_id' => $user_details->role_id,
                    'role_category' => $roles_master->category,
                    'wm_user_id' => $user_details->wm_user_id,
                    'staff_id' => $user_details->wm_user_id ?? null,
                    'client_id' => $user_details->wm_client_id ?? null                    
                ]
            ];

            // if(isset($user_details->wm_user_id) && $user_details->wm_user_id != null) $userdata['staff_id'] = $user_details->wm_user_id;
            // if(isset($user_details->wm_client_id) && $user_details->wm_client_id != null) $userdata['client_id'] = $user_details->wm_client_id;
            
            if ($user_details->role == 'admin')
                $userdata['user']['is_admin'] = true;
            return response($userdata, 200)->header('Content-Type', 'text/plain');
        } else {
            Auth::logout();
            return ["No token", $email];
        }
        // return $userdata;
    } else
        return ["No token", $email];

})->name('token');

Route::middleware('guest')->post('/send-otp', function (Request $request) {
    $email = $request->input('email');
    $name = $request->input('name');
    $user = User::where('email', $email)->first();

    // Generate a random 4-digit OTP
    $otp = rand(1000, 9999);

    // Get the customer's email address from the request or your database
    $email = $request->input('email');

    // Send the OTP to the customer's email
    Mail::to($email)->queue(new SendOtpMail($otp, $name));
    $user->otp = $otp;
    $user->otp_verified = false;
    $user->save();

    return ['status' => true, 'message' => 'OTP sent to email'];
});

Route::post('/send-message', function (Request $request) {
    $to = 'matheen.abdul@purplequay.com.au';
    $cc = 'matheen.abdul@purplequay.com.au';
    // $cc = 'aashikka.roshan@purplequay.com.au';

    $email = $request->input('email');
    $name = $request->input('name');
    $query = $request->input('query');
    $client_id = $request->input('client_id');
    $company = Company::where('id', $client_id)->first();
    if (isset($company))
        $emails = ContactFormRecipients::where('client_id', $company->id)->first();
    if (isset($emails)) {
        $to = $emails->email_to;
        $cc = $emails->emailcc;
    }

    Mail::to($to)->cc($cc)->send(new SendMessage($email, $name, $query, $company->name));
    return ['status' => true, 'message' => 'Message has been sent', 'recipients' => $emails, 'company' => $company];
});

Route::post('send-contact-form', function (Request $request) {
    $email = $request->input('email');
    $name = $request->input('name');
    $query = $request->input('message');
    $to = 'hr@carisma-solutions.com.au';
    $bcc = 'aashika.roshan@purplequay.com.au';

    Mail::to($to)->bcc($bcc)->send(new SendContactForm($name, $email, $query));

    return ['Mail sent successfully'];
});

Route::post('send-form-email', function (Request $request) {
    try {
        if (!$request->has('to') || !$request->has('email') || !$request->has('name'))
            return ['status' => false, 'message' => 'Required fields are not present'];
        $email = $request->input('email');
        $name = $request->input('name');
        $to = $request->input('to');
        $data = $request->input('data');
        $body = $request->input('body');
        $subject = $request->input('subject') ?? 'New form submission';
        $cc = 'matheen.abdul@purplequay.com.au';

        Mail::to($to)->cc($cc)->send(new SendFormEmail($name, $email, $subject, $data, $body));

        return [
            'status' => true,
            'message' => 'Mail sent successfully'
        ];
    } catch (Exception $e) {
        return [
            'status' => false,
            'error' => 'Mail not sent',
            'message' => $e->getMessage()
        ];
    }
});

Route::post('send-dynamic-email', function (Request $request) {
    try {
        if (!$request->has('to'))
            return ['status' => false, 'message' => 'To email id is not present'];
        if (!$request->has('from'))
            return ['status' => false, 'message' => 'From email id is not present'];
        if (!$request->has('body'))
            return ['status' => false, 'message' => 'Email body is not present'];
        if (!$request->has('subject'))
            return ['status' => false, 'message' => 'Email subject is not present'];
        $to = $request->input('to');
        $body = $request->input('body');
        $subject = $request->input('subject') ?? 'New form submission';

        $sender = 'carisma';
        if ($request->has('from'))
            $sender = $request->input('from');
        else
            return ['status' => false, 'message' => 'From id is incorrect'];

        if ($request->has('signature'))
            $signature = $request->input('signature');
        else
            $signature = 'IT Group at Carisma Solutions';

        try {
            if ($sender == 'carisma') {
                Config::set('mail.username', 'no-reply@carisma-solutions.com.au');
                Config::set('mail.password', 'Seabird@321$');
            } else if ($sender == 'purplequay') {
                Config::set('mail.username', 'no-reply@purplequay.com.au');
                Config::set('mail.password', 'Seabird@321$');
            } else {
                return ['status' => false, 'message' => 'Send id is incorrect'];
            }
            (new \Illuminate\Mail\MailServiceProvider(app()))->register();

            Mail::to($to)->send(new SendDynamicEmail($subject, $body, $signature, $sender));

            Config::set('mail.username', env('MAIL_USERNAME'));
            Config::set('mail.password', env('MAIL_PASSWORD'));
            (new \Illuminate\Mail\MailServiceProvider(app()))->register();
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'There was an error while sending email', 'error' => $e->getMessage(), 'sender' => Config::get('mail.username')];
        }

        return [
            'status' => true,
            'message' => 'Mail sent successfully'
        ];
    } catch (Exception $e) {
        return [
            'status' => false,
            'error' => 'Mail not sent',
            'message' => $e->getMessage(),
            'request' => $request->all()
        ];
    }
});

Route::post('/send-message-test', function (Request $request) {
    $to = 'matheen.abdul@purplequay.com.au';
    $cc = 'crm@carisma-solutions.com.au';
    // $cc = 'aashikka.roshan@purplequay.com.au';

    $email = $request->input('email');
    $name = $request->input('name');
    $query = $request->input('query');
    $client_id = $request->input('client_id');
    $company = Company::where('id', $client_id)->first();
    if (isset($company)) {
        $roles = [1, 24];
        $client_lead = Teams::where('client_id', $company->id)->whereIn('role_id', $roles)->first();

        if (isset($client_lead)) {
            $to = $client_lead->email;

            Mail::to($to)->cc($cc)->send(new SendMessage($email, $name, $query, $company->name));
            return ['status' => true, 'message' => 'Message has been sent', 'recipients' => $to, 'company' => $company];
        } else {
            return ['status' => false, 'message' => 'There was a problem in sending query'];
        }
    } else {
        return ['status' => false, 'message' => 'There was a problem in sending query'];
    }

});

Route::post('one-time-login', function (Request $request) {
    $user_id = $request->input('user_id');

    $user = User::find($user_id);
    if (isset($user)) {
        $user_detail = UserDetails::where('user_id', $user->id)->first();
        if (isset($user_detail)) {
            $user_detail->used_one_time_login = 1;
            $user_detail->save();

            return ['status' => true, 'message' => 'Used one time login'];
        }
    }
});

Route::middleware('guest')->get('/get/clients', function () {
    $companies = Company::where('id', '!=', 1)->orderBy('name', 'ASC')->get();
    return ['status' => true, 'data' => $companies];
});

Route::middleware('guest')->post('/get/clients-by-master', function (Request $request) {
    $master_company_id = $request->master_id;

    if ($master_company_id == 1) {
        // $companies = Company::where('id', '!=', 1)->where('master_company_id', $master_company_id)->orderBy('name', 'ASC')->get();
        $companies = Company::where('master_company_id', $master_company_id)->orderBy('name', 'ASC')->get();
        return ['status' => true, 'data' => $companies];
    } else {
        // $companies = Company::where('id', '!=', 1)->where('master_company_id', '!=', 1)->orderBy('name', 'ASC')->get();
        $companies = Company::where('master_company_id', '!=', 1)->orderBy('name', 'ASC')->get();
        return ['status' => true, 'data' => $companies];
    }

});

Route::middleware('guest')->post('/get/client', function (Request $request) {
    $project_id = $request->input('project_id');
    $company = Company::where('id', $project_id)->first();
    $company_id = $company->id;

    $partner = User::select('users.id', 'users.first_name', 'users.last_name', 'users.email')
        ->join('user_details AS ud', 'ud.user_id', '=', 'users.id')
        ->leftJoin('companies AS c', 'c.id', '=', 'ud.company_id')
        ->where('c.id', $company_id)
        ->where('ud.role', 'client_director')
        ->where('ud.status', 'active')
        ->first();

    if (isset($company->master_company_id)) {
        $master_company = MasterCompany::where('id', $company->master_company_id)->first();
    } else {
        $master_company = MasterCompany::where('id', 1)->first();
    }

    return ['status' => true, 'data' => $company, 'master_company' => $master_company, 'partner_id' => 0, 'partner' => $partner];
});

Route::middleware('guest')->post('/get-master-company', function (Request $request) {
    $short_name = $request->input('short_name');

    $master_company = MasterCompany::where('short_name', $short_name)->first();

    return ['status' => true, 'data' => $master_company];
});



Route::middleware('auth:sanctum')->post('/sendOTP', function (Request $request) {
    // $email = $request->input('email');
    // $token = $request->input('token');
    // if (Auth::attempt(['email' => $email, 'password' => $password])) {
    //     $user = Auth::user();
    //     $userdata = [ 
    //         'token' => $user->remember_token, 
    //         'user' => [
    //             'email' => $email,
    //             'user_id' => $user->id, 
    //             'first_name' => $user->first_name, 
    //             'middle_name' => $user->middle_name, 
    //             'last_name' => $user->last_name 
    //         ]
    //     ];
    //     // Generate a random 4-digit OTP
    //     $otp = rand(1000, 9999);

    //     // Get the customer's email address from the request or your database
    //     $email = $request->input('email'); 

    //     // Send the OTP to the customer's email
    //     Mail::to($email)->send(new SendOtpMail($otp));
    //     $user->otp = $otp;
    //     $user->otp_verified = false;
    //     $user->save();

    //     // return $userdata;
    //     return response($userdata, 200)
    //     ->header('Content-Type', 'text/plain');
    // } else return ["No token", $email];

})->name('token');



// Reset OTP 

Route::middleware('guest')->post('/send-reset-otp', function (Request $request) {
    try {
        $email = $request->input('email');
        $user = User::where('email', $email)->first();
    
        // Generate a random 4-digit OTP
        $otp = rand(1000, 9999);
    
        // Get the customer's email address from the request or your database
        $email = $request->input('email');
    
        $user = User::where('email', $email)->first();
        if(isset($user)) {
            $name = $user->first_name . ' ' . $user->last_name;
        
            $response =  '';
            
            // Send the OTP to the customer's email
            Mail::to($email)->send(new SendMail($name, 'OTP to reset your password - Carisma Solutions', 'mail.send-reset-otp', ['otp' => $otp]));
    
            $client = new Client();
            
            // $response = Http::withHeaders([
            //     'Accept' => 'application/json',
            //     'Content-Type' => 'application/json',
            // ])->post('https://clientqueryapi.purplequay.com.au/api/Mail/SendResetPasswordEmail', [
            //     'ToEmail' => (string) $email,
            //     'Name' => (string) $name,
            //     'Otp' => (string) $otp,
            //     'Subject' => 'Password reset OTP from Client Portal',
            // ]);
    
            // $response = Http::post('https://clientqueryapi.purplequay.com.au/api/Mail/SendResetPasswordEmail', [
            //     'ToEmail' => $email,
            //     'Name' => $name,
            //     'Otp' => $otp,
            //     'Subject' => 'New OTP from Client Portal',
            // ]);
        
            $user->reset_otp = $otp;
            $user->reset_otp_verified = false;
            $user->save();
        
            return ['status' => true, 'message' => 'OTP sent to email', 
                 'response_status' => $response,
            ];
        } else {
            return ['status' => false, 'message' => 'User account not found for the email'
            ];
        }
    } /*catch(Exception $e) {
        return ['status' => false, 'message' => 'Something went wrong while sending reset otp', 'error' => $e->getMessage()];
    }*/
    catch (ClientException $e) {
        $errorBody = $e->getResponse()->getBody()->getContents();
         return [
             'status' => false, 'message' => 'Something went wrong while sending reset otp', 
             'response_status' => $response->status(),
            'body' => $response->body(),
            'json' => $response->json(),
        ];
        // dd(json_decode($errorBody, true));
    }
});

// Verify Reset OTP
Route::middleware('guest')->post('/verify-reset-otp', function (Request $request) {
    $otp = $request->input('otp');
    $email = $request->input('email');

    $user = User::where('email', $email)->where('reset_otp', $otp)->first();
    if (isset($user)) {
        $user->reset_otp_verified = true;
        $user->reset_otp = null;
        $user->save();
        return ['status' => true, 'message' => 'Reset OTP verified'];
    } else {
        $user->reset_otp_verified = false;
        $user->save();
        return ['status' => false, 'message' => 'Reset OTP not verified'];
    }
});

// Change password
Route::middleware('guest')->post('/change-password', function (Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');

    $user = User::where('email', $email)->first();
    $user->update(['password' => bcrypt($password)]);

    return ['status' => true, 'message' => 'User password updated'];
});


// Get All Users
Route::middleware('guest')->prefix('admin')->group(function () {
    Route::get('get-all-users', function (Request $request) {
        $users = User::all();

        return ['status' => true, 'data' => $users];
    });

    Route::get('get-users', function () {
        $user = User::select('*')->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')->get();

        return ['status' => true, 'data' => $user];
    });

    Route::post('get-users', function (Request $request) {
        $pid = $request->input('works_manager_client_id');
        $client = Company::where('works_manager_client_id', $pid)->first();
        if (isset($client)) {
            $user = User::select('*')
                ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
                ->where('user_details.company_id', $client->id)
                ->orderBy('first_name')
                ->get();
            return ['status' => true, 'data' => $user];
        } else {
            return ['status' => false, 'data' => []];
        }
    });

    Route::get('sync-wm-user-id', function () {
        try {
            $client = Company::where('works_manager_client_id', 1)->first();
            $users = User::select('*')
                ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
                ->where('user_details.company_id', $client->id)
                ->orderBy('first_name')
                ->get();

            foreach ($users as $user) {
                $user_details = UserDetails::where('user_id', $user->id)->first();
                if (isset($user_details) && $user_details->wm_user_id == 0) {
                    $wm_user = DB::connection('wm_mysql')->table('user')->select('Uid')->where('NewOfficialEmailID', $user->email)->first();
                    $user_details->wm_user_id = $wm_user->Uid;
                }
            }

            return ['status' => true, 'message' => 'All users synced'];
        } catch (Exception $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    });

    Route::post('check-user-if-exists', function (Request $request) {
        $email = $request->input('email');
        $user = User::where('email', $email)->first();
        $wm_user = DB::connection('wm_mysql')->table('user')->where('NewOfficialEmailID', $email)->first();
        if (!isset($user))
            return ['status' => true, 'exists' => false, 'message' => 'User does not exists', 'wm_user' => $wm_user];
        else
            return ['status' => true, 'exists' => true, 'data' => $user, 'message' => 'User exists', 'wm_user' => $wm_user];
    });

    Route::post('check-client-if-exists', function (Request $request) {
        $email = $request->input('email');
        $user = DB::connection('wm_mysql')->table('contacts')->where('Emailaddress', $email)->first();
        if (isset($user)) {
            $portal_user = User::where('email', $email)->first();
            if (!isset($portal_user))
                return ['status' => true, 'exists' => true, 'message' => 'User exists', 'user' => $user];
            return ['status' => false, 'exists' => false, 'message' => 'Duplicate user found in portal'];
        } else
            return ['status' => false, 'exists' => false];
    });

    Route::get('get-all-clients', function (Request $request) {
        $users = DB::connection('wm_mysql')->table('contacts')->orderBy('Contactname', 'ASC')->get();
        if (isset($users) && count($users) > 0)
            return ['status' => true, 'exists' => true, 'message' => 'Users list available', 'data' => $users];
        else
            return ['status' => false, 'exists' => false, 'message' => 'Users list not available', 'data' => []];
    });

    Route::get('get-all-wm-clients', function (Request $request) {
        $projects = DB::connection('wm_mysql')->table('project')->select('Pid', 'ClientName')->orderBy('ClientName', 'ASC')->get();
        if (isset($projects) && count($projects) > 0)
            return ['status' => true, 'exists' => true, 'data' => $projects];
        else
            return ['status' => false, 'exists' => false, 'message' => 'WM Company list not available', 'data' => []];
    });

    Route::post('generate-access', function (Request $request) {
        $email = $request->input('email');
        $first_name = $request->input('first_name');
        $middle_name = $request->input('middle_name');
        $last_name = $request->input('last_name');
        $company_id = $request->input('company_id');
        $role = $request->input('role');
        $password = bcrypt(config('settings.user_settings.default_password'));
        // $password = "password";
        if ($company_id === 0)
            $company_id = 1;

        try {
            $user = User::where('email', $email)->first();
            if (!isset($user)) {
                $user = User::create(
                    [
                        'first_name' => $first_name,
                        'middle_name' => $middle_name,
                        'last_name' => $last_name,
                        'email' => $email,
                        'password' => $password
                    ]
                );
            }

            if ($company_id == 1)
                $wm_user = DB::connection('wm_mysql')->table('user')->where('NewOfficialEmailID', $email)->first();
            else
                $wm_user = DB::connection('wm_mysql')->table('contacts')->where('Emailaddress', $email)->first();

            $role_master = RolesMaster::where('code', $role)->first();

            $user_details = new UserDetails();
            $user_details->user_id = $user->id;
            if (isset($wm_user) && isset($wm_user->Uid))
                $user_details->wm_user_id = $wm_user->Uid;
            if ($company_id != 1 && isset($wm_user->Cid))
                $user_details->wm_client_id = $wm_user->Cid;
            $user_details->company_id = $company_id;
            $user_details->role = $role;
            $user_details->role_id = $role_master->id;
            $user_details->save();

            return ['status' => true, 'message' => 'User created'];
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
        }
    });
    
    
    





        /**
         * Maps a wmdb designation name to one of the 8 active cpdb role codes:
         *   client_director | group_director | project_director |
         *   team_lead | manager | business_analyst | ceo | associate
         *
         * Anything that does not match a specific rule falls back to 'associate'.
         * Specificity matters: more precise phrases are checked before broader ones
         * (e.g. "project director" before the generic "director" catch).
         */
        function mapDesignationToCpRole(string $designationName): string
        {
            $name = strtolower(trim($designationName));
         
            // ── CEO ──────────────────────────────────────────────────────────────────
            if (str_contains($name, 'chief executive') || $name === 'ceo') {
                return 'ceo';
            }
         
            // ── Director tier (specific → generic) ──────────────────────────────────
            // "Client Director" or "Client Lead" → client_director
            if (str_contains($name, 'client director') || str_contains($name, 'client lead')) {
                return 'client_director';
            }
         
            // "Group Director" → group_director
            if (str_contains($name, 'group director')) {
                return 'group_director';
            }
         
            // "Project Director" or "Associate Project Director" → project_director
            if (str_contains($name, 'project director') || str_contains($name, 'associate project director')) {
                return 'project_director';
            }
         
            // Any other director / COO / Delivery Head → group_director (closest fit)
            if (
                str_contains($name, 'director')  ||
                str_contains($name, 'chief operating') ||
                str_contains($name, 'delivery head')
            ) {
                return 'group_director';
            }
         
            // ── Manager tier ─────────────────────────────────────────────────────────
            // Any variation with "manager" → manager
            // Covers: Manager, Senior Manager, Assistant Manager, Client Manager,
            //         HR Recruitment Manager, HR Business Partner Manager,
            //         Client Relationship Manager, Asst. Marketing Manager, etc.
            if (str_contains($name, 'manager')) {
                return 'manager';
            }
         
            // ── Team Lead ────────────────────────────────────────────────────────────
            // Covers: Team Lead, Delivery Lead, Client Lead (already caught above),
            //         Marketing Lead
            if (str_contains($name, 'lead')) {
                return 'team_lead';
            }
         
            // ── Business Analyst ─────────────────────────────────────────────────────
            if (str_contains($name, 'analyst')) {
                return 'business_analyst';
            }
         
            // ── Associate ────────────────────────────────────────────────────────────
            if (str_contains($name, 'associate')) {
                return 'associate';
            }
         
            // ── Fallback — everything else becomes associate ──────────────────────────
            // Covers: Accountant, Paraplanner, Consultant, Intern, Executive Assistant,
            //         Desktop Engineer, HR Executive, Contract Processor, etc.
            return 'associate';
        }
         
        // ─────────────────────────────────────────────────────────────────────────────
         
        Route::post('generate-internal-access', function (Request $request) {
         
            $email       = $request->input('email');
            $first_name  = $request->input('first_name');
            $middle_name = $request->input('middle_name');
            $last_name   = $request->input('last_name');
            $company_id  = $request->input('company_id');
            $password    = bcrypt(config('settings.user_settings.default_password'));
         
            if ($company_id === 0) {
                $company_id = 1;
            } elseif ($company_id > 1) {
                return ['status' => false, 'message' => 'Invalid user details'];
            }
         
            try {
                // ── 1. Resolve or create the cpdb user ───────────────────────────────
                $user = User::where('email', $email)->first();
         
                if (!isset($user)) {
                    $user = User::create([
                        'first_name'  => $first_name,
                        'middle_name' => $middle_name,
                        'last_name'   => $last_name,
                        'email'       => $email,
                        'password'    => $password,
                    ]);
                } else {
                    return ['status' => false, 'message' => 'User record already exists.'];
                }
         
                // ── 2. Fetch the wmdb user record ────────────────────────────────────
                $wm_user = DB::connection('wm_mysql')
                    ->table('user')
                    ->where('NewOfficialEmailID', $email)
                    ->where('Accessstatus', 0)
                    ->first();
         
                // ── 3. Derive the cpdb role from the wmdb designation ────────────────
                //
                // We look up the employee's designation in the wmdb designationmaster
                // table (column names: ID, Name, Abbreviation) using the DesignationID
                // stored on the user record. If the lookup fails for any reason we
                // fall back to the role passed in the request (or 'consultant').
                //
                $cpRoleCode = 'associate'; // request fallback
         
                if (isset($wm_user)) {
                    // Adjust 'DesignationID' below if your wmdb column name differs.
                    $designationId = $wm_user->DesignationID ?? null;
         
                    if ($designationId) {
                        $designation = DB::connection('wm_mysql')
                            ->table('designationmaster')
                            ->where('ID', $designationId)
                            ->first();
         
                        if ($designation && !empty($designation->Name)) {
                            $cpRoleCode = mapDesignationToCpRole($designation->Name);
                        } else {
                            $cpRoleCode = 'associate';
                        }
                    } else {
                        $cpRoleCode = 'associate';
                    }
                } else {
                    $user->delete();
                    return ['status' => false, 'message' => 'User does not exists in works manager'];
                }
         
                // ── 4. Resolve the RolesMaster entry in cpdb ─────────────────────────
                $role_master = RolesMaster::where('code', $cpRoleCode)->first();
         
                if (!$role_master) {
                    // The mapped code didn't match anything — default to 'associate'
                    $role_master = RolesMaster::where('code', 'associate')->firstOrFail();
                    $cpRoleCode  = 'associate';
                }
         
                // ── 5. Persist UserDetails ───────────────────────────────────────────
                $user_details             = new UserDetails();
                $user_details->user_id    = $user->id;
         
                if (isset($wm_user->Uid)) {
                    $user_details->wm_user_id = $wm_user->Uid;
                }
                if ($company_id != 1 && isset($wm_user->Cid)) {
                    $user_details->wm_client_id = $wm_user->Cid;
                }
         
                $user_details->company_id = $company_id;
                $user_details->role       = $cpRoleCode;
                $user_details->role_id    = $role_master->id;
                $user_details->save();
         
                return [
                    'status'  => true,
                    'message' => 'User created',
                    'role'    => $cpRoleCode,   // handy for debugging / confirmation
                ];
         
            } catch (Exception $e) {
                return [
                    'status'  => false,
                    'message' => 'Something went wrong',
                    'error'   => $e->getMessage(),
                ];
            }
        });

    
    
    
});


include ('admin.php');
include ('client.php');
include ('wm_api/wmapi.php');

include ('common/profile.php');