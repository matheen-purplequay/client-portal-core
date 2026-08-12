<?php

use App\Mail\SendIPReqeuestApproved;
use App\Mail\SendMail;
use App\Mail\SendMessage;
use App\Mail\SendOtpMail;
use App\Models\Company;
use App\Models\User;
use App\Models\LoginActivity;
use App\Models\ClientPortalPermissions;
use App\Models\UserDetails;
use App\Models\App;
use App\Models\DashboardRules;
use App\Models\WhitelistIPs;
use App\Models\WhitelistIPsRequest;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use App\Models\ContactFormRecipients;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Stevebauman\Location\Facades\Location;

Route::prefix('client')->group(function() { 

    Route::prefix('app')->group(function() {

        Route::post('get-region', function(Request $request) {
            $position = Location::get($request->getClientIp());
            if($position->countryCode == 'IN' || $position->countryCode == 'AUS')
                return ['status' => true, 'is_out_of_region' => false, 'location' => $position];
            else 
                return ['status' => true, 'is_out_of_region' => true, 'location' => $position];
        });

    });

    Route::get('set-staging-env', function() {
        session()->put('env', 'staging'); 

        return ['status' => true, 'session' => session()->get('env')];
    });

    Route::post('/get-permissions', function(Request $request) {
        $role = $request->input('role');
        $permissions = ClientPortalPermissions::where('role', $role)->get();
        
        $responseData = [];
        foreach ($permissions as $permission) {
            $responseData[$permission->module] = [
                'create' => ($permission->can_create)? true : false,
                'read' => ($permission->can_read)? true : false,
                'update' => ($permission->can_update)? true : false,
                'delete' => ($permission->can_delete)? true : false,
                'review' => ($permission->can_review)? true : false
            ];
        }

        return ['status' => true, 'data' => $responseData ];
    });
    
    
    // Get List of Profile Pictures
    Route::get('/profile-pictures/preview', function () {
        // Get all profile pictures from the storage directory
        $pictures = Storage::disk('local')->allFiles('/public/common/user_profile_pictures');
    
        // Create an empty array to store preview links
        $previewLinks = [];
    
        // Loop through each picture and get its preview link
        foreach ($pictures as $picture) {
            // Get the path to the picture
            $path = Storage::disk('local')->path($picture);
    
            // Create a preview link using Laravel's `url` helper
            // $previewLink = url('/storage/app/' . $picture);
            $previewLink = asset(Storage::disk('local')->url($picture));
    
            // Add the preview link to the array
            $previewLinks[] = $previewLink;
        }
    
        // Return the array of preview links
        return [
            'status' => true,
            'data' => $previewLinks
        ];
    });
    
    Route::post('/profile-picture/save', function(Request $request) {
        $path = $request->input('path');
        $user_id = $request->input('user_id');
        
        $user_details = UserDetails::where('user_id', $user_id)->first();
        $user_details->profile_picture = $path;
        $user_details->save();
        
        return [
            'status' => true,
            'message' => 'Profile picture saved',
            'user' => $user_details,
            'path' => $path
        ];
    });


    // GET LOGIN ACTIVITY - POST METHOD
    Route::post('/get-login-activity', function(Request $request) {
        $user_id = $request->input('user_id');
        if(isset($user_id)) {
            $data = LoginActivity::where('user_id', $user_id)->orderBy('login_timestamp', 'DESC')->limit(5)->get();

            return ['status' => true, 'data' => $data];
        } else {
            return ['status' => false, 'data' => []];
        }
    });

    Route::middleware('auth:sanctum')->group(function() {

        // GET LOGIN ACTIVITY
        Route::get('/get-login-activity', function() {
            $user = Auth::user();
            if(isset($user)) {
                $data = LoginActivity::where('user_id', $user->id)->orderBy('login_timestamp', 'DESC')->limit(5)->get();
                return ['status' => true, 'data' => $data];
            } else {
                return ['status' => false, 'data' => []];
            }
        });

        // GET COMPANY RULES
        Route::post('/get-company-rules', function(Request $request) {
            $client_id = $request->input('client_id');
            
            $rule = DashboardRules::where('client_id', $client_id)->first();
            
            return ['status' => true, 'data' => $rule];
        });
        
        
    });
    
    
    // App specific routes
    Route::prefix('app')->group(function() {

        // Get App Status
        Route::get('get-app-status', function() {
            $app = App::find(1);
            
            return ['status' => true, 'data' => $app]; 
        });
    });

    Route::post('get-users-by-client', function(Request $request) {
        $client_id = $request->input('client_id');
        $client_users = User::select(DB::raw("CONCAT(IFNULL(users.first_name, ''), ' ' , IFNULL(users.last_name, '')) as name"), 'users.email', 'users.id', 'user_details.wm_client_id')
        ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
        ->where('user_details.hide_in_selection', 0)
        ->where('user_details.company_id', $client_id)
        ->get();


        return ['status' => true, 'data' => $client_users];
    });


    // Whitelist IP
    Route::prefix('whitelist-ip')->group(function() {

        // Get list of whitelisted ip address for client
        Route::post('get-whitelisted-ips-by-user-id', function(Request $request) {
            $user_id = $request->input('user_id');

            $user = User::find($user_id);
            if(isset($user)) {
                $whitelisted_ips = WhitelistIPs::where('user_id', $user->id)->get();

                return ['status' => true, 'data' => $whitelisted_ips];
            }
        });

        // Request new ip for approval
        Route::post('request-new-ip-approval', function(Request $request) {
            $client_id = $request->input('client_id');
            $old_ip_address = $request->input('old_ip_address'); 
            $new_ip_address = $request->getClientIp();
            $network_name = $request->input('network_name');

            try {
                $user = User::find($client_id);
                if($user !== null) {
                    $whitelist_ip = WhitelistIPsRequest::where('new_ipv4_address', $new_ip_address)->get();
                    if($whitelist_ip->count() <= 0) {
                        $new_ip_request = WhitelistIPsRequest::create([
                            'client_id' => $client_id,
                            'old_ipv4_address' => $old_ip_address,
                            'new_ipv4_address' => $new_ip_address,
                            'network_name' => $network_name,
                            'status' => 0
                        ]);

                        $html = "New IP request received from $user->first_name $user->last_name for IP address $new_ip_address";

                        Mail::raw($html, function (Message $message) {
                            $message->to('matheen.abdul@purplequay.com.au')
                            ->subject('New IP request - Client Portal')
                            ->cc('aashikka.roshan@purplequay.com.au')
                            ->from(env('MAIL_USERNAME'));
                        });
    
                        return ['status' => true, 'message' => 'New request submitted'];
                    } else return ['status' => false, 'message' => 'Network address alreay requested for approval'];
                } else return ['status' => false, 'message' => 'User not found'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Somethign went wrong while approving new ip request', 'error' => $e->getMessage()];
            }
        });

    });

    include('client/app-updates.php');
    include('client/notifications.php');
    
});