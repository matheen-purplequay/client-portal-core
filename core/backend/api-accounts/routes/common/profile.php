<?php

use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\LoginActivity;
use App\Models\User;
use App\Models\RolesMaster;
use App\Models\UserDetails;
use App\Models\WhitelistIPs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;


// Profile  activities
Route::prefix('profile')->group(function() {

    Route::post('get-profile-picture-by-user-id', function(Request $request) {
        $user_id = $request->input('user_id');
        $user_details = UserDetails::where('user_id', $user_id)->first();
        if($user_details !== null && $user_details->profile_picture !== null) {
            $path = Storage::disk('local')->path($user_details->profile_picture);
        
            // Create a preview link using Laravel's `url` helper
            // $previewLink = url('/storage/app/' . $picture);
            $previewLink = asset(Storage::disk('local')->url($user_details->profile_picture));
    
            return ['status' => true, 'data' => $previewLink, 'path' => $path];
        } else return ['status' => false, 'message' => 'Profile picture not found'];
    });

    Route::post('save-profile-photo', function(Request $request) {
        try {
            if ($request->hasFile('photo') && $request->has('client_id')) {

                $client_id = $request->input('client_id');
                $file = $request->file('photo');
                $fileName = 'profile_photo.jpg';
                $path =  'users/' . $client_id . '/profile/photos';
                $file_path = $file->storeAs($path, $fileName, 'public');
                $user_details = UserDetails::where('user_id', $client_id)->first();
                if($user_details !== null) {
                    $path = Storage::url($user_details->profile_picture);
                    $previewLink = asset(Storage::disk('local')->url($user_details->profile_picture));

                    $user_details->profile_picture = $file_path;
                    $user_details->save();
                    return ['status' => true, 'message' => 'Profile photo saved', 'path' => $previewLink, 'preview' => $path];
                } else return ['status' => false, 'message' => 'User not found'];


            } else {
                if(!$request->hasFile('photo')) return ['status' => false, 'message' => 'Profile photo missing'];
                if(!$request->has('client_id')) return ['status' => false, 'message' => 'Required details missing'];
            }                
        } catch(Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong while saving profile photo.', 'error' => $e->getMessage()];
        }

    });
});
