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

// App Updates
Route::prefix('apps')->group(function() {

    Route::prefix('portals')->group(function() {

        Route::get('get-all-portals', function() {
            $portals = Apps::all();

            return ['status' => true, 'data' => $portals];
        });

        Route::get('get-all-sub-portals', function() {
            $sub_portals = SubApps::all();

            return ['status' => true, 'data' => $sub_portals];
        });

    });


    // ADMIN App Update Routes
    Route::prefix('updates')->group(function() {
        Route::post('get-app-updates', function(Request $request) {
            $portal_id = $request->input('portal_id');
            $sub_portal_id = $request->input('sub_portal_id');

            $updates = AppUpdates::where('app_id', $portal_id)
                ->where('sub_app_id', $sub_portal_id)
                ->orderBy('major_version', 'DESC')
                ->orderBy('minor_version', 'DESC')
                ->get();

            return ['status' => true, 'data' => $updates];
        });

        Route::post('get-app-update-by-id', function(Request $request) {
            $id = $request->input('id');

            $update = AppUpdates::find($id);

            return ['status' => true, 'data' => $update];
        });

        Route::post('launch-new-app-version', function(Request $request) {            
            $portal_id = $request->input('portal_id');
            $sub_portal_id = $request->input('sub_portal_id');
            $release_title = $request->input('title');
            $release_notes = $request->input('notes');

            $portal = Apps::find($portal_id);

            if(isset($portal)) {
                try {
                    $major_version = (int)$portal->major_version;
                    $minor_version = (int)$portal->minor_version;
                    $old_version = $major_version . '.' . $minor_version;
    
                    if($minor_version < 10) {
                        $minor_version = $minor_version + 1;
                    } else {
                        $minor_version = 0;
                        $major_version = $major_version + 1;
                    }
    
                    $portal->major_version = $major_version;
                    $portal->minor_version = $minor_version;
                    
                    $release = AppUpdates::create([
                        'app_id' => $portal_id,
                        'sub_app_id' => $sub_portal_id,
                        'title' => $release_title,
                        'notes' => $release_notes,
                        'major_version' => $major_version,
                        'minor_version' => $minor_version
                    ]);
    
                    $new_version = $major_version . '.' . $minor_version;
    
                    return ['status' => true, 'message' => 'App version updated', 'new_version' => $new_version, 'old_version' => $old_version ];
                } catch(Exception $e) {
                    return ['status' => true, 'message' => 'Something went wrong', 'error' => [
                        'code' => 'AUP001',
                        'title' => 'Something went wrong',
                        'message' => $e->getMessage()
                    ]];
                }
            }
        });


        Route::post('activate-update', function(Request $request) {            
            $update_id = $request->input('update_id');
            $update = AppUpdates::find($update_id);

            $portal = Apps::find($update->app_id);
            $portal->major_version = $update->major_version;
            $portal->minor_version = $update->minor_version;
            $portal->save();

            if(isset($update)) {
                $update->is_approved = 1;
                $update->save();

                return ['status' => true, 'message' => 'Release is activated'];
            } else return ['status' => false, 'message' => 'No update found'];

        });

        Route::post('delete-update', function(Request $request) {            
            $update_id = $request->input('update_id');
            $update = AppUpdates::find($update_id);

            if(isset($update)) {
                $update->delete();

                return ['status' => true, 'message' => 'Deleted release'];
            } else return ['status' => false, 'message' => 'No update found'];

        });
    });

});