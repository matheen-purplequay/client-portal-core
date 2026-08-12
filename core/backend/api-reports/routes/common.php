<?php

use App\Http\Controllers\ClientRemindersController;
use App\Http\Controllers\UserDataController;
use App\Models\Comments;
use App\Models\Companies;
use App\Models\CompanyServices;
use App\Models\ConnectReports;
use App\Models\ContactFormRecipients;
use App\Models\EngagementVerticals;
use App\Models\Holidays;
use App\Models\Invoices;
use App\Models\KnowledgeCenter;
use App\Models\MyTeam;
use App\Models\Newsletters;
use App\Models\IT;
use App\Models\Roles;
use App\Models\Services;
use App\Models\Team;
use App\Models\User;
use App\Models\UserDetails;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;


Route::middleware('auth:sanctum')->get('/auth/check', function (Request $request) {
    if ($request->user('sanctum')) {
        return "auth";
    } else {
        return "guest";
    }
});

Route::get('/get/all/clients', function () {
    $projects = DB::connection('wm_mysql')->table('project')->where('Pid', '!=', 8)->where('access', 1)->orderBy('ClientName', 'ASC')->get();
    $companies = Companies::all();

    $filteredCompanies = [];

    foreach ($projects as $project) {
        $foundMatch = false;
        foreach ($companies as $company) {
            if ($project->Pid == $company->works_manager_client_id) {
                $foundMatch = true;
                break; // Exit inner loop if a match is found
            }
        }
    
        if (!$foundMatch) {
            $filteredCompanies[] = $project;
        }
    }

    return ['status' => true, 'companies' => $filteredCompanies];
});


Route::get('/get/clients', function () {
    $projects = DB::connection('wm_mysql')->table('project')->where('Pid', '!=', 8)->where('access', 1)->orderBy('ClientName', 'ASC')->get();
    $clients = Companies::where('status', 1)->get();
    $existingCompanies = array();
    $cpCompanies = array();
    foreach ($projects as $company) {
        foreach ($clients as $client) {
            if ($company->Pid == $client->works_manager_client_id) {
                $existingCompanies[] = $company;
                $cpCompanies[] = $client;
            }
        }
    }
    return ['status' => true, 'companies' => $existingCompanies, 'cpCompanies' => $cpCompanies];
});

Route::get('/get/clients-from-portal', function () {
    $clients = DB::connection('wm_mysql')->table('project')->where('Pid', '!=', 8)->where('access', 1)->first();
    // $clients = Companies::where('status', 1)->where('id', '!=', 1)->orderBy('name', 'ASC')->get();
    return ['status' => true, 'companies' => $clients];
});


Route::post('/get/client', function (Request $request) {
    $client_id = $request->input('client_id');

    $companies = DB::connection('wm_mysql')->table('project')->where('Pid', '!=', 8)->where('Pid', $client_id)->where('access', 1)->first();
    return ['status' => true, 'company' => $companies];
});

Route::post('/get-client-verticals', function (Request $request) {
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
    $client_id = $request->input('client_id');
    $services = CompanyServices::select(
        'company_services.id',
        's.title',
        's.wm_vertical_id as wm_vertical_id'
    )
        ->leftJoin($accounts_base_table.'.services as s', 'company_services.service_id', '=', 's.id')
        ->where('company_services.client_id', $client_id)
        ->where('is_active', 1)
        ->get();
    return ['status' => true, 'data' => $services];
});

// Routes With Client Prefix
Route::prefix('client')->group(function () {

    Route::post('/get-verticals', function (Request $request) {
        $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
        $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

        $client_id = $request->input('client_id');
        $servicesSQL = EngagementVerticals::select(
            'engagement_verticals.id',
            'engagement_verticals.service_id',
            'engagement_verticals.engagement_id',
            'em.title',
            'em.code',
            's.title',
            's.wm_vertical_id as wm_vertical_id',
            's.service_id as new_service_id'
        )
            ->leftJoin($accounts_base_table.'.services as s', 'engagement_verticals.service_id', '=', 's.id')
            ->leftJoin($accounts_base_table.'.engagements_master as em', 'engagement_verticals.engagement_id', '=', 'em.id')
            ->where('engagement_verticals.client_id', $client_id)
            ->where('is_active', 1);

        $services = $servicesSQL->get();

        return ['status' => true, 'data' => $services, 'sql' => $servicesSQL];
    });

});


