<?php

use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\LoginActivity;
use App\Models\User;
use App\Models\RolesMaster;
use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Stevebauman\Location\Facades\Location;


// Routes for getting all kinds of user activities
Route::prefix('activities')->group(function() {

    // Login activities
    Route::prefix('login-activities')->group(function() {

        Route::post('get-login-activities', function(Request $request) {
            $portal_type = $request->input('portal_type');

            $activityQuery = LoginActivity::select(
                'users.email', 
                'users.first_name', 
                'users.last_name', 
                'login_activity.login_timestamp', 
                'login_activity.ip_address', 
                'companies.name as company_name', 
                'companies.dashboards', 
                'login_activity.location',
                'login_activity.device_info'
            )
                ->leftJoin('users', 'users.id', 'login_activity.user_id')
                ->leftJoin('user_details', 'user_details.user_id', 'users.id')
                ->leftJoin('companies', 'companies.id', 'user_details.company_id')
                ->where('user_details.company_id', '!=', 1)
                ->where('users.email', 'not like', '%purplequay%')
                ->where('users.email', 'not like', '%carisma%');
            
            if ($portal_type == '1') {
                $activityQuery->where('companies.sub_app_id', 1);
            } else if ($portal_type != '1') {
                $activityQuery->where('companies.dashboards', 2);
            }
            
            // Add the ordering and pagination
            $data = $activityQuery->orderByRaw('login_activity.login_timestamp DESC')
                ->paginate(10);
            
            return ['status' => true, 'data' => $data];
        });

        Route::post('update-login-location', function(Request $request) {
            $id = (int) $request->input('id');

            $last_id = 0;
            $recordsUpdated = 0;
        
            LoginActivity::where('id', '>=', $id)->chunk(45, function($activities) use (&$last_id, &$recordsUpdated) {
                foreach($activities as $activity) {
                    $last_id = $activity->id;
                    if(isset($activity->ip_address)) {
                        $activity->location = json_encode(Location::get($activity->ip_address));
                        $activity->save();
                        $recordsUpdated++;
                    }
                }
            });
        
            return [
                'status' => true, 
                'message' => "$recordsUpdated records updated", 
                'id' => $id, 
                'last_id' => $last_id
            ];
        });

    });

});