<?php

use App\Models\ConnectReports;
use App\Models\Invoices;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;


// For Realtime Dashboard
// GET CONTRACTS
Route::post('/get-metrics', function(Request $request) {
    $pid = 28;
    $startDate = $request->input('startDate');
    $endDate = $request->input('endDate');
    $data = DB::connection('wm_mysql')->select('call SP_ShowJobMetrics(?,?,?)', array($pid, $startDate, $endDate));
    return $data;
});


// For Realtime Dashboard
// GET OVERALL
Route::post('/get-overall', function(Request $request) {
    $pid = $request->input('project_id');
    $data = DB::connection('wm_mysql')->select('call sp_ShowOverallJobMetrics(?)', array($pid));
    return $data;
});


// For Realtime Dashboard
// GET JOB STATUS
Route::post('/get-jobstatus', function(Request $request) {
    $pid = $request->input('project_id');
    $startDate = $request->input('startDate');
    $endDate = $request->input('endDate');
    $data = DB::connection('wm_mysql')->select('call sp_ShowjobDetails(?,?,?)', array($pid, $startDate, $endDate));
    return $data;
});


Route::post('/charts/workflow/date', function(Request $request) {
    // Params 
    // |------------|-------------------|-----------------|--------------|-----------|-------------------|------------|
    // | __Type INT | __StartDate DATE  | __EndDate DATE  | __Status INT | __Pid INT | __Month LONGTEXT  | __Year INT |
    // |------------|-------------------|-----------------|--------------|-----------|-------------------|------------|
    // | 1          | '2023-08-01'      | '2023-08-31'    | 0            | 205       | '09-2023'         | 2023       |
    // |------------|-------------------|-----------------|--------------|-----------|-------------------|------------|

    $startDate = $request->input('startDate');
    $endDate = $request->input('endDate');
    $pid = $request->input('project_id');
    $month = $request->input('month');
    $year = $request->input('year');
    $filterType = $request->input('filterType');

    error_log('start date ' . $startDate);
    error_log('end date ' . $endDate);

    // Parse the original date string into a Carbon instance
    $cStartDate = Carbon::parse($startDate);
    $cEndDate = Carbon::parse($endDate);

    // Format the date in the desired format
    $startDate = $cStartDate->format('Y-m-d');
    $endDate = $cEndDate->format('Y-m-d');

    $filter = 1;
    $pid = $request->input('project_id');
    // $startDate = '2023-08-01';
    // $endDate = '2023-08-31';
    $status = 0;
    $month = '';
    $year = 2023;

    // if($filterType == 1) {
    //     $filter = 1;
    // } elseif ($filterType == 2) {
    //     $filter = 2;
    // } elseif ($filterType == 3) {
    //     $filter = 3;
    // } else {
    //     return ['status' => 400, 'error' => 'Bad request'];
    // }
    
    $data = DB::connection('wm_mysql')->select('call SP_WorkflowStatus(?,?,?,?,?,?,?)', array($filter, $startDate, $endDate, $status, $pid, $month, $year));
    return [$data];
});


Route::post('/charts/toa/month', function(Request $request) {

    // Params 
    // |-----------|-----------------|
    // | __Pid INT | __Inverval INT  |
    // |-----------|-----------------|
    // | 1         | 1               |
    // |-----------|-----------------|

    // Params 
    // __Pid INT	__Interval INT

    $pid = $request->input('project_id');
    $intervalId = $request->input('intervalId');

    $data = DB::connection('wm_mysql')->select('call SP_JobStatusDashboard(?,?)', array($pid, $intervalId));
    return [$data];
});


Route::post('/charts/jft/month', function(Request $request) {

    // Params 
    // |-----------|-----------------|
    // | __Pid INT | __Inverval INT  |
    // |-----------|-----------------|
    // | 1         | 1               |
    // |-----------|-----------------|

    // Params 
    // __Pid INT	__Interval INT

    $pid = $request->input('project_id');
    $intervalId = $request->input('intervalId');

    $data = DB::connection('wm_mysql')->select('call SP_Throughputratio(?,?)', array($pid, $intervalId));
    return [$data];
});

Route::post('', function(Request $request) {
    $pid = $request->input('pid');
});