// Routes With Admin Prefix
Route::prefix('admin')->group(function () {

    Route::post('/get/clients-from-portal', function (Request $request) {
        if($request->has('user_id')) {
            $user_id = $request->input('user_id');
            $userDetails = UserDetails::where('user_id', $user_id)->first();
        } else if($request->has('staff_id')) {
            $userDetails = UserDetails::where('wm_user_id', $request->input('staff_id'))->first();
        } else {
            return ['status' => false, 'error' => 'User not found', 'message' => 'Invalid parameters'];
        }
        
        
        $clients = DB::connection('wm_mysql')->table('userwiseclient')->select('*')->where('UID', $userDetails->wm_user_id)->first();
        $role = Roles::find($userDetails->role_id);

        // if (isset($userDetails)) {
        //     $clientSQL = Companies::where('status', 1)->where('id', '!=', 1)->orderBy('name', 'ASC');
        //     if ($userDetails->role != 'admin' && $userDetails->role != 'group_director' && $userDetails->role != 'business_analyst') {
        //         $clientIds = Team::where('user_id', $user_id)->pluck('client_id')->toArray();
        //         $clients = $clientSQL->whereIn('id', $clientIds)->get();
        //         return ['status' => true, 'companies' => $clients, 'message' => 'Companies fetched for non admin'];
        //     } else {
        //         $clients = $clientSQL->get();
        //         return ['status' => true, 'companies' => $clients, 'message' => 'Companies fetched for admin'];
        //     }
        // } else return ['status' => false, 'companies' => [], 'message' => 'User not found'];

        // $companies = Companies::where('id', '!=', 1)->orderBy('name', 'ASC')->get();
        $companies = Companies::orderBy('name', 'ASC')->get();
        $filteredCompanies = [];

        if($role->code == 'admin' || $role->code == 'group_director') {
            $filteredCompanies = $companies;
        } else {
            foreach ($companies as $company) {
                if(strpos($clients->PID, $company->works_manager_client_id) !== false) $filteredCompanies[] = $company;
            }
        }

        return ['status' => true, 'companies' => $filteredCompanies, 'clients' => $clients, 'role' => $role, 'user' => $userDetails];
    });

    Route::get('/get-verticals', function () {
        $verticals = Services::all();
        return ['status' => true, 'data' => $verticals];
    });

    Route::post('/get-roles', function (Request $request) {
        $types = $request->input('type') ?? '';
        $categories = $request->input('category') ?? '';

        $roles = Roles::query();

        if (count($types) > 0)
            $roles->whereIn('type', $types);
        if (count($categories) > 0)
            $roles->whereIn('category', $categories);

        $data = $roles->orderBy('heirarchy', 'ASC')->orderBy('group_order', 'ASC')->get();

        return ['status' => true, 'data' => $data];
    });

    Route::post('/search-user-by-wm-email', function (Request $request) {
        $email = $request->input('email');
        $user = DB::connection('wm_mysql')->table('user')->where('NewOfficialEmailID', $email)->first();

        if (isset($user))
            return ['status' => true, 'data' => $user];
        else
            return ['status' => false, 'data' => [], 'message' => 'No users found'];
    });

    Route::post('/get-role', function (Request $request) {
        $id = $request->input('id');
        $data = Roles::where('type', $id)->get();

        return ['status' => true, 'data' => $data];
    });

    Route::post('/add-team', function (Request $request) {
        $client_id = $request->input('client_id');
        $name = $request->input('name');
        $company = Companies::where('works_manager_client_id', $client_id)->first();

        $wm_user_id = $request->input('wm_user_id');
        $role_id = $request->input('role_id');
        $vertical_id = $request->input('vertical_id');
        $email = $request->input('email');
        $heirarchy = $request->input('heirarchy');

        if (isset($company)) {
            $id = $company->id;
            try {
                Team::create([
                    'client_id' => $id,
                    'name' => $name,
                    'wm_user_id' => $wm_user_id,
                    'role_id' => $role_id,
                    'vertical_id' => $vertical_id,
                    'email' => $email,
                    'heirarchy' => $heirarchy
                ]);
            } catch (Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while adding user to team', 'error' => $e->getMessage()];
            }
            return ['status' => true, 'message' => 'Added user to team'];
        } else {
            return ['status' => false, 'message' => 'Company not found'];
        }
    });

    Route::post('/team-member-toggle-status', function (Request $request) {
        $team_id = $request->input('team_id');

        $team = Team::find($team_id);
        if (isset($team)) {
            if ($team->status == 'inactive') {
                $team->status = 'active';
            } else {
                $team->status = 'inactive';
            }
            $team->save();
            return ['status' => true, 'message' => 'team member status updated'];
        } else {
            return ['status' => false, 'message' => 'team member not found'];
        }
    });

    Route::post('/team-member-delete', function (Request $request) {
        $team_id = $request->input('team_id');

        $team = Team::find($team_id);
        if (isset($team)) {
            $team->delete();
            return ['status' => true, 'message' => 'team member deleted'];
        } else {
            return ['status' => false, 'message' => 'team member not found'];
        }
    });

    Route::post('/get-team', function (Request $request) {
        $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
        $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

        $client_id = $request->input('client_id');
        $company = Companies::where('works_manager_client_id', $client_id)->first();

        if (isset($company)) {
            $id = $company->id;
            $data = Team::select(
                'teams.id',
                'teams.name',
                'teams.role_id as role_id',
                'rm.title as role_title',
                'teams.heirarchy',
                'teams.client_id',
                'teams.wm_user_id',
                'teams.vertical_id as vertical_id',
                's.title as vertical_title',
                'teams.email',
                'teams.status'
            )
                ->leftJoin($accounts_base_table . '.roles_master as rm', 'teams.role_id', '=', 'rm.id')
                ->leftJoin($accounts_base_table . '.services as s', 'teams.vertical_id', '=', 's.wm_vertical_id')
                ->where('teams.client_id', $id)
                ->orderBy('teams.heirarchy', 'asc')
                ->get();

            $data = $data->map(function ($item) {
                return [
                    'id' => $item->id,
                    'client_id' => $item->client_id,
                    'name' => $item->name,
                    'wm_user_id' => $item->wm_user_id,
                    'heirarchy' => $item->heirarchy,
                    'role' => [
                        'id' => $item->role_id,
                        'title' => $item->role_title,
                    ],
                    'vertical' => [
                        'id' => $item->vertical_id,
                        'title' => $item->vertical_title,
                    ],
                    'email' => $item->email,
                    'status' => $item->status,
                ];
            });

            if (count($data) > 0) {
                return ['status' => true, 'data' => $data];
            } else {
                return ['status' => true, 'data' => [], 'message' => 'No records found'];
            }
        } else
            return ['status' => true, 'data' => [], 'message' => 'No company found'];
    });


    Route::post('/get-email-recipients', function (Request $request) {
        $client_id = $request->input('client_id');
        $form_type = $request->input('form_type');
        $company = DB::connection('accounts_mysql')->table('companies')->where('works_manager_client_id', $client_id)->first();

        $recipients = ContactFormRecipients::where('client_id', $company->id)->where('form_type', $form_type)->first();
        return ['status' => true, 'data' => $recipients];
    });

    Route::post('/save-email-recipients', function (Request $request) {
        $client_id = $request->input('client_id');
        $form_type = $request->input('form_type');
        $email_to = $request->input('email_to');
        $email_cc = $request->input('email_cc');
        $company = Companies::where('works_manager_client_id', $client_id)->first();
        if (isset($company)) {
            try {
                ContactFormRecipients::updateOrCreate(
                    ['client_id' => $client_id, 'form_type' => $form_type],
                    [
                        'email_to' => $email_to,
                        'email_cc' => $email_cc
                    ]
                );
                return ['status' => true, 'message' => 'Email recipients added'];
            } catch (Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while saving email recipients', 'error' => $e->getMessage()];
            }
        }
    });

    Route::post('/load/user-with-company', [UserDataController::class, 'loadUsers']);
    
    
    
    // Holidays Route
    
    Route::prefix('holidays')->group(function() {
        // GET all holidays (with optional filters)
        Route::get('/get/all/holidays', function (Request $request) {
            $query = DB::table('holidays');
        
            if ($request->filled('country')) {
                $query->where('iso_country_alpha3_code', $request->country);
            }
            if ($request->filled('year')) {
                $query->where('year', $request->year);
            }
            if ($request->filled('month_id')) {
                $query->where('month_id', $request->month_id);
            }
        
            $holidays = $query->orderBy('month_id')->orderBy('date')->get();
        
            return ['status' => true, 'data' => $holidays];
        });
        
        // GET single holiday by ID
        Route::get('/get/holiday/{id}', function ($id) {
            $holiday = DB::table('holidays')->where('id', $id)->first();
        
            if (!$holiday) {
                return response()->json(['status' => false, 'message' => 'Holiday not found'], 404);
            }
        
            return ['status' => true, 'data' => $holiday];
        });
        
        // POST create new holiday
        Route::post('/create/holiday', function (Request $request) {
            $request->validate([
                'month'                   => 'required|string|max:255',
                'month_id'                => 'required|integer|min:1|max:12',
                'year'                    => 'required|integer|min:2000',
                'date'                    => 'required|string|max:255',
                'day'                     => 'required|string',
                'reason'                  => 'required|string|max:255',
                'type'                    => 'required|string|max:255',
                'iso_country_alpha3_code' => 'required|string|max:5',
                'remarks'                 => 'nullable|string|max:255',
            ]);
        
            $id = DB::table('holidays')->insertGetId([
                'month'                   => $request->month,
                'month_id'                => $request->month_id,
                'year'                    => $request->year,
                'date'                    => $request->date,
                'day'                     => $request->day,
                'reason'                  => $request->reason,
                'type'                    => $request->type,
                'iso_country_alpha3_code' => $request->iso_country_alpha3_code,
                'remarks'                 => $request->remarks,
                'created_at'              => now(),
                'updated_at'              => now(),
            ]);
        
            $holiday = DB::table('holidays')->where('id', $id)->first();
        
            return response()->json(['status' => true, 'message' => 'Holiday created', 'data' => $holiday], 201);
        });
        
        // PUT update holiday
        Route::put('/update/holiday/{id}', function (Request $request, $id) {
            $holiday = DB::table('holidays')->where('id', $id)->first();
        
            if (!$holiday) {
                return response()->json(['status' => false, 'message' => 'Holiday not found'], 404);
            }
        
            $request->validate([
                'month'                   => 'required|string|max:255',
                'month_id'                => 'required|integer|min:1|max:12',
                'year'                    => 'required|integer|min:2000',
                'date'                    => 'required|string|max:255',
                'day'                     => 'required|string',
                'reason'                  => 'required|string|max:255',
                'type'                    => 'required|string|max:255',
                'iso_country_alpha3_code' => 'required|string|max:5',
                'remarks'                 => 'nullable|string|max:255',
            ]);
        
            DB::table('holidays')->where('id', $id)->update([
                'month'                   => $request->month,
                'month_id'                => $request->month_id,
                'year'                    => $request->year,
                'date'                    => $request->date,
                'day'                     => $request->day,
                'reason'                  => $request->reason,
                'type'                    => $request->type,
                'iso_country_alpha3_code' => $request->iso_country_alpha3_code,
                'remarks'                 => $request->remarks,
                'updated_at'              => now(),
            ]);
        
            $updated = DB::table('holidays')->where('id', $id)->first();
        
            return ['status' => true, 'message' => 'Holiday updated', 'data' => $updated];
        });
        
        // DELETE holiday
        Route::delete('/delete/holiday/{id}', function ($id) {
            $holiday = DB::table('holidays')->where('id', $id)->first();
        
            if (!$holiday) {
                return response()->json(['status' => false, 'message' => 'Holiday not found'], 404);
            }
        
            DB::table('holidays')->where('id', $id)->delete();
        
            return ['status' => true, 'message' => 'Holiday deleted'];
        });
    });

});
