<?php

use App\Mail\SendMail;
use App\Mail\SendMessage;
use App\Mail\SendOtpMail;
use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\User;
use App\Models\Teams;
use App\Models\App;
use App\Models\AdminPortalPermissions;
use App\Models\ClientPortalPermissions;
use App\Models\RolesMaster;
use App\Models\ClientPortalRules;
use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\ContactFormRecipients;
use App\Notifications\NewCommentNotification;
use Illuminate\Support\Facades\DB;

Route::prefix('admin')->group(function() { 
    
    Route::post('get-self-users', function(Request $request) {
        $type = $request->input('company_type');
        $category = $request->input('user_category');

        $usersSQL = User::selectRaw('users.id, user_details.wm_user_id, CONCAT(users.first_name, " ", users.last_name) as name, users.email')
            ->leftJoin('user_details', 'user_details.user_id', '=', 'users.id')
            ->leftJoin('roles_master', 'user_details.role_id', '=', 'roles_master.id')
            ->where('roles_master.code', '!=', 'admin')
            ->where('user_details.company_id', '=', 1);
            
        if($request->has('company_type') && isset($type)) $usersSQL = $usersSQL->where('roles_master.type', $type);
        if($request->has('user_category') && isset($category)) $usersSQL = $usersSQL->where('roles_master.type', $category);
            
        $users = $usersSQL->orderBy('name', 'ASC')->get();
        
        return ['status' => true, 'data' => $users];
    });

    Route::post('get-team-users', function(Request $request) {
        $type = $request->input('company_type');
        $category = $request->input('user_category');
        $error = '';
        $uids = [];
        $user_id = 0;
        $user_details = [];
        $team = [];
        
        try {
            if($request->has('logged_in_user')) {
                $logged_in_user = $request->input('logged_in_user');
                $user_id = $logged_in_user['user_id'];
                $user_details = UserDetails::where('user_id', $user_id)->first();
                $wm_user = DB::connection('wm_mysql')->table('user')->where('uid', $user_details->wm_user_id)->first();
                $team = DB::connection('wm_mysql')->table('teamleaderusermaster')->where('TLID', $wm_user->TLID)->first();
                $uids = explode(',', $team->UID);
                $teamUsersSQL = User::selectRaw('users.id, user_details.wm_user_id, CONCAT(users.first_name, " ", users.last_name) as name, users.email')
                    ->leftJoin('user_details', 'user_details.user_id', '=', 'users.id')
                    ->leftJoin('roles_master', 'user_details.role_id', '=', 'roles_master.id')
                    ->where('user_details.user_id', '!=', $user_details->user_id)
                    ->whereIn('user_details.wm_user_id', $uids)
                    ->where('user_details.company_id', '=', 1);
                    
                if($request->has('company_type') && isset($type)) $teamUsersSQL = $teamUsersSQL->where('roles_master.type', $type);
                if($request->has('user_category') && isset($category)) $teamUsersSQL = $teamUsersSQL->where('roles_master.type', $category);
                    
                $users = $teamUsersSQL->orderBy('name', 'ASC')->get();
                
                return ['status' => true, 'data' => $users, 'user_id' => $user_id, 'user_details' => $user_details, 'wm_user_id' => $user_details->wm_user_id, 'uids' => $team->UID];
            }
        } catch(Exception $e) {
            $error = $e->getMessage();
            return ['status' => false, 'data' => [], 'error' => $error];
        }

    });

    Route::get('get-internal-wm-users', function() {
        $existing_users = User::leftJoin('user_details', 'user_details.user_id', 'users.id')->where('user_details.company_id', 1)->get()->pluck('email');
        $wm_users = DB::connection('wm_mysql')->table('user')->whereNotIn('NewOfficialEmailID', $existing_users)->where('Accessstatus', 0)->orderBy('Firstname')->get();

        return ['status' => true, 'data' => $wm_users];
    });
    
    Route::get('/test-notification', function() {
        $user = User::find(1);
        $user->notify(new NewCommentNotification("user", "title", "message"));
    });
    
    Route::post('/get-permissions', function(Request $request) {
        $role = $request->input('role');
        $permissions = AdminPortalPermissions::where('role', $role)->get();
        $sql = AdminPortalPermissions::where('role', $role)->toSQL();
        
        $responseData = [];
        foreach ($permissions as $permission) {
            $responseData[$permission->module] = [
                'create'    => ($permission->can_create)?   true : false,
                'read'      => ($permission->can_read)?     true : false,
                'update'    => ($permission->can_update)?   true : false,
                'delete'    => ($permission->can_delete)?   true : false,
                'review'    => ($permission->can_review)?   true : false
            ];
        }        

        return ['status' => true, 'data' => $responseData, 'sql' => $sql];
    });
    
    Route::get('/get-all-roles', function() {
        $roles = RolesMaster::orderBy('heirarchy', 'ASC')->get();
        return ['status' => true, 'data' => $roles];
    });
    
    
    // Get roles by type
    Route::post('/get-roles-by-type', function(Request $request) {
        $type = $request->input('type');
        $roles = RolesMaster::where('type', $type)->orderBy('heirarchy', 'ASC')->get();
        return ['status' => true, 'data' => $roles];
    });
    
    // Get admin portal permissions
    Route::post('/get-permissions-by-role', function(Request $request) {
        $role = $request->input('role');
        $type = $request->input('type');
        $responseData = [];
        
        if($type == 'self') {
            $permissions = AdminPortalPermissions::where('role', $role)->get();
        } else {
            $permissions = ClientPortalPermissions::where('role', $role)->get();
        }
        return ['status' => true, 'data' => $permissions];
    });
    
    // Modules Route Group
    Route::prefix('modules')->group(function() {
        Route::get('/all', function() {
            $modules = DB::table('modules_master')->get();
            
            return ['status' => true, 'data' => $modules];
        });
        
        Route::post('/add', function(Request $request) {
            $title = $request->input('title');
            $code = str_replace(' ', '_', strtolower($title));
            $portal = $request->input('portal');
            $description = $request->input('description');
            
            try {
                DB::table('modules_master')->insert([
                    'title' => $title,
                    'code' => $code,
                    'portal' => $portal,
                    'description' => $description
                ]);
                return ['status' => true, 'message' => 'New module inserted'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong', 'error' => $e];
            }
            
        });
    });
    
    // Routes for CLIENTS
    Route::prefix('companies')->group(function() {
        Route::get('/get/all-from-portal', function() {
            $companies = Company::where('id', '!=', '1')->get();
            return ['status' => true, 'companies' => $companies];
        });
        
        Route::post('/get/company-from-portal', function(Request $request) {
            $client_id = $request->input('client_id');
        
            $company = Company::find($client_id);
            return ['status' => true, 'company' => $company];
        });
    });

    // Routes for Client Users
    Route::prefix('client-users')->group(function() {
        Route::post('get-client-management-users-by-client', function(Request $request) {
            $heirarchy = $request->input('heirarchy');
            $client_id = $request->input('client_id');

            $roles = RolesMaster::where('type', 'client')->where('category', 'management')->get();
            $role_ids = $roles->pluck('id');

            $users = User::select('users.id', 'users.first_name', 'users.last_name', 'users.email', 'roles_master.title')
                ->where('user_details.company_id', $client_id)
                ->whereIn('user_details.role_id', $role_ids)
                ->leftJoin('user_details', 'user_details.user_id', 'users.id')
                ->leftJoin('roles_master', 'roles_master.id', 'user_details.role_id')
                ->get();

            return ['status' => true, 'data' => $users];
        });
    });
    
    
    // App specific routes
    Route::prefix('apps')->group(function() {

        // Get App Status
        Route::get('get-app-status', function() {
            $app = App::find(1);
            
            return ['status' => true, 'data' => $app]; 
        });
        
        // Set App Maintenance Status
        Route::middleware('auth:sanctum')->get('set-under-maintenance', function() {
            $app = App::find(1);
            $user = Auth::user();

            if(isset($user)) {
                $user_details = UserDetails::where('user_id', $user->id)->first();
                if(isset($user_details)) {
                    if($user_details->role == 'admin') {
                        $app->status = 2;
                        $app->save();
                        return ['status' => true, 'data' => $user]; 
                    } else {
                        return ['status' => false, 'data' => []];
                    }
                }else  return ['status' => false, 'data' => 'No user details'];
            } else  return ['status' => false, 'data' => 'No user'];
        });

        // Set App Live Status
        Route::middleware('auth:sanctum')->get('set-live', function() {
            $app = App::find(1);
            $user = Auth::user();
            try {
                if(isset($user)) {
                    $user_details = UserDetails::where('user_id', $user->id)->first();
                    if(isset($user_details)) {
                        if($user_details->role == 'admin') {
                            $app->status = 1;
                            $app->save();
                            return ['status' => true, 'data' => $user]; 
                        } else {
                            return ['status' => false, 'data' => []]; 
                        }
                    }
                }
            } catch(Exception $e) {
                return ['status' => false, 'user' => $user,  'message' => 'Set Live exception', 'error' => $e->getMessage()]; 
            }
        });
    });




    include('admin/client-admin.php');
    include('admin/user-activities.php');
    include('admin/app.php');
});
