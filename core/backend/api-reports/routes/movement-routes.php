<?php
use App\Exports\ExcelExport;
use App\Models\ConnectReports;
use App\Models\Invoices;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

// Touch Point Status Codes
// 1 - InProgress
// 2 - Query
// 3 - DWP
// 4 - RDWP
// 5 - TOTAL

// CAll SP_ShowTouchPointCount(205,'2023-09-01','2023-09-30',2)
//sp_showSubclient(__pid)

// For Job Movement Dashboard
// GET ALL SUB CLIENTS
// Params PID
Route::post('/get-all-sub-clients', function(Request $request) {
    $pid = $request->input('project_id');

    $data = DB::connection('wm_mysql')->select('call sp_showSubclient(?)', array($pid));
    return $data;
});

// For Job Movement Dashboard
// SHOW TOUCH POINT COUNT
// Params PID, SDATE, EDATE
Route::post('/show-touch-point-count', function(Request $request) {
    $pid = $request->input('project_id');
    $sdate = $request->input('start_date');
    $edate = $request->input('end_date');
    $subClient = $request->input('sub_client');
    $user_id = $request->input('user_id');

    if($pid == 205) $data = DB::connection('wm_mysql')->select('call SP_ShowTouchPointCount(?,?,?,?)', array($pid, $sdate, $edate, $subClient));
    else $data = DB::connection('wm_mysql')->select('call SP_ShowTouchPointCountnew(?,?,?,?,?)', array($pid, $sdate, $edate, $subClient, $user_id));
    return $data;
});


// For Job Movement Dashboard
// SHOW TOUCH POINT JOB DETAILS
// Params PID, SDATE, EDATE, STATUS, SUB CLIENT
// Example call SP_ShowTouchPointJobDetails(205,'2023-08-01','2023-10-20', 2, 21)
Route::post('/show-touch-point-job-details', function(Request $request) {
    $pid = $request->input('project_id');
    $sdate = $request->input('start_date');
    $edate = $request->input('end_date');
    $status = $request->input('status');
    $subClient = $request->input('sub_client');
    $user_id = $request->input('user_id');

    if($pid == 205) $data = DB::connection('wm_mysql')->select('call SP_ShowTouchPointJobDetails(?,?,?,?,?)', array($pid, $sdate, $edate, $status, $subClient));
    else $data = DB::connection('wm_mysql')->select('call SP_ShowTouchPointJobDetailsnew(?,?,?,?,?,?)', array($pid, $sdate, $edate, $status, $subClient, $user_id));
    return $data;
});

// For Job Movement Dashboard
// EXPORT TOUCH POINT DETAILS
// Params PID, SDATE, EDATE, STATUS, SUB CLIENT
Route::post('/export/movement-job-status-details', function(Request $request) {

    $pid = $request->input('project_id');
    $sdate = $request->input('start_date');
    $edate = $request->input('end_date');
    $status = $request->input('status');
    $subClient = $request->input('sub_client');
    $user_id = $request->input('user_id');

    // $data = DB::connection('wm_mysql')->select('call SP_ShowTouchPointJobDetails(?,?,?,?,?)', array($pid, $sdate, $edate, $status, $subClient));

    if($pid == 205) $data = DB::connection('wm_mysql')->select('call SP_ShowTouchPointJobDetails(?,?,?,?,?)', array($pid, $sdate, $edate, $status, $subClient));
    else $data = DB::connection('wm_mysql')->select('call SP_ShowTouchPointJobDetailsnew(?,?,?,?,?,?)', array($pid, $sdate, $edate, $status, $subClient, $user_id));

    $dataArray = [
        [
            'jobid',
            'JobName',
            'DateReceived',
            'LastTouch',
            'SubClient'
        ],
    ];

    $headers = [
        'Id',
        'Name',
        'Date Received',
        'Last Touch',
        'Sub Client'
    ];

    // Convert each object to an array and add to the data array
    foreach ($data as $item) {
        $dataArray[] = (array) $item;
    }

    return Excel::download(new ExcelExport($data, $dataArray[0], $headers), 'Job_Movement_Export.xlsx');
});


