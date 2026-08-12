<?php

use App\Mail\SendIPReqeuestApproved;
use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\NetworkLimitRequest;
use App\Models\QueryApprovers;
use App\Models\User;
use App\Models\RolesMaster;
use App\Models\UserDetails;
use App\Models\WhitelistIPs;
use App\Models\WhitelistIPsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;


// Client Admin Routes
Route::prefix('client-admin')->group(function () {

    // Create new company
    Route::post('/new', function (Request $request) {

        if ($request->has(['project_id', 'dashboards', 'master_company_id'])) {
            $project_id = $request->input('project_id');

            if (Company::where('works_manager_client_id', $project_id)->first() === null) {
                $wm_company = DB::connection('wm_mysql')->table('project')->where('Pid', $project_id)->first();

                // Check if company exists in client portal
                $existingCompany = Company::where('works_manager_client_id', $project_id)->first();

                if (isset($existingCompany)) {
                    return ['status' => false, 'message' => 'Client already exists'];
                } else {
                    $company = new Company();
                    $company->name = $wm_company->ClientName;
                    $company->dashboards = $request->input('dashboards');
                    $company->test_dashboards = $request->input('test_dashboards');
                    $company->works_manager_client_id = $wm_company->Pid;
                    $company->master_company_id = $request->input('master_company_id');
                    $company->industry_type = $request->input('industry_type');
                    $company->client_type = $request->input('client_type');
                    $company->save();

                    if ($request->has(['verticals'])) {
                        $verticals_data = $request->input('verticals');
                        $verticals = explode(',', $verticals_data);

                        if (count($verticals) > 0) {
                            foreach ($verticals as $v) {
                                $hasCompanyService = CompanyServices::where('client_id', $company->id)->where('service_id', $v)->first();
                                if (isset($hasCompanyService))
                                    $service = $hasCompanyService;
                                else
                                    $service = new CompanyServices();

                                $service->client_id = $company->id;
                                $service->service_id = $v;
                                $service->save();
                            }
                        }
                    }
                    return ['status' => true, 'message' => 'Company ' . $company->name . ' has been updated'];
                }
            } else
                return ['status' => false, 'message' => 'Company ' . $project_id . ' doesn\'t exists'];

        } else {
            return ['status' => false, 'message' => 'Something went wrong', 'requests' => $request->all()];
        }
    });

    // Update company
    Route::post('/update', function (Request $request) {

        if ($request->has(['client_id', 'dashboards'])) {
            $client_id = $request->input('client_id');

            $company = Company::where('id', $client_id)->first();

            // Check if company exists in client portal
            if (isset($company)) {

                $company->dashboards = $request->input('dashboards');
                $company->test_dashboards = $request->input('test_dashboards');
                $company->industry_type = $request->input('industry_type');
                $company->save();

                // Delete all engagement verticals specific to client
                $allEngagementVerticals = EngagementVerticals::where('client_id', $company->id)->delete();

                // Get incoming verticals
                $engagementVerticals = $request->input('engagementVerticals');

                foreach ($engagementVerticals as $ev) {

                    $service = new EngagementVerticals();

                    $service->client_id = $company->id;
                    $service->service_id = $ev['id'];
                    $service->engagement_id = $ev['engagement_id'];
                    $service->order_number = $ev['order_number'];
                    $service->save();
                }

                return ['status' => true, 'message' => 'Company ' . $company->name . ' has been updated'];
            } else
                return ['status' => false, 'message' => 'Company ' . $client_id . ' doesn\'t exists'];

        } else {
            return ['status' => false, 'message' => 'Required details not found.', 'requests' => $request->all()];
        }
    });

    Route::post('update-notifiable', function (Request $request) {
        $user_id = $request->input('user_id');
        $notifiable = $request->input('notifiable');

        $user_details = UserDetails::where('user_id', $user_id)->first();
        if (isset($user_details)) {
            $user_details->notify_report_approved = $notifiable;
            $user_details->save();
        }

        return ['status' => true, 'message' => 'Notifiable saved'];
    });

    // Get existing company from works manager
    Route::post('/fetch-company-from-wm', function (Request $request) {
        $project_id = $request->input('project_id');

        $wm_company = DB::connection('wm_mysql')->table('project')->where('Pid', $project_id)->first();
        if ($wm_company !== null) {

        }
    });

    // Get existing company from dashboard database
    Route::post('/fetch-company-from-dashboard-by-pid', function (Request $request) {
        $project_id = $request->input('project_id');
        $company = Company::where('works_manager_client_id', $project_id)->first();

        if (isset($company)) {

            $services = CompanyServices::selectRaw('company_services.id as company_service_id, services.id as id, services.wm_vertical_id, services.title')
                ->where('client_id', $company->id)->leftJoin('services', 'services.id', '=', 'company_services.service_id')
                ->get();

            $engagementVerticals = EngagementVerticals::leftJoin('services', 'services.id', '=', 'engagement_verticals.service_id')
                ->where('client_id', $company->id)
                ->get();

            return ['status' => true, 'data' => ['company' => $company, 'services' => $services, 'engagementVerticals' => $engagementVerticals], 'does_company_exists' => true];
        } else {
            return ['status' => true, 'data' => [], 'does_company_exists' => false];
        }
    });

    // Get existing company from dashboard database by company id
    Route::post('/fetch-company-from-dashboard-by-id', function (Request $request) {
        $client_id = $request->input('client_id');
        $company = Company::where('id', $client_id)->first();

        if (isset($company)) {

            $services = CompanyServices::selectRaw('company_services.id as company_service_id, services.id as id, services.wm_vertical_id, services.title')
                ->where('client_id', $company->id)->leftJoin('services', 'services.id', '=', 'company_services.service_id')
                ->get();

            $engagementVerticals = EngagementVerticals::leftJoin('services', 'services.id', '=', 'engagement_verticals.service_id')
                ->where('client_id', $company->id)
                ->get();

            return ['status' => true, 'data' => ['company' => $company, 'services' => $services, 'engagementVerticals' => $engagementVerticals], 'does_company_exists' => true];
        } else {
            return ['status' => true, 'data' => [], 'does_company_exists' => false];
        }
    });

    // Get client users
    Route::post('/get-client-users', function (Request $request) {
        $company_id = $request->input('company_id');

        $users = [];
        $usersSQL = User::selectRaw('users.id as user_id, users.first_name, users.last_name, users.email, user_details.wm_client_id, roles_master.title as role, roles_master.id as role_id, roles_master.code, user_details.status, user_details.is_active, user_details.network_limit, user_details.hide_in_selection')
            ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
            ->leftJoin('roles_master', 'roles_master.id', '=', 'user_details.role_id')
            ->where('user_details.company_id', '!=', '1')
            ->orderBy('users.created_at', 'ASC');

        if (isset($company_id)) {
            $usersSQL = $usersSQL->where('user_details.company_id', $company_id)->where('users.is_deleted', '!=', 1);
        }
        $users = $usersSQL->get();

        if (count($users) > 0)
            return ['status' => true, 'data' => $users];
        else
            return ['status' => false, 'data' => []];
    });
    
    // Get Client Users from WM
    Route::post('/get-wm-client-users', function (Request $request) {
        try {
            $company_id = $request->input('company_id');
            if(!$request->has('company_id')) return ['status' => false, 'message' => 'Invalid parameters'];
            
            $company = Company::where('id', $company_id)->first();
            if(!isset($company)) return ['status' => false, 'message' => 'No company found'];
            
            $wm_id = $company->works_manager_client_id;
            $contacts = DB::connection('wm_mysql')->table('contacts')->select('cid', 'pid', 'Contactname', 'Emailaddress', 'Designation')->where('pid', $wm_id)->get();
            
            return ['status' => true, 'data' => $contacts];
        } catch(Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong while getting users'];
        }
    });
    
    Route::post('/get-wm-client-contact-mapping', function(Request $request) {
        try {
            $company_id  = $request->input('company_id');
            $primary_cid = $request->input('primary_cid');
    
            if (!$request->has('company_id') || !$request->has('primary_cid')) {
                return ['status' => false, 'message' => 'Invalid parameters'];
            }
    
            $company = Company::where('id', $company_id)->first();
            if (!isset($company)) return ['status' => false, 'message' => 'No company found'];
    
            $wm_id = $company->works_manager_client_id;
    
            $mapping = DB::connection('wm_mysql')
                ->table('tbl_clientcontactmaping')
                ->where('Pid', $wm_id)
                ->where('PrimaryCid', $primary_cid)
                ->where('IsActive', 1)
                ->first();
    
            if (!$mapping) return ['status' => true, 'data' => []];
    
            $secondaryCids = array_filter(array_map('trim', explode(',', $mapping->SecondaryCid)));
    
            $contacts = DB::connection('wm_mysql')
                ->table('contacts')
                ->select(
                    'cid as SecondaryCid',
                    'Contactname as SecondaryName',
                    'Emailaddress as SecondaryEmail',
                    'Designation as SecondaryDesignation'
                )
                ->whereIn('cid', $secondaryCids)
                ->get();
    
            return ['status' => true, 'data' => $contacts];
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong while getting mapped client contacts'];
        }
    });

    Route::post('/save-wm-client-contact-mapping', function(Request $request) {
        try {
            $primaryCid    = $request->input('primary_cid');
            $secondaryCids = $request->input('secondary_cids');
            $pid           = $request->input('pid');
            $createdBy     = $request->input('logged_in_user.user_id');
    
            if (!$primaryCid || !$pid || !is_array($secondaryCids)) {
                return ['status' => false, 'message' => 'Invalid parameters'];
            }
    
            if (!empty($secondaryCids)) {
                DB::connection('wm_mysql')
                    ->table('tbl_clientcontactmaping')
                    ->updateOrInsert(
                        ['PrimaryCid' => $primaryCid, 'Pid' => $pid],
                        [
                            'SecondaryCid' => implode(',', $secondaryCids),
                            'IsActive'     => 1,
                            'CreatedBy'    => $createdBy,
                            'CreatedOn'    => now(),
                        ]
                    );
            } else {
                DB::connection('wm_mysql')
                    ->table('tbl_clientcontactmaping')
                    ->where('PrimaryCid', $primaryCid)
                    ->where('Pid', $pid)
                    ->update(['IsActive' => 0]);
            }
    
            return ['status' => true, 'message' => 'Contact mapping saved'];
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong while saving mapped client contacts'];
        }
    });



    Route::get('get-all-client-users', function () {
        $clients = [];
        $clientsSQL = User::selectRaw('users.id as user_id, users.first_name, users.last_name, companies.id as company_id, companies.works_manager_client_id as wm_client_id, companies.name as company_name, users.email, user_details.wm_client_id, roles_master.title as role, roles_master.id as role_id, roles_master.code, user_details.status')
            ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
            ->leftJoin('companies', 'companies.id', '=', 'user_details.company_id')
            ->leftJoin('roles_master', 'roles_master.id', '=', 'user_details.role_id')
            ->where('user_details.company_id', '!=', '1')
            ->orderBy('users.created_at', 'ASC');

        $clients = $clientsSQL->get();

        return ['status' => true, 'data' => $clients];
    });

    Route::post('get-all-client-users-by-filter', function (Request $request) {
        $clients = [];
        $clientsSQL = User::selectRaw('
                users.id as user_id, users.first_name, users.last_name, users.email, 
                companies.id as company_id, companies.works_manager_client_id as wm_client_id, companies.name as company_name, 
                user_details.wm_client_id, user_details.status,
                roles_master.title as role, roles_master.id as role_id, roles_master.code, 
                whitelist_ips.ipv4_address, whitelist_ips.device_info'
        )
            ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
            ->leftJoin('companies', 'companies.id', '=', 'user_details.company_id')
            ->leftJoin('roles_master', 'roles_master.id', '=', 'user_details.role_id')
            ->leftJoin('whitelist_ips', 'whitelist_ips.user_id', '=', 'users.id')
            ->where('user_details.company_id', '!=', '1')
            ->orderBy('users.created_at', 'ASC');

        // This left join causes duplicate records
        // ->leftJoin(DB::raw('(SELECT user_id, MAX(created_at) as last_login, location, login_timestamp, local_timestamp 
        // FROM login_activity 
        // GROUP BY user_id, location, login_timestamp, local_timestamp) as latest_login_activity'), 'latest_login_activity.user_id', '=', 'users.id')

        if ($request->has('filter_role_id'))
            $clientsSQL = $clientsSQL->where('roles_master.id', $request->input('filter_role_id'));

        $clients = $clientsSQL->get();

        return ['status' => true, 'data' => $clients];
    });

    // update client user
    Route::post('update-client-user', function (Request $request) {
        $email = $request->input('email');
        $first_name = $request->input('first_name');
        $middle_name = $request->input('middle_name');
        $last_name = $request->input('last_name');
        $user_id = $request->input('user_id');

        try {
            $user = User::where('id', $user_id)->first();
            $user_details = UserDetails::where('user_id', $user->id)->first();

            if (isset($user)) {
                $user->first_name = $first_name;
                $user->middle_name = $middle_name;
                $user->last_name = $last_name;
                $user->email = $email;
                $user->save();
            }

            if (isset($user_details)) {
                if ($request->has('is_active') && ($request->input('is_active') == 0 || $request->input('is_active') == 1))
                    $user_details->is_active = $request->input('is_active');
                if ($request->has('network_limit'))
                    $user_details->network_limit = $request->input('network_limit');
                if ($request->has('hide_in_selection') && ($request->input('hide_in_selection') == 0 || $request->input('hide_in_selection') == 1))
                    $user_details->hide_in_selection = $request->input('hide_in_selection');
                $user_details->save();
            }

            return ['status' => true, 'message' => 'User updated', 'user' => $user, 'user_details' => $user_details];
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
        }
    });

    Route::post('sync-works-manager-client-id', function (Request $request) {
        $user_id = $request->input('user_id');

        $user = User::where('id', $user_id)->first();
        try {
            if (isset($user)) {
                $user_details = UserDetails::where('user_id', $user_id)->get();
                if ($user_details->count() == 1) {
                    $user_detail = UserDetails::where('user_id', $user_id)->first();
                    $wm_user = DB::connection('wm_mysql')->table('contacts')->where('Emailaddress', $user->email)->first();
                    if (isset($wm_user)) {
                        $wm_id = $wm_user->Cid;
                        $user_detail->wm_client_id = $wm_id;
                        $user_detail->save();

                        $userSQL = User::selectRaw('users.id as user_id, users.first_name, users.last_name, users.email, user_details.wm_client_id, roles_master.title as role, roles_master.id as role_id, roles_master.code, user_details.status')
                            ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
                            ->leftJoin('roles_master', 'roles_master.id', '=', 'user_details.role_id')
                            ->where('user_details.company_id', '!=', '1')
                            ->where('users.id', $user_id);

                        $updated_user = $userSQL->first();

                        return ['status' => true, 'message' => 'Client user synced with works manager id', 'updated_user' => $updated_user];
                    } else {
                        // $company = Company::where('id', $user_detail->company_id)->first();
                        // $role = RolesMaster::where('id', $user_detail->role_id)->first();

                        // $is_created = DB::connection('wm_mysql')->table('contacts')->insert([
                        //     'Pid' => $company->works_manager_client_id,
                        //     'Contactname' => $user->first_name . ' ' . $user->middle_name . ' ' . $user->last_name,
                        //     'Emailaddress' => $user->email,
                        //     'Designation' => $role->title,
                        //     'access' => 1
                        // ]);

                        // if ($is_created) {
                        //     $wm_user = DB::connection('wm_mysql')->table('contacts')->where('Emailaddress', $user->email)->first();

                        //     $wm_id = $wm_user->Cid;
                        //     $user_detail->wm_client_id = $wm_id;
                        //     $user_detail->save();

                        //     $userSQL = User::selectRaw('users.id as user_id, users.first_name, users.last_name, users.email, user_details.wm_client_id, roles_master.title as role, roles_master.id as role_id, roles_master.code, user_details.status')
                        //         ->leftJoin('user_details', 'users.id', '=', 'user_details.user_id')
                        //         ->leftJoin('roles_master', 'roles_master.id', '=', 'user_details.role_id')
                        //         ->where('user_details.company_id', '!=', '1')
                        //         ->where('users.id', $user_id);

                        //     $updated_user = $userSQL->first();

                        //     return ['status' => true, 'message' => 'Client user created in WM and synced with portal', 'updated_user' => $updated_user];

                        // } else {
                        //     return ['status' => false, 'message' => 'Could not find works manager user'];
                        // }
                        return ['status' => false, 'message' => 'Could not find works manager user'];
                    }
                } else {
                    return ['status' => false, 'message' => 'Multiple user details found'];
                }
            } else {
                return ['status' => false, 'message' => 'Could not find portal user'];
            }
        } catch (Exception $e) {
            return ['status' => false, 'message' => 'Some error occurred', 'error' => $e->getMessage()];
        }
    });

    Route::post('sync-company-basic-details', function (Request $request) {
        $client_id = $request->input('client_id');
        $company = Company::find($client_id);
        if (isset($company)) {
            $wm_company = DB::connection('wm_mysql')->table('project')->where('Pid', $company->works_manager_client_id)->first();
            if (isset($wm_company)) {
                $company->name = $wm_company->ClientName;
                $company->save();

                return ['status' => true, 'message' => 'Company basic details have been updated'];
            } else
                return ['status' => false, 'message' => 'Company details not found in Works Manager'];
        } else
            return ['status' => false, 'message' => 'Company not found in Portal'];
    });

    // Delete client users
    Route::post('/remove-client-user', function (Request $request) {
        try {
            $client_id = $request->input('client_id');
            $actionUser = $request->input('logged_in_user');
    
            if ($actionUser['role'] == 'admin') {
                $deletableUser = User::find($client_id);
                $deletableUserDetails = UserDetails::where('user_id', $deletableUser->id)->first();
                
                
                if(isset($deletableUserDetails)) {
                    $deletableUserDetails->status = 'inactive';
                    $deletableUserDetails->save();
                } else 

                $deletableUser->is_deleted = 1;
                $deletableUser->save();

                return ['status' => true, 'message' => 'User deleted'];
            } else {
                return ['status' => false, 'message' => 'Unauthorized access'];
            }
        } catch(Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong while deleting user', 'error' => $e->getMessage(), 'action_user' => $actionUser];
        }
    });

    Route::prefix('whitelist-ip')->group(function () {

        // Get all whitelist ip "requests"
        Route::get('get-whitelist-ips-requests', function () {
            $new_requests = WhitelistIPsRequest::select(
                'client.id as client_id',
                'client.first_name as client_first_name',
                'client.last_name as client_last_name',
                'client.email as client_email',
                'internal.id as internal_id',
                'internal.first_name as internal_first_name',
                'internal.last_name as internal_last_name',
                'internal.email as internal_email',
                'whitelist_ip_requests.id as id',
                'whitelist_ip_requests.old_ipv4_address',
                'whitelist_ip_requests.new_ipv4_address',
                'whitelist_ip_requests.network_name',
                'whitelist_ip_requests.status',
                'whitelist_ip_requests.approved_by'
            )
                ->leftJoin('users as client', 'client.id', 'whitelist_ip_requests.client_id')
                ->leftJoin('users as internal', 'client.id', 'whitelist_ip_requests.approved_by')
                ->where('whitelist_ip_requests.status', 0)
                ->get();

            $approved_requests = WhitelistIPsRequest::select(
                'client.id as client_id',
                'client.first_name as client_first_name',
                'client.last_name as client_last_name',
                'client.email as client_email',
                'internal.id as internal_id',
                'internal.first_name as internal_first_name',
                'internal.last_name as internal_last_name',
                'internal.email as internal_email',
                'whitelist_ip_requests.id as id',
                'whitelist_ip_requests.old_ipv4_address',
                'whitelist_ip_requests.new_ipv4_address',
                'whitelist_ip_requests.network_name',
                'whitelist_ip_requests.status',
                'whitelist_ip_requests.approved_by'
            )
                ->leftJoin('users as client', 'client.id', 'whitelist_ip_requests.client_id')
                ->leftJoin('users as internal', 'client.id', 'whitelist_ip_requests.approved_by')
                ->where('whitelist_ip_requests.status', 1)
                ->get();

            $cancelled_requests = WhitelistIPsRequest::select(
                'client.id as client_id',
                'client.first_name as client_first_name',
                'client.last_name as client_last_name',
                'client.email as client_email',
                'internal.id as internal_id',
                'internal.first_name as internal_first_name',
                'internal.last_name as internal_last_name',
                'internal.email as internal_email',
                'whitelist_ip_requests.id as id',
                'whitelist_ip_requests.old_ipv4_address',
                'whitelist_ip_requests.new_ipv4_address',
                'whitelist_ip_requests.network_name',
                'whitelist_ip_requests.status',
                'whitelist_ip_requests.approved_by'
            )
                ->leftJoin('users as client', 'client.id', 'whitelist_ip_requests.client_id')
                ->leftJoin('users as internal', 'client.id', 'whitelist_ip_requests.approved_by')
                ->where('whitelist_ip_requests.status', 2)
                ->get();

            return [
                'status' => true,
                'data' => [
                    'new_requests' => $new_requests,
                    'approved_requests' => $approved_requests,
                    'cancelled_requests' => $cancelled_requests
                ]
            ];
        });


        // Fetch whitelisted IPs by user id
        Route::post('get-whitelisted-ips-by-id', function (Request $request) {
            $user_id = $request->input('user_id');
            $user = User::find($user_id);

            if (isset($user)) {
                $whitelist_ips = WhitelistIPs::select('whitelist_ip.ipv4_address', 'users.first_name', 'users.last_name')
                    ->where('user_id', $user_id)
                    ->leftJoin('users', 'users.id', 'whitelist_ip.user_id')
                    ->get();

                return [
                    'status' => true,
                    'data' => [
                        'whitelist_ips' => $whitelist_ips,
                    ]
                ];
            } else
                return ['status' => false, 'message' => 'No IPs found'];
        });

        // Fetch whitelisted IPs "requests" by user id
        Route::post('get-whitelisted-ips-requests-by-id', function (Request $request) {
            $user_id = $request->input('user_id');
            $user = User::find($user_id);

            if (isset($user)) {
                $whitelist_ips = WhitelistIPs::where('user_id', $user_id)->get();
                $whitelist_ips_requests = WhitelistIPsRequest::where('user_id', $user->id)->get();

                return [
                    'status' => true,
                    'data' => [
                        'whitelist_ips' => $whitelist_ips,
                        'whitelist_ips_requests' => $whitelist_ips_requests
                    ]
                ];
            } else
                return ['status' => false, 'message' => 'No IPs found'];
        });

        // Update (replace) old ip address with new ip address
        Route::post('replace-whitelist-ip', function (Request $request) {
            $new_ip_address = $request->input('new_ip_address');
            $existing_ip_id = $request->input('ip_id');

            try {
                $whitelist_ip_request = WhitelistIPsRequest::find($existing_ip_id);
                $whitelist_ip = WhitelistIPs::where('user_id', $whitelist_ip_request->client_id)
                    ->where('ipv4_address', $whitelist_ip_request->old_ipv4_address)
                    ->where('status', 1)->first();

                if (isset($whitelist_ip)) {
                    $user = User::find($whitelist_ip_request->client_id);

                    if ($user !== null) {
                        $whitelist_ip->ipv4_address = $new_ip_address;
                        $whitelist_ip->network_name = $whitelist_ip_request->network_name;
                        $whitelist_ip->save();

                        $whitelist_ip_request->status = 1;
                        $whitelist_ip_request->save();

                        Mail::to($user->email)->bcc(['aashikka.roshan@purplequay.com.au', 'matheen.abdul@purplequay.com.au'])
                            ->send(new SendIPReqeuestApproved($user->first_name));

                        return ['status' => true, 'message' => 'New ip address saved'];
                    } else
                        return ['status' => false, 'message' => 'User not found'];
                } else
                    return ['status' => false, 'message' => 'No existing IP address found'];
            } catch (Exception $e) {
                return [
                    'status' => false,
                    'message' => 'Something went wrong',
                    'error' => [
                        'title' => 'Something went wrong',
                        'message' => $e->getMessage(),
                        'code' => 'WIP001'
                    ]
                ];
            }
        });

    });

    Route::prefix('network-limit')->group(function () {

        Route::get('get-network-limit-requests', function () {
            $data = NetworkLimitRequest::seletct(
                'users.id as user_id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'user_details.network_limit',
                'network_limit_increase_requests.preferred_limit'
            )
                ->leftJoin('users', 'users.id', 'network_limit_increase_requests.user_id')->get();

            return ['status' => true, 'data' => $data];
        });

        Route::post('increase-limit', function (Request $request) {
            $user_id = $request->input('user_id');
            $user_details = UserDetails::find($user_id);

            if (isset($user_details) && $request->has('limit')) {
                $user_details->network_limit = $request->input('limit');
                $user_details->save();

                return ['status' => true, 'message' => 'Limit saved'];
            } else if (null === $user_details)
                return ['status' => false, 'message' => 'User details not found'];
            else if (!$request->has('limit'))
                return ['status' => false, 'message' => 'Required details not found'];
            else
                return ['status' => false, 'message' => 'Something went wrong while saving the netowrk limit'];
        });

    });


    // Queries Routes
    Route::prefix('queries')->group(function () {

        Route::prefix('query-review')->group(function () {
            Route::post('get-query-reviewers', function (Request $request) {
                try {
                    $client_id = $request->input('client_id');
                    // Fetch approvers from Server Two
                    $approvers = QueryApprovers::where('client_id', $client_id)->get();

                    // Extract m_user_ids
                    $wm_user_ids = $approvers->pluck('user_id')->toArray();

                    $userDetails = UserDetails::with('user')
                        ->whereIn('wm_user_id', $wm_user_ids)
                        ->where('company_id', 1)
                        ->get()
                        ->keyBy('wm_user_id'); // Index by m_user_id for easy lookup

                    // Merge data
                    $approvers = $approvers->map(function ($approver) use ($userDetails) {
                        $user = $userDetails[$approver->user_id]->user;
                        $name = $user->first_name . " " . $user->last_name;
                        $approver->name = $name ?? null;
                        $approver->email = $user->email;
                        return $approver;
                    });

                    return [
                        'status' => true,
                        'data' => $approvers
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'data' => [],
                        'message' => 'Something went wrong while fetching query approvers',
                        'error' => $e->getMessage()
                    ];
                }
            });

            Route::post('add-query-reviewer', function (Request $request) {
                try {
                    $user_id = $request->input('user_id');
                    $client_id = $request->input('client_id');

                    QueryApprovers::create([
                        'user_id' => $user_id,
                        'client_id' => $client_id
                    ]);

                    return [
                        'status' => true,
                        'message' => 'Query approver created.'
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'message' => 'Something went wrong while adding query approver.',
                        'error' => $e->getMessage()
                    ];
                }
            });

            Route::post('remove-query-reviewer', function (Request $request) {
                try {
                    $approver_id = $request->input('approver_id');

                    $approver = QueryApprovers::find($approver_id);

                    $approver->delete();

                    return [
                        'status' => true,
                        'message' => 'Query approver deleted.'
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'message' => 'Something went wrong while removing query approver.',
                        'error' => $e->getMessage()
                    ];
                }
            });
        });

    });
    ;
});

