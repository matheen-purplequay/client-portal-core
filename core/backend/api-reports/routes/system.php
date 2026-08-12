<?php
use App\Mail\SendReportApprovalRequest;
use App\Models\Apps;
use App\Models\AppUpdates;
use App\Models\ClientPortalMessages;
use App\Models\Companies;
use App\Models\Company;
use App\Models\DashboardsMaster;
use App\Models\PortalRules;
use App\Models\User;
use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mime\Test\Constraint\EmailHeaderSame;


// Client Routes
Route::prefix('client')->group(function() {
    Route::prefix('server')->group(function() {

        Route::get('get-client-portal-health', function() {
            $health = [];
            $portalHealth = 0;

            try {
                $clientApp = Apps::find(1);
                if($portalHealth !== -1 && isset($clientApp)) {
                    $health['client'] = [ 
                        'status' => 'healthy', 
                        'name' => $clientApp->name,
                        'type' => 'App Server',
                        'version' => $clientApp->major_version . '.' . $clientApp->minor_version,
                        'updated' => $clientApp->updated_at
                    ];
                    $portalHealth = 1;
                } else $portalHealth = 0;
            } catch(Exception $e) {
                $portalHealth = -1;
            }

            $healthLegend = [-1 => 'Critical', 0 => 'Operational', 1 => 'Operational', 2 => 'Network Issues', 3 => 'Warning', 4 => 'Critical'];
            
            $health['portalHealth'] = [
                'code' => $portalHealth,
                'message' => $healthLegend[$portalHealth]
            ];
    
            return [
                'status' => true,
                'data' => $health
            ];

        });

        // Get System Health
        Route::get('get-jobs-server-health', function() {
            $health = [];
            $worksManagerHealth = 0;
            
            try {
                $worksManagerApp = DB::connection('wm_mysql')->table('project')->first();
                if($worksManagerHealth !== -1 && isset($worksManagerApp)) $worksManagerHealth = 1;
                else $worksManagerHealth = 0;
            } catch(Exception $e) {
                $worksManagerHealth = -1;
            }
    
            $healthLegend = [-1 => 'Critical', 0 => 'Operational', 1 => 'Operational', 2 => 'Network Issues', 3 => 'Warning', 4 => 'Critical'];

            $health['worksManager'] = [
                'code' => $worksManagerHealth,
                'message' => $healthLegend[$worksManagerHealth]
            ];
    
            return [
                'status' => true,
                'data' => $health
            ];
        });
    });
    
    // App related routes
    Route::prefix('app')->group(function() {
        Route::get('get-client-portal-message', function() {
            $message = ClientPortalMessages::where('id', 1)->where('status', 'active')->first();
    
            return ['status' => true, 'data' => $message];
        });

        Route::post('get-recent-client-portal-updates', function(Request $request) {
            $company_id = $request->input('company_id');
            $company = Company::where('id', $company_id)->first();
            if(isset($company)) $updates = AppUpdates::where('app_id', 1)->where('sub_app_id', $company->sub_app_id)->limit(5)->get();
            else $updates = [];

            return ['status' => true, 'data' => $updates];
        });
    });

});


// Admin Routes
Route::prefix('admin')->group(function() {
    Route::prefix('server')->group(function() {

        Route::get('health', function() {
            $health = [];

            try {
                $clientApp = Apps::find(1);
                $adminApp = Apps::find(2);
                $worksManagerApp = DB::connection('wm_mysql')->table('project')->first();
            } catch(Exception $e) {

            }

            $isClientAppWorking = false;
            $isAdminAppWorking = false;
            $isWorksManagerAppWorking = false;

            try {
                if(isset($clientApp)) {
                    $health['client'] = [ 
                        'status' => 'healthy', 
                        'name' => $clientApp->name,
                        'type' => 'Web Server',
                        'version' => $clientApp->major_version . '.' . $clientApp->minor_version
                    ];
                    $isClientAppWorking = true;
                } else $isClientAppWorking = false;

            } catch(Exception $e) {
                $isClientAppWorking = false;
            }

            try {
                if(isset($adminApp)) {
                    $health['admin'] = [ 
                        'status' => 'healthy', 
                        'name' => $adminApp->name,
                        'type' => 'Web Server',
                        'version' => $adminApp->major_version . '.' . $adminApp->minor_version
                    ];
                    $isAdminAppWorking = true;
                } else $isAdminAppWorking = false;
            } catch(Exception $e) {
                $isAdminAppWorking = false;
            }

            try {
                if(isset($worksManagerApp)) {
                    $health['worksmanager'] = [ 
                        'status' => 'healthy', 
                        'type' => 'Database Server',
                        'name' => 'Works Manager Server',
                    ];
                    $isWorksManagerAppWorking = true;
                } else $isWorksManagerAppWorking = false;
            } catch(Exception $e) {
                $isWorksManagerAppWorking = false;
            }

            return [
                'status' => true,
                'data' => $health
            ];
        });

    });

    Route::prefix('app')->group(function() {
        Route::prefix('updates')->group(function() {

            Route::get('list', function() {
                $updates = AppUpdates::all();

                return ['status' => true, 'data' => $updates];
            });

        });
    });
});