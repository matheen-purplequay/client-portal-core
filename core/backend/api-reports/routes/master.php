<?php
use App\Mail\SendReportApprovalRequest;
use App\Models\Companies;
use App\Models\DashboardsMaster;
use App\Models\JobStatus;
use App\Models\MasterData;
use App\Models\MasterGroups;
use App\Models\ModulesMaster;
use App\Models\PortalRules;
use App\Models\User;
use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mime\Test\Constraint\EmailHeaderSame;


// Client Portal Routes
Route::prefix('client')->group(function () {
    Route::prefix('master')->group(function () {
        Route::post('get-master-data', function(Request $request) {
            $module_id =  $request->input('module_id');
            $category =  $request->input('category');
            $code =  $request->input('code');

            $dataSQL = MasterData::where('module_id', $module_id)
                ->where('category', $category);

            if($request->has('code')) $dataSQL = $dataSQL->where('code', $request->input('code'));

            $data = $dataSQL->get();

            return ['status' => true, 'data' => $data];
        });

        Route::post('get-master-by-id', function(Request $request) {
            $master_id =  $request->input('master_id');

            $data = MasterData::find($master_id);

            return ['status' => true, 'data' => $data];
        });
    });
});


// Admin Portal Routes
Route::prefix('admin')->group(function () {
    Route::prefix('master')->group(function () {

        Route::get('get-all-master-groups', function (Request $request) {
            $groups = MasterGroups::all();

            return ['status' => true, 'data' => $groups];
        });

        Route::post('get-master-categories', function(Request $request) {
            $module_id = $request->input('module_id');
            $group_id = $request->input('group_id');

            $categories = MasterData::where('module_id', $module_id)->where('master_group_id', $group_id)->select('category')->groupBy('category')->orderBy('category', 'ASC')->get();

            return ['status' => true, 'data' => $categories];
        });

        Route::post('get-master-groups-by-module', function(Request $request) {
            $module_id = $request->input('module_id');
            $master_groups = MasterGroups::where('module_id', $module_id)->groupBy('code')->orderBy('title', 'ASC')->get();

            return ['status' => true, 'data' => $master_groups];
        });

        // Master Data
        Route::prefix('master-data')->group(function() {
            Route::post('get', function(Request $request) {
                $group_id = $request->input('group_id');
                $category = $request->input('category');

                $master_data = MasterData::where('master_group_id', $group_id)
                    ->where('category', $category)->get();

                return ['status' => true, 'data' => $master_data];
            });

            Route::post('add-data', function(Request $request) {
                $title = $request->input('title');
                $code = $request->input('code');
                $value = $request->input('value');

                $master_data = MasterData::insert([
                    'title' => $title,
                    'code' => $code,
                    'value' => $value
                ]);

                return ['status' => true, 'message' => 'Master data added', 'data' => $master_data];
            });

            Route::post('update-data', function(Request $request) {
                $master_data_id = $request->input('master_data_id');
                $title = $request->input('title');
                $code = $request->input('code');
                $value = $request->input('value');

                MasterData::whereId($master_data_id)->update([
                    'title' => $title,
                    'code' => $code,
                    'value' => $value
                ]);

                return ['status' => true, 'message' => 'Master data updated'];
            });
        });

        // Modules 
        Route::prefix('modules')->group(function () {
            Route::get('get-all-modules', function (Request $request) {
                $modules = ModulesMaster::all();

                // $newEncrypter = new \Illuminate\Encryption\Encrypter($theOtherKey, Config::get('app.cipher'));
                // $encrypted = $newEncrypter->encrypt($plainTextToEncrypt);
                // $decrypted = $newEncrypter->decrypt($encrypted);

                return ['status' => true, 'data' => $modules];
            });

        });

        // Dashboard Master Admin Routes
        Route::prefix('dashboard-master')->group(function () {

            Route::post('get-dashboard-master-by-id', function (Request $request) {
                $dashboard_ids = $request->input('dashboard_ids');

                $ids = explode(',', $dashboard_ids);
                $dashboards = DashboardsMaster::whereIn('code', $ids)->get();

                return ['status' => true, 'data' => $dashboards];
            });

            Route::get('get-dashboard-master', function () {
                $dashboards = DashboardsMaster::where('is_active', 1)->get();

                return ['status' => true, 'data' => $dashboards];
            });
        });


        // Jobs Master 
        Route::prefix('job-status')->group(function () {
            Route::post('set-job-status-master', function (Request $request) {
                try {
                    $status = $request->input('status');
                    $user_id = $request->input('user_id');

                    DB::connection('wm_mysql')->select('call Sp_CreateSMSFSecondaryStatus(?,?)', array ($status, $user_id));

                    return ['status' => true, 'message' => 'New job status have been saved'];
                } catch (Exception $e) {
                    throw new Exception("Error saving job status. " . $e->getMessage(), 1);
                }
            });

            Route::get('get-primary-job-status', function() {
                $primary_status = DB::connection('wm_mysql')->table('tbl_smsfjobstatus')->get();

                return ['status' => true, 'data' => $primary_status];
            });

            Route::prefix('secondary-job-status')->group(function() {
                // Get list of secondary job status 
                Route::get('get-secondary-job-status', function() {
                    $secondary_status = DB::connection('wm_mysql')->table('tbl_smsfsecondaryjobstatus')->get();

                    return ['status' => true, 'data' => $secondary_status];
                });

                // Map primary job status to secondary job status
                Route::post('map-primary-job-status', function(Request $request) {
                    // call Sp_primarysecondarystatusmapping(Clientid,primarystatus,secondarystatus,userid)    
                    $project_id = $request->input('project_id');
                    $primary_status = $request->input('primary_status');
                    $secondary_status = $request->input('secondary_status');
                    $user_id = $request->input('user_id');

                    DB::connection('wm_mysql')->select('call Sp_primarysecondarystatusmapping(?,?,?,?)', array ($project_id, $primary_status, $secondary_status, $user_id));

                    return ['status' => true, 'message' => 'Primary status mapped to secondary status'];
                });
    
                // Get list of secondary job status
                Route::post('get-mapped-status-list', function(Request $request) {
                    // call Sp_retriveprimarysecondarystatus(Clientid)
                    $project_id = $request->input('project_id');

                    $status = DB::connection('wm_mysql')->select('call Sp_retriveprimarysecondarystatus(?)', array ($project_id));
                    $newStatus = collect($status)->groupBy('secondarystatus');

                    return ['status' => true, 'data' => $newStatus, 'ungrouped' => $status];
                });
    
                // Remove primary status from secondary status mapping
                Route::post('remove-primary-job-status-mapping', function(Request $request) {
                    // Sp_removeprimarysecondarystatus(code)
                    $code = $request->input('code');

                    DB::connection('wm_mysql')->select('call Sp_removeprimarysecondarystatus(?)', array ($code));
                });

                // Route::post('set-default-secondary-status', function(Request $request) {
                //     $project_id = $request->input('project_id');

                //     $secondaryStatus = [
                //         1 => [
                //             'pid' => $project_id,
                //             'primarystatus' => 1,
                //             'secondarystatus' => 1,
                //             'createdBy' => 1
                //         ],
                //         2 => [
                //             'pid' => $project_id,

                //         ]
                //     ];
                // });
            });

        });

    });
});