// For Job Movement Dashboard
// ONLY TOUCH POINT COUNT
// Params PID, SDATE, EDATE
Route::post('/only-touch-point-count', function(Request $request) {
    $pid = $request->input('project_id');
    $sdate = $request->input('start_date');
    $edate = $request->input('end_date');

    $data = DB::connection('wm_mysql')->select('call SP_TouchPointCount(?,?,?)', array($pid, $sdate, $edate));
    return $data;
});


// For Job Movement Dashboard
// ONLY TOUCH POINT COUNT CLOSED
// Params PID, SDATE, EDATE
Route::post('/only-touch-point-closed', function(Request $request) {
    $pid = $request->input('project_id');
    $sdate = $request->input('start_date');
    $edate = $request->input('end_date');

    $data = DB::connection('wm_mysql')->select('call SP_TouchPointCountClosed(?,?,?)', array($pid, $sdate, $edate));
    return $data;
});


// For Job Movement Dashboard
// LAST UPDATED FOR TOUCH POINTS
// Params PID, EDATE
Route::post('/get-touch-points-last-updated', function(Request $request) {
    $pid = $request->input('project_id');
    $edate = $request->input('end_date');

    $data = DB::connection('wm_mysql')->select('call sp_TouchpointLastUpdate(?,?)', array($pid, $edate));
    return $data;
});


// For Job Status Dashboard
// GET JOB STATUS COUNT - NOT
// PARAMS PID
Route::post('/get-job-status-count', function(Request $request) {
    $pid = $request->input('project_id');

    $data = DB::connection('wm_mysql')->select('call Sp_TotalNeoJobcountStatuswise(?)', array($pid));
    return ['status' => true, 'data' => $data];
});



// For Job Status Dashboard
// GET JOB STATUS DATA
// Params _Pid int, __Startdate Date, __Enddate DATE, __All INT
Route::post('/get-movement-job-status', function(Request $request) {
    $pid = $request->input('project_id');
    $start_date = $request->input('start_date');
    $end_date = $request->input('end_date');
    $all = $request->input('all');
    $comment_code = $request->input('comment_code');
    $job_status = $request->input('job_status');

    $data = DB::connection('wm_mysql')->select('call Sp_ShowneoJobStatus(?,?,?,?,?,?)', array($pid, $start_date, $end_date, $all, $job_status, $comment_code));
    return ['status' => true, 'data' => $data];
});


// For Job Status Dashboard
// GET JOB STATUS DATA - BY USER ID
// Params _Pid int, __Startdate Date, __Enddate DATE, __All INT

Route::post('/get-movement-job-status-by-user-id', function(Request $request) {
    $pid = $request->input('project_id');
    $start_date = $request->input('start_date');
    $end_date = $request->input('end_date');
    $all = $request->input('all');
    $comment_code = $request->input('comment_code');
    $job_status = $request->input('job_status');
    $user_id = $request->input('user_id');
    $job_start_date = $request->input('jobStartDate');
    $job_end_date = $request->input('jobEndDate');

    if($pid != 205 && $pid != 6)
        $data = DB::connection('wm_mysql')->select('call Sp_ShowneoJobStatusnew(?,?,?,?,?,?,?)', array($pid, $start_date, $end_date, $all, $job_status, $comment_code, $user_id));
    else 
        // NEW SP COMMENTED FOR A BUG
        // $data = DB::connection('wm_mysql')->select('call Sp_ShowneoJobRecievedStatus(?,?,?,?,?,?,?,?)', array($pid, $start_date, $end_date, $all, $job_status, $comment_code, $job_start_date, $job_end_date));
        // OLD SP for getting jobs for NEO client
        $data = DB::connection('wm_mysql')->select('call Sp_ShowneoJobStatus(?,?,?,?,?,?)', array($pid, $start_date, $end_date, $all, $job_status, $comment_code));

    $filteredData = $data;

    // REVERTED CODE TO REMOVE NUMBER SUPER FILTER
    // Adding hard coded if condition to filter jobs for Number Super
    // Delete this condition to reset after the demo meeting
    // $arr = [187333, 187336, 167412, 144248];

    // if($pid == 93) {
    //     // Assuming $data is a collection
    //     // Convert the array to a collection
    //     $filteredData = collect($data)->filter(function ($item) use ($arr) {
    //         return in_array($item->Aid, $arr);
    //     });
        
    //     // Reset array keys (optional)
    //     $filteredData = $filteredData->values();
        
    // } else $filteredData = $data;

    return ['status' => true, 'data' => $filteredData];
});


