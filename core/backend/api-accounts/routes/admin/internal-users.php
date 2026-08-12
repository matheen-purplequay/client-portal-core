<?php

use App\Mail\SendMail;
use App\Mail\SendMessage;
use App\Mail\SendOtpMail;
use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\User;
use App\Models\UserDetails;
use App\Models\WMUser;
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
    
    Route::prefix('internal')->group(function () {
        
        // Generate Test User Access
        // Route::get('generate-test-user', function(Request $request) {
        //     $uid = $request->input('uid');
        //     $test_email = $request->input('email');
        //     $role_id = $request->input('role_id');
        //     $company = 1;
            
        //     $wm_user = WMUser::where('Uid', $uid)->first();
        //     $role = Role::where('role_id', $role_id)->first();
            
        //     try {
        //         if(isset($wm_user)) {
        //             DB::beginTransaction();
    
        //             $names = explode(" ", $wm_user->Usename)[0];
        //             $first_name = "";
        //             $middle_name = "";
        //             $last_name = "";
                    
        //             $names = preg_split('/\s+/', trim($wm_user->Usename));
        //             $first_name  = $names[0] ?? "";
        //             $last_name   = $names[count($names) - 1] ?? "";
        //             $middle_name = count($names) > 2 ? implode(" ", array_slice($names, 1, -1)) : "";
                    
        //             $user = User::create(
        //                 [
        //                     'first_name' => $first_name,
        //                     'middle_name' => $middle_name,
        //                     'last_name' => $last_name,
        //                     'email' => $email,
        //                     'password' => $password
        //                 ]
        //             );
                    
        //             if(isset($user)) {
        //                 $user_details = UserDetails::create(
        //                     [
        //                         'role' => $role,
        //                         'role_id' => 
        //                     ]
        //                 );
        //             }
                    
        //             DB::commit();
        //         }
        //     } catch (Exception $e) {
        //         DB::rollback();
        //         return [
        //             'status' => false,
        //             'message' => 'Error while generating test user',
        //             'error' => $e->getMessage()
        //         ];
        //     }
            
            
        // });
        

        /**
         * Maps a wmdb designation name to one of the 8 active cpdb role codes:
         *   client_director | group_director | project_director |
         *   team_lead | manager | business_analyst | ceo | associate
         *
         * Anything that does not match a specific rule falls back to 'associate'.
         * Specificity matters: more precise phrases are checked before broader ones
         * (e.g. "project director" before the generic "director" catch).
         */
        function mapDesignationToCpRole(string $designationName): string
        {
            $name = strtolower(trim($designationName));
         
            // ── CEO ──────────────────────────────────────────────────────────────────
            if (str_contains($name, 'chief executive') || $name === 'ceo') {
                return 'ceo';
            }
         
            // ── Director tier (specific → generic) ──────────────────────────────────
            // "Client Director" or "Client Lead" → client_director
            if (str_contains($name, 'client director') || str_contains($name, 'client lead')) {
                return 'client_director';
            }
         
            // "Group Director" → group_director
            if (str_contains($name, 'group director')) {
                return 'group_director';
            }
         
            // "Project Director" or "Associate Project Director" → project_director
            if (str_contains($name, 'project director')) {
                return 'project_director';
            }
         
            // Any other director / COO / Delivery Head → group_director (closest fit)
            if (
                str_contains($name, 'director')  ||
                str_contains($name, 'chief operating') ||
                str_contains($name, 'delivery head')
            ) {
                return 'group_director';
            }
         
            // ── Manager tier ─────────────────────────────────────────────────────────
            // Any variation with "manager" → manager
            // Covers: Manager, Senior Manager, Assistant Manager, Client Manager,
            //         HR Recruitment Manager, HR Business Partner Manager,
            //         Client Relationship Manager, Asst. Marketing Manager, etc.
            if (str_contains($name, 'manager')) {
                return 'manager';
            }
         
            // ── Team Lead ────────────────────────────────────────────────────────────
            // Covers: Team Lead, Delivery Lead, Client Lead (already caught above),
            //         Marketing Lead
            if (str_contains($name, 'lead')) {
                return 'team_lead';
            }
         
            // ── Business Analyst ─────────────────────────────────────────────────────
            if (str_contains($name, 'analyst')) {
                return 'business_analyst';
            }
         
            // ── Associate ────────────────────────────────────────────────────────────
            if (str_contains($name, 'associate')) {
                return 'associate';
            }
         
            // ── Fallback — everything else becomes associate ──────────────────────────
            // Covers: Accountant, Paraplanner, Consultant, Intern, Executive Assistant,
            //         Desktop Engineer, HR Executive, Contract Processor, etc.
            return 'associate';
        }
         
        // ─────────────────────────────────────────────────────────────────────────────
         
        Route::post('generate-access', function (Request $request) {
         
            $email       = $request->input('email');
            $first_name  = $request->input('first_name');
            $middle_name = $request->input('middle_name');
            $last_name   = $request->input('last_name');
            $company_id  = $request->input('company_id');
            $password    = bcrypt(config('settings.user_settings.default_password'));
         
            if ($company_id === 0) {
                $company_id = 1;
            } elseif ($company_id > 1) {
                return ['status' => false, 'message' => 'Invalid user details'];
            }
         
            try {
                // ── 1. Resolve or create the cpdb user ───────────────────────────────
                $user = User::where('email', $email)->first();
         
                if (!isset($user)) {
                    $user = User::create([
                        'first_name'  => $first_name,
                        'middle_name' => $middle_name,
                        'last_name'   => $last_name,
                        'email'       => $email,
                        'password'    => $password,
                    ]);
                } else {
                    return ['status' => false, 'message' => 'User record already exists.'];
                }
         
                // ── 2. Fetch the wmdb user record ────────────────────────────────────
                $wm_user = DB::connection('wm_mysql')
                    ->table('user')
                    ->where('NewOfficialEmailID', $email)
                    ->where('Accessstatus')
                    ->first();
         
                // ── 3. Derive the cpdb role from the wmdb designation ────────────────
                //
                // We look up the employee's designation in the wmdb designationmaster
                // table (column names: ID, Name, Abbreviation) using the DesignationID
                // stored on the user record. If the lookup fails for any reason we
                // fall back to the role passed in the request (or 'consultant').
                //
                $cpRoleCode = 'associate'; // request fallback
         
                if (isset($wm_user)) {
                    // Adjust 'DesignationID' below if your wmdb column name differs.
                    $designationId = $wm_user->DesignationID ?? null;
         
                    if ($designationId) {
                        $designation = DB::connection('wm_mysql')
                            ->table('designationmaster')
                            ->where('ID', $designationId)
                            ->first();
         
                        if ($designation && !empty($designation->Name)) {
                            $cpRoleCode = mapDesignationToCpRole($designation->Name);
                        } else {
                            $cpRoleCode = 'associate';
                        }
                    } else {
                        $cpRoleCode = 'associate';
                    }
                } else {
                    $user->is_deleted = 1;
                    $user->save();
                    return ['status' => false, 'message' => 'User does not exists in works manager'];
                }
         
                // ── 4. Resolve the RolesMaster entry in cpdb ─────────────────────────
                $role_master = RolesMaster::where('code', $cpRoleCode)->first();
         
                if (!$role_master) {
                    // The mapped code didn't match anything — default to 'associate'
                    $role_master = RolesMaster::where('code', 'associate')->firstOrFail();
                    $cpRoleCode  = 'associate';
                }
         
                // ── 5. Persist UserDetails ───────────────────────────────────────────
                $user_details             = new UserDetails();
                $user_details->user_id    = $user->id;
         
                if (isset($wm_user->Uid)) {
                    $user_details->wm_user_id = $wm_user->Uid;
                }
                if ($company_id != 1 && isset($wm_user->Cid)) {
                    $user_details->wm_client_id = $wm_user->Cid;
                }
         
                $user_details->company_id = $company_id;
                $user_details->role       = $cpRoleCode;
                $user_details->role_id    = $role_master->id;
                $user_details->save();
         
                return [
                    'status'  => true,
                    'message' => 'User created',
                    'role'    => $cpRoleCode,   // handy for debugging / confirmation
                ];
         
            } catch (Exception $e) {
                return [
                    'status'  => false,
                    'message' => 'Something went wrong',
                    'error'   => $e->getMessage(),
                ];
            }
        });
        

    });
    
});