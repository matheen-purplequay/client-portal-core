<?php 

use App\Mail\SendIPReqeuestApproved;
use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\NetworkLimitRequest;
use App\Models\User;
use App\Models\RolesMaster;
use App\Models\UserDetails;
use App\Models\WhitelistIPs;
use App\Models\WhitelistIPsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::prefix('wm-api')->group(function() {
    Route::post('get-cp-users', function(Request $request) {
        $users = User::select('first_name', 'middle_name', 'last_name', DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) as full_name"), 'email', 'users.id', 'user_details.wm_client_id', 'user_details.wm_user_id', 'user_details.role')
            ->leftJoin('user_details', 'user_details.user_id', '=', 'users.id')
            ->leftJoin('companies', 'companies.id', '=', 'user_details.company_id')
            ->where('companies.works_manager_client_id', $request->input('project_id'))
            ->where('user_details.role', '!=', 'tester')
            ->where('user_details.company_id', '!=', 1)
            ->where('users.email', 'not like', '%+test%')
            ->get();

        return [
            'status' => true,
            'data' => $users
        ];
    });

    Route::post('get-wm-api-data', function(Request $request) {
        $client = new GuzzleHttp\Client();
        $res = $client->get($request->url);
        if($res->getStatusCode() == 200) {
            $data = $res->getBody();
            return $data;
        }
    });

    Route::post('get-wm-api-data-with-params', function(Request $request) {
        $client = new GuzzleHttp\Client();
        $res = $client->post($request->url);
        if($res->getStatusCode() == 200) {
            $data = $res->getBody();
            return $data;
        }
    });
});