// For Job Status Dashboard
// GET PRIORITY JOB STATUS DATA - BY USER ID
// __Pid int,
// __Startdate LONGTEXT,
// __Enddate LONGTEXT,
// __Status INT,
// __Commentcode INT,
// __Priority INT

Route::prefix('jobs')->group(function() {
    // Get Priority Jobs
    Route::post('/get-priority-jobs', function(Request $request) {
        $pid = $request->input('project_id');
        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
        $comment_code = $request->input('comment_code');
        $job_status = $request->input('job_status');
        $priority_code = $request->input('priority_code');
    
        $data = DB::connection('wm_mysql')->select('call Sp_ShowneoPriorityJobs(?,?,?,?,?,?)', array($pid, $start_date, $end_date, $job_status, $comment_code, $priority_code));
        return ['status' => true, 'data' => $data];
    });
});



Route::post('/export/priority-job-status', function(Request $request) {
    $pid = $request->input('project_id');
    $start_date = $request->input('start_date');
    $end_date = $request->input('end_date');
    $comment_code = $request->input('comment_code');
    $job_status = $request->input('job_status');
    $priority_code = $request->input('priority_code');
    
    $data = DB::connection('wm_mysql')->select('call Sp_ShowneoPriorityJobs(?,?,?,?,?,?)', array($pid, $start_date, $end_date, $job_status, $comment_code, $priority_code));    
    $dataArray = [
        [
            'JobId',
            'Priority',
            'JobName',
            'FinancialYear',
            'ClientContact',
            'SubClientName',
            'Datereceived',
            'Status',
            'LastTouch',
            'LWDate',
            'LWStatus',
            'Elapseddate'
        ]
    ];

    $headers = [
        'ID',
        'Target',
        'Name',
        'FY',
        'Client Contact',
        'Sub Client',
        'Date Received',
        'Current Status',
        'Current Touch',
        'Previous Touch',
        'Previous Status',
        'Elapsed Days'
    ];

    // Convert each object to an array and add to the data array
    foreach ($data as $item) {
        $dataArray[] = (array) $item;
    }

    return Excel::download(new ExcelExport($data, $dataArray[0], $headers), 'Priority Jobs.xlsx');
});


Route::post('/export/movement-job-status', function(Request $request) {

    $pid = $request->input('project_id');
    $start_date = $request->input('start_date');
    $end_date = $request->input('end_date');
    $all = $request->input('all');
    $comment_code = $request->input('comment_code');
    $job_status = $request->input('job_status');

    $data = DB::connection('wm_mysql')->select('call Sp_ShowneoJobStatus(?,?,?,?,?,?)', array($pid, $start_date, $end_date, $all, $job_status, $comment_code));
    
    $dataArray = [
        [
            'JobId',
            'JobName',
            'FinancialYear',
            'ClientContact',
            'SubClientName',
            'Status',
            'Datereceived',
            'LastTouch'
        ]
    ];

    $headers = [
        'ID',
        'Name',
        'FY',
        'Client Contact',
        'Sub Client',
        'Current Status',
        'Date Received',
        'Last Touch'
    ];

    // Convert each object to an array and add to the data array
    foreach ($data as $item) {
        $dataArray[] = (array) $item;
    }

    return Excel::download(new ExcelExport($data, $dataArray[0], $headers), 'Job_Movement_Export.xlsx');
});

// For Job Movement Dashbaord
// SEARCH JOB BY JOB NAME
// Params PID, NAME
Route::post('/search-movement-job-status', function(Request $request) {
    $pid = $request->input('project_id');

    $data = DB::connection('wm_mysql')->select('call Sp_ShowneoJobStatusSearch(?,?)', array($pid));
    return ['status' => true, 'data' => $data];
});

