<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Route::post('test-report-notification', function(Request $request) {
//     Mail::to('rajesh.subramanian@carisma-solutions.com.au')->cc('aashikka.roshan@purplequay.com.au')->bcc('matheen.abdul@purplequay.com.au')
//                 ->send(new SendReportApprovalUpdate('Forsyths', 'May', '2024', 'https://clientportal.carisma-solutions.com.au/login', '#811331', 'clientportalsupport@carisma-solutions.com.au'));
// });

// Routes for Connect / Weekly Reports
require __DIR__.'/report-routes.php';

// Routes for Monthly Dashboard
require __DIR__.'/monthly-routes.php';

// Routes for CMS Pages like Knowledge Center, My Team, etc.
require __DIR__.'/cms-routes.php';

// Routes for Realtime Dashboard
require __DIR__.'/realtime-routes.php';

// Routes for Job Movement Dashboard
require __DIR__.'/movement-routes.php';

// Routes for Common APIs
require __DIR__.'/common.php';

// Routes for Client Reminders APIs
require __DIR__.'/client/client_reminders.php';

// Routes for Internal APIs
require __DIR__.'/internal.php';

// Routes for Job Status APIs
require __DIR__.'/job-status/job-status-routes.php';

// Routes for Feedback Status APIs
require __DIR__.'/feedback-status.php';

// Routes for Rules APIs
require __DIR__.'/rules.php';

// Routes for Rules APIs
require __DIR__.'/master.php';

// Routes for System APIs
require __DIR__.'/system.php';

// Routes for Users APIs
require __DIR__.'/users.php';

// Routes for Users APIs
require __DIR__.'/queries.php';

// Routes for Job Status APIs
require __DIR__.'/dashboard/movement.php';

// Routes for Insights Dashboard APIs
require __DIR__.'/dashboard/insights.php';

// Routes for Queries APIs
require __DIR__.'/queries/queries-home.php';

// Route::get('get-wm-users', function() {
//     $wm_client_users_sp = "call Sp_FetchClientpartners(205, 720)";
//     $wm_client_users_results = DB::connection('wm_mysql')->select($wm_client_users_sp);
//     $wm_client_users_array = array_map(function($result) {
//         return $result->SecondaryCid;
//     }, $wm_client_users_results);
    
//     $wm_client_users = explode( ',', $wm_client_users_array[0]);

//     return ['status' => true, 'data' => $wm_client_users];
// });