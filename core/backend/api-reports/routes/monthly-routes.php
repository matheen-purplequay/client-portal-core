<?php

use App\Models\AgreedsJobs;
use App\Models\AgreedsMonth;
use App\Models\ConnectReports;
use App\Models\Invoices;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;


// Verticals List
// ID	Vertical
// 1	Business Service
// 2	Super Fund
// 4	Internal Accounting
// 5	Financial Planning
// 6	Bookkeeping

// Contract List
// Id   Contract
// 1    Staff
// 2    Hourly
// 3    Agreed


// For Monthly Connect Report
// JOB STATUS CHART
Route::post('/charts/job-status/by-contract', function(Request $request) {

    // Params 
    // +----------------+------------+---------------+
    // | __Contract INT | __Pid INT  | __Date        |
    // |----------------|------------|---------------|
    // | 1              | 205        |  08-2023      |
    // +----------------+------------+---------------+

    $pid = $request->input('project_id');
    $date = $request->input('period');
    $contract_type = $request->input('contract_type');
    $vertical = $request->input('vertical');

    $data = DB::connection('wm_mysql')->select('call sp_JobStatusGraphDashboard(?,?,?,?)', array($date, $pid, $contract_type, $vertical));
    return $data;
});


// For Monthly Connect Report
// JOB STATUS EXPORT
// Route::post('/export/job-status/by-contract', function(Request $request) {

//     $pid = $request->input('project_id');
//     $date = $request->input('period');
//     $contract_type = $request->input('contract_type');
//     $vertical = $request->input('vertical');
    
//     $data = DB::connection('wm_mysql')->select('call sp_JobStatusGraphDashboard(?,?,?,?)', array($date, $pid, $contract_type, $vertical));

//     $dataArray = [
//         ['column1', 'column2', 'column3'],
//         ['data1', 'data2', 'data3'],
//         // Add more data rows as needed
//     ];

//     return Excel::download(new YourExportClassName($dataArray), 'exported_data.xlsx');
// });

// For Monthly Connect Report
// MONTHLY PRODUCTIVITY CHART && COMPARITIVE CHARTS
Route::post('/charts/monthly-productivity/by-contract', function(Request $request) {

    // Params 
    // +----------------+------------+---------------+
    // | __Vertical INT | __Pid INT  | __Date        |
    // |----------------|------------|---------------|
    // | 1              | 205        |  08-2023      |
    // +----------------+------------+---------------+

    $pid = $request->input('project_id');
    $date = $request->input('period');
    $vertical = $request->input('vertical');
    $type = $request->input('engagement_type');

    $mp = DB::connection('wm_mysql')->select('call SP_committedHoursDashboard(?,?,?,?)', array($date, $pid, $vertical, $type));
    $comparitive = DB::connection('wm_mysql')->select('call SP_ComparativeProductivityDashboard(?,?,?,?)', array($date, $pid, $vertical, $type));

    return ['status' => true, 'data' => ['mp' => $mp, 'comparitive' => $comparitive]];
});


// For Monthly Connect Report
// BUDGET VS. ACTUAL TABLE
Route::post('/charts/budget-actual/by-contract', function(Request $request) {

    // Params 
    // +-----------+-----------------+---------------+
    // | __Pid INT | __Inverval INT  | _Report_Type  | Month
    // |-----------|-----------------|---------------|
    // | 1         | 205             | 1             | 08-2023
    // +-----------+-----------------+---------------+

    $pid = $request->input('project_id');
    $date = $request->input('period');
    $contract_type = $request->input('contract_type');
    $vertical = $request->input('vertical');

    $data = DB::connection('wm_mysql')->select('call Sp_BudgetVSActualDashboard(?,?,?,?)', array($date, $pid, $contract_type, $vertical));
    return $data;
});


// For Dashboard
// GET CONTRACTS FOR Client
Route::post('/get-contracts', function(Request $request) {
    $pid = $request->input('project_id');

    $data = DB::connection('wm_mysql')->select('call SP_ClientWiseContract(?)', array($pid));
    $agreed = AgreedsMonth::where('project_id', $pid)->first();

    if(isset($agreed)) $doesAgreedExists = true;
    else $doesAgreedExists = false;

    return ['status' => true, 'data' => $data, 'does_agreed_exists' => $doesAgreedExists];
});

Route::post('/get-last-agreed-uploaded-month', function(Request $request) {
    $project_id = $request->input('project_id');
    $year = $request->input('year');

    $data = AgreedsMonth::selectRaw('MONTH(STR_TO_DATE(month, "%M")) as month')
        ->where('year', $year)
        ->where('project_id', $project_id)
        ->orderBy('month', 'DESC')->first();

    return ['status' => true, 'data' => $data];
});

Route::post('/get-agreed-job-status', function(Request $request) {
    $pid = $request->input('project_id');
    $month = $request->input('month');

    $data = AgreedsJobs::where('project_id', $pid)->where('month', $month)->get();
    return $data;
});

Route::post('/get-agreed-last-three-month-data', function(Request $request) {
    $pid = $request->input('project_id');
    $month = $request->input('month');
    $month1 = $request->input('month1');
    $month2 = $request->input('month2');
    $month3 = $request->input('month3');
    $year = $request->input('year');

    // Determine the year logic
    $currentYear = date("Y");
    $currentMonth = date("F"); // Full month name (e.g., January, February)

    if ($currentMonth == "January") {
        $currentYear--; // Take the previous year if it's January
    }

    $jobs = AgreedsJobs::where('project_id', $pid)->where('month', $month)
        ->where('year', $year)->get();

    $months = AgreedsMonth::where('project_id', $pid)
        ->selectRaw("CONCAT(month,' - ',year) AS month, id, number_of_jobs, updated_at, year, created_at")
        ->where('year', $year)
        ->where(function ($query) use ($month1, $month2, $month3) {
            $query->orWhere('month', 'like', '%' . $month1 . '%')
                ->orWhere('month', 'like', '%' . $month2 . '%')
                ->orWhere('month', 'like', '%' . $month3 . '%');
        })
        ->get();

    return ['status' => true, 'jobs' => $jobs, 'months' => $months ];
});



// Admin Routes
Route::prefix('admin')->group(function() {
    Route::post('/get-agreed-job-status', function(Request $request) {
        $pid = $request->input('project_id');
        $month = $request->input('month');
        $year = $request->input('year');
        $data = AgreedsJobs::where('project_id', $pid)->where('month', $month)
            ->where('year', $year)->get();
        return $data;
    });
    
    Route::post('/get-agreed-last-three-month-data', function(Request $request) {
        $pid = $request->input('project_id');
        $month = $request->input('month1');
        $year = $request->input('year');
    
        $data = AgreedsMonth::where('project_id', $pid)->where('month', $month)
            ->where('year', $year)->get();
    
        return $data;
    });


    // Download Reports
    Route::post('/agreed-template/download/', function(Request $request)
    {
        $report_id = $request->input('report_id');
        $report_type = $request->input('report_type');
        $filename = 'common/agreed/agreed_template.xlsx';
        $file_path = storage_path() .'/app/public/' . $filename;

        if (file_exists($file_path))
        {
            return Response::download($file_path, 'reports.pdf', [
                'Content-Length: '. filesize($file_path)
            ]);
        }
        else
        {
            // Error
            exit('Requested file does not exist on our server!' . $file_path);
        }
    })
    ->where('filename', '[A-Za-z0-9\-\_\.]+');  
});