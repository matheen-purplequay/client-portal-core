<?php

use App\Models\Apps;
use App\Models\AppUpdates;
use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\LoginActivity;
use App\Models\SubApps;
use App\Models\User;
use App\Models\RolesMaster;
use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;


Route::prefix('app-updates')->group(function() {

    Route::post('get-app-updates', function(Request $request) {
        $portal_id = $request->input('portal_id');
        $sub_portal_id = $request->input('sub_portal_id');

        $updates = AppUpdates::where('app_id', $portal_id)
            ->where('sub_app_id', $sub_portal_id)
            ->where('is_approved', 1)
            ->where('is_active', 1)
            ->orderBy('id', 'DESC')
            ->limit(10)
            ->get();

        return ['status' => true, 'data' => $updates];
    });

    Route::post('get-app-update-by-id', function(Request $request) {
        $update_id = $request->input('id');
        $user_id = $request->input('user_id');

        $user = User::find($user_id);
        if(isset($user)) {
            $user_details = UserDetails::where('user_id', $user_id)->first();
            if(isset($user_details)) {
                $update = AppUpdates::find($update_id);
                if(isset($update)) {
                    return ['status' => true, 'data' => [
                        'latest_version' => [
                            'major_version' => $update->major_version,
                            'minor_version' => $update->minor_version,
                            'title' => $update->title,
                            'notes' => $update->notes
                            
                        ],
                        'local_version' => [
                            'local_major_version' => $user_details->app_major_version,
                            'local_minor_version' => $user_details->app_major_version,
                        ]
                    ]];
                } else return ['status' => false, 'message' => 'Update not found'];
            } else return ['status' => false, 'message' => 'User details not found'];
        } else return ['status' => false, 'message' => 'User not found'];
    });

    Route::post('get-latest-update', function(Request $request) {
        $user_id = $request->input('user_id');
        $portal_id = $request->input('portal_id');
        $sub_portal_id = $request->input('sub_portal_id');

        $user = User::find($user_id);
        if(isset($user)) {
            $user_details = UserDetails::where('user_id', $user_id)->first();
            if(isset($user_details)) {
                
                $update = AppUpdates::where('app_id', $portal_id)->where('sub_app_id', $sub_portal_id)->where('is_active', 1)->where('is_approved', 1)
                ->orderBy('major_version', 'DESC')->orderBy('minor_version', 'DESC')->first();

                return ['status' => true, 'data' => [
                    'app' => [
                        'latest_major_version' => $update->major_version,
                        'latest_minor_version' => $update->minor_version,
                        'local_major_version' => $user_details->app_major_version,
                        'local_minor_version' => $user_details->app_major_version
                    ],
                ]];
            } else return ['status' => false, 'message' => 'User details not found'];
        } else return ['status' => false, 'message' => 'User not found'];
    });

    Route::post('set-version-update-shown', function(Request $request) {
        $user_id = $request->input('user_id');
        $major_version = $request->input('major_version');
        $minor_version = $request->input('minor_version');

        $user = User::find($user_id);
        if(isset($user)) {  
            $user_details = UserDetails::where('user_id', $user->id)->first();
            if($user_details) {
                $user_details->app_major_version = $major_version;
                $user_details->app_minor_version = $minor_version;
                $user_details->save();

                return ['status' => true, 'message' => 'Record updated'];
            }
        }
    });
});
