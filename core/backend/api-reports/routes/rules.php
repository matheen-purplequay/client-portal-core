<?php
use App\Mail\SendReportApprovalRequest;
use App\Models\Companies;
use App\Models\CompanyServices;
use App\Models\ClientPortalRules;
use App\Models\CPSections;
use App\Models\CPRuleMaster;
use App\Models\EngagementVerticals;
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
Route::prefix('client')->group(function() {
    // Start of prefix Rules
    Route::prefix('rules')->group(function() {
        
        Route::post('get-rules-by-client', function(Request $request) {
            try {
                if(!$request->has('client_id') || !$request->has('vertical_id') || !$request->has('dashboard_id')) return ['status' => false, 'message' => 'Invalid parameters'];
                
                $client_id = $request->input('client_id');
                $service_id = $request->input('vertical_id');
                $dashboard_id = $request->input('dashboard_id');
    
                $rules = ClientPortalRules::where('client_id', $client_id)
                    ->where('service_id', $service_id)
                    ->where('dashboard_id', $dashboard_id)
                    ->first();
    
                return ['status' => true, 'data' => [ 'rules' => $rules ]];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while fetching dashboard rules'];
            }
        });
        
        Route::post('get-rules-by-project', function(Request $request) {
            try {
                if(!$request->has('project_id') || !$request->has('vertical_id') || !$request->has('dashboard_id')) return ['status' => false, 'message' => 'Invalid parameters'];
                if($request->input('project_id') <= 0 || $request->input('vertical_id') <= 0 || $request->input('dashboard_id') <= 0 ) return ['status' => false, 'message' => 'Invalid values'];
                
                $company = Companies::where('works_manager_client_id', $request->input('project_id'))->first();
                
                if(!isset($company)) return ['status' => false, 'message' => 'No client found'];
                
                $client_id = $company->id;
                $service_id = $request->input('vertical_id');
                $dashboard_id = $request->input('dashboard_id');
            
                $rules = ClientPortalRules::where('client_id', $client_id)
                    ->where('service_id', $service_id)
                    ->where('dashboard_id', $dashboard_id)
                    ->first();
                
                return ['status' => true, 'data' => [ 'rules' => $rules ]];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while fetching dashboard rules'];
            }

        });
        
    });
    // End of prefix Rules
});


// Admin Portal Routes
Route::prefix('admin')->group(function() {
    Route::prefix('rules')->group(function() {

        // Start of prefix Rules

        Route::post('get-rules-by-client', function(Request $request) {
            $client_id = $request->input('client_id');
            $vertical_id = $request->input('vertical_id');
            $dashboard_id = $request->input('dashboard_id');

            $rules = PortalRules::where('client_id', $client_id)
                ->where('vertical_id', $vertical_id)
                ->where('dashboard_id', $dashboard_id)
                ->first();
            return ['status' => true, 'data' => [ 'rules' => $rules ]];
        });

        Route::post('save-rules-by-client', function(Request $request) {
            $client_id = $request->input('client_id');
            $vertical_id = $request->input('vertical_id');
            $dashboard_id = $request->input('dashboard_id');
            $rules = $request->input('rules');
    
            PortalRules::updateOrCreate(
                [
                    'client_id'=> $client_id,
                    'vertical_id' => $vertical_id,
                    'dashboard_id' => $dashboard_id
                ],
                [
                    'client_id'=> $client_id,
                    'vertical_id' => $vertical_id,
                    'dashboard_id' => $dashboard_id,
                    'rule' => $rules
                ]
            );
    
            return ['status' => true, 'message' => 'Rules updated for client'];
        });

        Route::post('reset-rules-for-client', function(Request $request) {
            $client_id = $request->input('client_id');
            ClientPortalRules::where('client_id', $client_id)->delete();
    
            return ['status' => true, 'message' => 'Rules deleted for client' . $client_id];
        });

        // CP Sections Routes
        Route::prefix('client-portal-rules')->group(function() {

            Route::get('get-rule-master', function() {
                $rule_master = CPRuleMaster::leftJoin('cp_sections as cps', 'cp_rule_master.section_id', 'cps.id')
                    ->selectRaw(
                        'cps.dashboard_id as dashboard_id, cps.id as section_id, cps.title as section_title, cps.code as section_code, cp_rule_master.title as rule_master_title, cp_rule_master.rule_code as rule_code, cp_rule_master.value, cp_rule_master.available_values, cp_rule_master.type, cp_rule_master.target, cp_rule_master.reset_value as reset_value'
                    )->get();

                $groupedData = collect($rule_master)->map(function ($item) {
                    return [
                        'title' => $item['section_title'],
                        'code' => $item['section_code'],
                        'rules' => [$item],
                        'dashboard_id' =>  $item['dashboard_id']
                    ];
                })->groupBy('code');

                return ['status' => true, 'data' => $groupedData];
            });

            Route::post('get-rules', function(Request $request) {
                $client_id = $request->input('client_id');
                $service_id = $request->input('vertical_id');
                $dashboard_id = $request->input('dashboard_id');
    
                $rules = ClientPortalRules::where('client_id', $client_id)
                    ->where('service_id', $service_id)
                    ->where('dashboard_id', $dashboard_id)
                    ->first();
                
                return ['status' => true, 'data' => $rules];
            });
            
            Route::post('set-rules', function(Request $request) {
                $client_id = $request->input('client_id');
                $dashboard_id = $request->input('dashboard_id');
                $service_id = $request->input('service_id');
                $rules = $request->input('rules');

                ClientPortalRules::updateOrCreate(
                    [
                        'client_id'=> $client_id,
                        'dashboard_id' =>  $dashboard_id,
                        'service_id' =>  $service_id
                    ],
                    [
                        'rules' => $rules
                    ]
                );
                
                return ['status' => true, 'message' => 'Rule have been saved', 'request' => $request->all()];
            });
        });

        // End of prefix Rules
    });
});


    