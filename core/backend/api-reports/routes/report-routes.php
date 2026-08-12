<?php
use App\Mail\SendReportApprovalRequest;
use App\Models\AgreedsJobs;
use App\Models\AgreedsMonth;
use App\Models\Companies;
use App\Models\ConnectReportActivities;
use App\Models\ConnectReports;
use App\Models\DashboardsMaster;
use App\Models\DeletedReports;
use App\Models\Invoices;
use App\Models\ReportStatus;
use App\Models\Team;
use App\Models\User;
use App\Models\UserDetails;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mime\Test\Constraint\EmailHeaderSame;
use App\Exports\ExcelExport;


Route::resource('reports', 'App\Http\Controllers\ConnectReportsController');
Route::post('reports/approve', 'App\Http\Controllers\ConnectReportsController@approve')->name('reports.approve');
Route::post('reports/reject', 'App\Http\Controllers\ConnectReportsController@reject')->name('reports.approve');
Route::post('reports/update-status', 'App\Http\Controllers\ConnectReportsController@updateStatus')->name('reports.update.status');
Route::resource('agreed', 'App\Http\Controllers\AgreedController');
Route::post('upload-excel', 'App\Http\Controllers\ExcelController@upload')->name('excel.upload');


// To be added later to get last approved report's month
// Route::post('/get-last-approved-report', function(Request $request) {
//     $client_id = $request->input('client_id');
//     $lastApprovedReport = ConnectReports::where('status', 1)
//     ->orderByRaw("STR_TO_DATE(CONCAT('1 ', month), '%d %M') DESC")
//     ->get(['report_name', 'month']);

//     return ['status' => true, $data => $lastApprovedReport];
// });

Route::post('/report/update-name', function (Request $request) {
    $report_id = $request->input('report_id');
    $name = $request->input('name');
});

// Get All Connect Reports
Route::post('/reports/get', function (Request $request) {
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

    $client_id = $request->input('client_id');
    $year = $request->input('year');
    $type = $request->input('type');
    $month = $request->input('month');

    if ($type == 'connect') {
        $reports = ConnectReports::select('connect_reports.id', 'connect_reports.client_id', 'connect_reports.pages', 'connect_reports.name', 'connect_reports.month', 'connect_reports.year', 'connect_reports.client_director', 'connect_reports.team_lead', 'connect_reports.status', 'report_status.name as status_name', 'report_status.role as status_role', 'report_status.type as status_type', 'ubu.first_name as uploaded_by_first_name', 'ubu.last_name as uploaded_by_last_name', 'abu.first_name as approved_by_first_name', 'abu.last_name as approved_by_last_name')
            ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
            ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
            ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
            // ->leftJoin('.'users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
            ->where('year', $year)
            ->where('report_status.type', 'approved')
            ->where('client_id', $client_id);
        $reports = ($month != 0 || $month != "0") ? $reports->where('month', $month)->get() : $reports->get();

    } else if ($type == 'weekly') {
        $reports = WeeklyReports::select('connect_reports.id', 'connect_reports.client_id', 'connect_reports.pages', 'connect_reports.name', 'connect_reports.month', 'connect_reports.year', 'connect_reports.client_director', 'connect_reports.team_lead', 'connect_reports.status', 'report_status.name as status_name', 'report_status.role as status_role', 'report_status.type as status_type', 'ubu.first_name as uploaded_by_first_name', 'ubu.last_name as uploaded_by_last_name', 'abu.first_name as approved_by_first_name', 'abu.last_name as approved_by_last_name')
            ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
            ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
            ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
            // ->leftJoin('.'users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
            ->where('year', $year)
            ->where('client_id', $client_id)
            ->where('report_status.type', 'approved')
            ->get();
    }
    return ['status' => true, 'data' => $reports];
});

// Get Connect Reports By Client ID
Route::post('/reports/admin/get', function (Request $request) {
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

    $client_id = $request->input('client_id');
    $year = $request->input('year');
    $type = $request->input('type');
    $month = $request->input('month');

    if ($type == 'connect') {
        $reports = ConnectReports::selectRaw(
            "connect_reports.id,
                connect_reports.client_id,
                connect_reports.pages,
                connect_reports.name,
                connect_reports.name as title,
                connect_reports.month,
                connect_reports.year,
                connect_reports.client_director,
                connect_reports.team_lead,
                DATE_FORMAT(connect_reports.created_at,'%d/%m/%Y') as uploaded_date,
                connect_reports.status,
                connect_reports.reason,
                report_status.name as status_name,
                report_status.role as status_role,
                report_status.type as status_type,
                CONCAT(ubu.first_name, ' ' , ubu.last_name) as uploaded_by,
                CONCAT(rbu.first_name, ' ' , rbu.last_name) as rejected_by,
                CONCAT(abu.first_name, ' ' , abu.last_name) as approved_by,
                ubu.first_name as uploaded_by_first_name,
                ubu.last_name as uploaded_by_last_name,
                abu.first_name as approved_by_first_name,
                abu.last_name as approved_by_last_name,
                rbu.first_name as rejected_by_first_name,
                rbu.last_name as rejected_by_last_name"
        )
            ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
            ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
            ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
            ->leftJoin($accounts_base_table . '.users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
            ->where('year', $year)
            ->where('client_id', $client_id);
        $reports = ($month != 0 || $month != "0") ? $reports->where('month', $month)->get() : $reports->get();

    } else if ($type == 'weekly') {
        $reports = WeeklyReports::select('connect_reports.id', 'connect_reports.client_id', 'connect_reports.pages', 'connect_reports.name', 'connect_reports.month', 'connect_reports.year', 'connect_reports.client_director', 'connect_reports.team_lead', 'connect_reports.status', 'report_status.name as status_name', 'report_status.role as status_role', 'report_status.type as status_type', 'ubu.first_name as uploaded_by_first_name', 'ubu.last_name as uploaded_by_last_name', 'abu.first_name as approved_by_first_name', 'abu.last_name as approved_by_last_name', 'rbu.first_name as rejected_by_first_name', 'rbu.last_name as rejected_by_last_name')
            ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
            ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
            ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
            ->leftJoin($accounts_base_table . '.users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
            ->where('year', $year)
            ->where('client_id', $client_id)
            ->get();
    }
    return ['status' => true, 'data' => $reports];
});

Route::post('/reports/get-last-updated-month', function (Request $request) {
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

    $project_id = $request->input('project_id');
    // $year = $request->input('year');

    $month = ConnectReports::selectRaw('MONTH(STR_TO_DATE(month, "%M")) as month, year')
        ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
        ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
        ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
        ->where('report_status.type', 'approved')
        ->where('client_id', $project_id)->orderBy('month', 'DESC')->first();

    return ['status' => true, 'data' => $month];
});

Route::post('/report/get-available-report-months', function (Request $request) {
    $project_id = $request->input('project_id');
    $year = $request->input('year');
    $all = 0;
    $allMonths = [1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April', 5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August', 9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'];

    $sql = ConnectReports::selectRaw('month')
        ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
        ->leftJoin('.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
        ->leftJoin('.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
        ->where('year', $year)
        ->where('client_id', $project_id)->orderBy('month', 'DESC');

    if ($request->has('all'))
        $all = $request->input('all');
    if ($all != 0)
        $sql = $sql->where('report_status.type', 'approved');
    $months = $sql->pluck('month');

    $data = [];
    foreach ($allMonths as $key => $allMonth) {
        foreach ($months as $month) {
            if ($month == $allMonth)
                $data[] = (object) ['index' => $key, 'name' => $allMonth];
        }
    }

    return ['status' => true, 'months' => $months, 'data' => $data];
});

Route::post('/report/get-available-report-years', function (Request $request) {
    $project_id = $request->input('project_id');
    $allMonths = [1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April', 5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August', 9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'];
    $company = Companies::where('works_manager_client_id', $project_id)->first();
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $allDashboards = DashboardsMaster::select('code', 'title')->where('is_active', 1)->get();
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

    $is_normal_user = false;
    if ($request->input('user_id'))
        $user_details = UserDetails::where('user_id', $request->input('user_id'))->first();
    if (!isset ($user_details) || $user_details->company_id != 1)
        $is_normal_user = true;

    $years = [];
    $yearsSQL = ConnectReports::select('year')
        ->where('client_id', $project_id)
        ->groupBy('year');

    if ($is_normal_user)
        $yearsSQL = $yearsSQL->whereNotNull('approved_by');
    $years = $yearsSQL->pluck('year');

    if (count($years) > 0) {
        $latestYear = $years[count($years) - 1]; // Get the most recent year

        $hasMonths = [];
        $hasMonthsSQL = ConnectReports::selectRaw('1')  // Check for at least one month
            ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
            ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
            ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
            ->where('year', $latestYear)
            ->where('client_id', $project_id);

        if ($is_normal_user)
            $hasMonthsSQL = $hasMonthsSQL->whereNotNull('approved_by');
        $hasMonths = $hasMonthsSQL->exists();

        while (!$hasMonths && count($years) > 0) {
            $years->pop(); // Remove the last year
            $latestYear = $years[count($years) - 1]; // Get the new latest year

            $hasMonthsSQL = ConnectReports::selectRaw('1')  // Check for months again
                ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
                ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
                ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
                ->where('year', $latestYear)
                ->where('client_id', $project_id)
                ->exists();

            if ($is_normal_user)
                $hasMonthsSQL = $hasMonthsSQL->whereNotNull('approved_by');
            $hasMonths = $hasMonthsSQL->exists();
        }

        if (count($years) > 0) {

            $monthsSQL = ConnectReports::selectRaw('month')
                ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
                ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
                ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
                ->where('year', $latestYear)
                ->where('client_id', $project_id)
                ->orderBy('month', 'DESC');

            $months = [];
            if ($is_normal_user)
                $monthsSQL = $monthsSQL->whereNotNull('approved_by');
            $months = $monthsSQL->pluck('month');

            $availableMonths = [];
            foreach ($allMonths as $key => $allMonth) {
                foreach ($months as $month) {
                    if ($month == $allMonth)
                        $availableMonths[] = (object) ['index' => $key, 'name' => $allMonth];
                }
            }

            // Proceed with the available months
            return [
                'status' => true,
                'data' => [
                    'years' => $years,
                    'months' => $availableMonths,
                    'company' => [
                        'dashboards' => $company->dashboards,
                        'test_dashboards' => $company->test_dashboards
                    ]
                ]
            ];
        } else {
            // Handle the case where no years have available months
            return ['status' => false, 'data' => [
                'company' => [
                    'dashboards' => $company->dashboards,
                    'test_dashboards' => $company->test_dashboards
                ]
            ]];
        }
    } else {
        return ['status' => false, 'data' => [
            'company' => [
                'dashboards' => $company->dashboards,
                'test_dashboards' => $company->test_dashboards
            ]
        ]];
    }
});

Route::post('/reports/connect', function (Request $request) {
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

    $month = $request->input('month');
    $year = $request->input('year');
    $client_id = $request->input('client_id');
    // if($month == null || $month == "") $month = date("F", strtotime('m'));
    // if($year == null || $year == "") $year = date("F", strtotime('yyyy'));
    // $reports = ConnectReports::where('month', 'LIKE', $month)->where('year', 'LIKE', $year)->where('client_id', $pid)->get();
    $reports = ConnectReports::select('connect_reports.id', 'connect_reports.client_id', 'connect_reports.pages', 'connect_reports.name', 'connect_reports.month', 'connect_reports.year', 'connect_reports.client_director', 'connect_reports.team_lead', 'connect_reports.status', 'report_status.name as status_name', 'report_status.role as status_role', 'report_status.type as status_type', 'ubu.first_name as uploaded_by_first_name', 'ubu.last_name as uploaded_by_last_name', 'abu.first_name as approved_by_first_name', 'abu.last_name as approved_by_last_name', 'rbu.first_name as rejected_by_first_name', 'rbu.last_name as rejected_by_last_name')
        ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
        ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
        ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
        ->leftJoin($accounts_base_table . '.users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
        ->where('year', $year)
        ->where('client_id', $client_id)
        ->where('connect_reports.month', $month)
        ->get();
    return ['status' => true, 'data' => $reports];
});

Route::post('/report', function (Request $request) {
    $report_id = $request->input('report_id');
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

    $reports = ConnectReports::select('connect_reports.id', 'connect_reports.client_id', 'connect_reports.pages', 'connect_reports.name', 'connect_reports.month', 'connect_reports.year', 'connect_reports.client_director', 'connect_reports.team_lead', 'connect_reports.status', 'connect_reports.reason', 'report_status.name as status_name', 'report_status.role as status_role', 'report_status.type as status_type', 'ubu.first_name as uploaded_by_first_name', 'ubu.last_name as uploaded_by_last_name', 'abu.first_name as approved_by_first_name', 'abu.last_name as approved_by_last_name', 'rbu.first_name as rejected_by_first_name', 'rbu.last_name as rejected_by_last_name')
        ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
        ->join($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
        ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
        ->leftJoin($accounts_base_table . '.users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
        ->where('connect_reports.id', $report_id)
        ->first();
    return $reports;
});

// Get All Weekly Reports
Route::post('/reports/weekly/all', function (Request $request) {
    $pid = $request->input('project_id');
    $year = $request->input('year');
    $reports = WeeklyReports::where('client_id', $pid)->where('year', 'LIKE', $year)->get();
    return $reports;
});

Route::post('/reports/weekly', function (Request $request) {
    $month = $request->input('month');
    $year = $request->input('year');
    $pid = $request->input('project_id');
    $reports = WeeklyReports::where('month', 'LIKE', $month)->where('year', 'LIKE', $year)->where('client_id', $pid)->get();
    return $reports;
});

// Get Invoices
Route::get('/invoices/all', function () {
    $reports = Invoices::all();
    return $reports;
});


// Download Reports
Route::post('/reports/download/', function (Request $request) {
    $report_id = $request->input('report_id');
    $report_type = $request->input('report_type');

    if ($report_type == 'connect') {
        $connectReports = ConnectReports::where('id', $report_id)->first();
        $filename = $connectReports->file;
        $file = Storage::get($filename);
        // Check if file exists in app/storage/file folder
        $file_path = storage_path() . '/app/public/' . $filename;
    } else if ($report_type == 'weekly') {
        $weeklyReports = WeeklyReports::where('id', $report_id)->first();
        $filename = $weeklyReports->file;
        $file = Storage::get($filename);
        // Check if file exists in app/storage/file folder
        $file_path = storage_path() . '/app/public/' . $filename;
    }

    if (file_exists($file_path)) {
        if($request->has('user_id')) {
            $user_id = $request->input('user_id'); 
            $existing_activity = ConnectReportActivities::where('report_id', $report_id)->where('activity_type', 'downloaded')->first();
            if(!isset($existing_activity)) {
                $activity = new ConnectReportActivities();
                $activity->report_id = $report_id;
                $activity->activity_type = 'downloaded';
                $activity->user_id = $user_id;
                $activity->save();
            } else {
                $existing_activity->user_id = $user_id;
                $existing_activity->save();
            }
        }

        // Send Download
        return Response::download($file_path, 'reports.pdf', [
            'Content-Length: ' . filesize($file_path)
        ]);
    } else {
        // Error
        exit ('Requested file does not exist on our server!' . $file_path);
    }
})
    ->where('filename', '[A-Za-z0-9\-\_\.]+');


// Preview Reports
Route::post('/reports/preview', function (Request $request) {
    $report_id = $request->input('report_id');
    $report_type = $request->input('report_type');
    $project_id = $request->input('project_id');

    if ($report_type == 'connect') {
        $connectReports = ConnectReports::where('id', $report_id)->first();
        $filename = $connectReports->file;
        $file = Storage::get($filename);
        // Check if file exists in app/storage/file folder
        $file_path = storage_path() . '/app/public/' . $filename;
    } else if ($report_type == 'weekly') {
        $weeklyReports = WeeklyReports::where('id', $report_id)->first();
        $filename = $weeklyReports->file;
        $file = Storage::get($filename);
        // Check if file exists in app/storage/file folder
        $file_path = storage_path() . '/app/public/' . $filename;
    }

    if (file_exists($file_path)) {
        if($request->has('user_id')) {
            $user_id = $request->input('user_id'); 
            $existing_activity = ConnectReportActivities::where('report_id', $report_id)->where('activity_type', 'opened')->first();
            if(!isset($existing_activity)) {
                $activity = new ConnectReportActivities();
                $activity->report_id = $report_id;
                $activity->activity_type = 'opened';
                $activity->user_id = $user_id;
                $activity->save();
            } else {
                $existing_activity->user_id = $user_id;
                $existing_activity->save();
            }
        }

        return response()->file($file_path);

    } else {
        exit ('Requested file does not exist on our server!' . $file_path);
    }
});

Route::post('/report/delete', function (Request $request) {
    $report_id = $request->input('report_id');
    $reason = $request->input('reason');

    $report = ConnectReports::find($report_id);

    if (isset ($report)) {
        $deleted_report = new DeletedReports();
        $deleted_report->client_id = $report->client_id;
        $deleted_report->name = $report->name;
        $deleted_report->month = $report->month;
        $deleted_report->year = $report->year;
        $deleted_report->file = $report->file;
        $deleted_report->status = $report->status;
        $deleted_report->uploaded_by = $report->uploaded_by;
        $deleted_report->approved_by = $report->approved_by;
        $deleted_report->rejected_by = $report->rejected_by;
        $deleted_report->reason = $reason;

        $saved = $deleted_report->save();

        if ($saved)
            $report->delete();
        return ['status' => true, 'message' => $report->name . ' has been deleted'];
    } else
        return ['status' => false, 'message' => 'Report not found'];
});

Route::post('/insert-agreed-without-jobs', function (Request $request) {
    $project_id = $request->input('project_id');
    $month = $request->input('month');
    $year = $request->input('year');
    $number_of_jobs = $request->input('number_of_jobs');

    try {
        AgreedsJobs::create([
            'job_name' => 'No jobs in hand',
            'date_received' => NULL,
            'job_status' => NULL,
            'month' => $month,
            'year' => $year,
            'project_id' => $project_id,
        ]);

        AgreedsMonth::updateOrCreate(
            [
                'project_id' => $project_id,
                'month' => $month,
                'year' => $year
            ],
            [
                'month' => $month,
                'year' => $year,
                'number_of_jobs' => $number_of_jobs,
                'project_id' => $project_id
            ]
        );

        return ['status' => true, 'message' => 'Agreed details updated'];

    } catch (Exception $e) {
        return ['status' => false, 'message' => 'Something went wrong while saving agreed details'];
    }


});


// ADMIN ROUTES
// Report Admin Routes
Route::prefix('admin')->group(function () {

    // Report Admin Dashboard Routes
    Route::prefix('dashboard')->group(function () {

        // For Job Movement Dashboard
        // EXPORT TOUCH POINT DETAILS
        // Params YEAR, MONTH, USERID, ROLE
        Route::post('/export/dashboard-reports', function (Request $request) {
            $year = $request->input('year');
            $month = $request->input('month');
            $user_id = $request->input('user_id');
            $role = $request->input('role');
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

            $allCompanies = Companies::all();

            $availableCompanies = Companies::select('works_manager_client_id', 'id', 'name')
                ->whereIn('companies.id', function ($query) use ($user_id) {
                    $querySQL = $query->select('client_id')
                        ->from('users')
                        ->leftJoin('user_details', 'user_details.user_id', '=', 'users.id')
                        ->leftJoin('teams', 'teams.wm_user_id', '=', 'user_details.wm_user_id');
                    $querySQL = $querySQL->where('user_details.user_id', $user_id);
                })
                ->orderBy('name', 'ASC')
                ->get();

            $companyIds = $availableCompanies->pluck('works_manager_client_id')->toArray();

            $availableReportsSQL = ConnectReports::selectRaw(
                "connect_reports.id, connect_reports.client_id, connect_reports.name as title, connect_reports.pages, 
                com.name as company_name, com.id as company_id, 
                connect_reports.month, 
                connect_reports.year, 
                CONCAT(ubu.first_name, ' ', ubu.last_name) as uploaded_by, 
                DATE_FORMAT(connect_reports.created_at,'%d/%m/%Y') as uploaded_date, 
                report_status.name as status_name, 
                report_status.role as status_role, 
                report_status.type as status_type, 
                connect_reports.reason as reason,
                ubu.email as uploaded_by_email, 
                connect_reports.status, 
                CONCAT(abu.first_name, ' ', abu.last_name) as approved_by, 
                CONCAT(rbu.first_name, ' ', rbu.last_name) as rejected_by, 
                CASE report_status.type WHEN 'approved' THEN CONCAT(abu.first_name, ' ', abu.last_name) WHEN 'rejected' THEN CONCAT(rbu.first_name, ' ', rbu.last_name) END as action_by,
                CASE connect_reports.is_approval_mail_sent WHEN 0 THEN 'Not yet' WHEN 1 THEN 'Yes' END as is_email_sent, 
                connect_reports.is_approval_mail_sent as 'is_email_sent_code', 
                connect_reports.approval_mail_requested_by, connect_reports.mail_sent_count"
            )
                ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
                ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
                ->leftJoin($accounts_base_table . '.companies as com', 'com.works_manager_client_id', '=', 'connect_reports.client_id')
                ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
                ->leftJoin($accounts_base_table . '.users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
                ->where('connect_reports.year', $year)
                ->where('connect_reports.month', $month);

            $isApprover = false;
            if ($role != 'admin' && $role != 'group_director' && $role != 'business_analyst') {
                $availableReportsSQL = $availableReportsSQL->whereIn('client_id', $companyIds)->orderBy('uploaded_date', 'DESC');
                if ($role == 'team_lead') {
                    $availableReportsSQL = $availableReportsSQL->where('uploaded_by', $user_id)->orderBy('uploaded_date', 'DESC');
                }
                $isApprover = true;
                $isAdmin = false;
            } else if ($role == 'admin' || $role == 'group_director' || $role == 'business_analyst') {
                $isAdmin = true;
                $isApprover = false;
                $availableCompanies = $allCompanies;
            } else {
                $isApprover = false;
                $isAdmin = false;
                $availableCompanies = $allCompanies;
            }

            $availableReports = $availableReportsSQL->get();
            $companiesWithReports = $availableReports->map->only(['id', 'company_name'])->values();
            $clientIds = $availableReports->pluck('client_id')->toArray();

            $companiesWithoutReports = Companies::selectRaw('companies.id as id, companies.name as company_name')
                ->whereNotIn('works_manager_client_id', $clientIds)
                ->whereIn('works_manager_client_id', $companyIds)
                ->orderBy('company_name')
                ->get();

            $columns = [
                'id' => ['id' => 'id', 'title' => 'ID', 'showColumn' => false],
                'title' => ['id' => 'title', 'title' => 'Title', 'showColumn' => false],
                'company_name' => ['id' => 'company_name', 'title' => 'Company Name', 'showColumn' => true],
                'company_id' => ['id' => 'company_id', 'title' => 'Company Id', 'showColumn' => false],
                'month' => ['id' => 'month', 'title' => 'Month', 'showColumn' => true],
                'year' => ['id' => 'year', 'title' => 'Year', 'showColumn' => true],
                'uploaded_by' => ['id' => 'uploaded_by', 'title' => 'Uploaded By', 'showColumn' => ($isApprover || $isAdmin)],
                'uploaded_by_email' => ['id' => 'uploaded_by_email', 'title' => 'Uploaded By Email', 'showColumn' => false],
                'uploaded_date' => ['id' => 'uploaded_date', 'title' => 'Uploaded Date', 'showColumn' => true],
                'status_name' => ['id' => 'status_name', 'title' => 'Status', 'showColumn' => true],
                'action_by' => ['id' => 'action_by', 'title' => 'Action By', 'showColumn' => true],
                'approved_by' => ['id' => 'approved_by', 'title' => 'Approved By', 'showColumn' => false],
                'rejected_by' => ['id' => 'rejected_by', 'title' => 'Rejected By', 'showColumn' => false],
                'is_email_sent' => ['id' => 'is_email_sent', 'title' => 'Is E-Mail Sent', 'showColumn' => $isAdmin]
            ];

            $data = [
                'availableReports' => [
                    'columns' => $columns,
                    'data' => $availableReports,
                ],
                'companiesWithReports' => [
                    'columns' => [
                        'name' => ['id' => 'name', 'title' => 'Client Name', 'showColumn' => true],
                    ],
                    'data' => $companiesWithReports
                ],
                'companiesWithoutReports' => [
                    'columns' => [
                        'name' => ['id' => 'name', 'title' => 'Client Name', 'showColumn' => true],
                    ],
                    'data' => $companiesWithoutReports
                ],
                'availableCompanies' => $availableCompanies
            ];


            $dataArray = [
                [
                    'company_name',
                    'month',
                    'year',
                    'uploaded_by',
                    'uploaded_date',
                    'status_name',
                    'action_by'
                ],
            ];

            $headers = [
                'Client',
                'Month',
                'Uploaded By',
                'Uploaded Date',
                'Status Name',
                'Action By'
            ];

            // Convert each object to an array and add to the data array
            foreach ($availableReports as $item) {
                $dataArray[] = (array) $item;
            }

            return Excel::download(new ExcelExport($data, $dataArray[0], $headers), 'Uploaded reports for ' . $month. ' ' . $year .  '.xlsx');
        });


        Route::post('/get-report-by-id', function (Request $request) {
            $report_id = $request->input('report_id');
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

            $report = ConnectReports::selectRAW(
                "connect_reports.id, connect_reports.client_id, connect_reports.name as title, connect_reports.pages, connect_reports.reason as reason, com.name as company_name, com.id as company_id, connect_reports.month, connect_reports.year, connect_reports.status, report_status.name as status_name, report_status.role as status_role, report_status.type as status_type, CONCAT(ubu.first_name, ' ', ubu.last_name) as uploaded_by, ubu.email as uploaded_by_email, DATE_FORMAT(connect_reports.created_at,'%d/%m/%Y') as uploaded_date, CONCAT(abu.first_name, ' ', abu.last_name) as approved_by, CONCAT(rbu.first_name, ' ', rbu.last_name) as rejected_by, CASE connect_reports.is_approval_mail_sent WHEN 0 THEN 'Not yet' WHEN 1 THEN 'Yes' END as is_email_sent, connect_reports.is_approval_mail_sent as 'is_email_sent_code', connect_reports.approval_mail_requested_by, connect_reports.mail_sent_count"
            )
                ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
                ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
                ->leftJoin($accounts_base_table . '.companies as com', 'com.works_manager_client_id', '=', 'connect_reports.client_id')
                ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
                ->leftJoin($accounts_base_table . '.users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
                ->where('connect_reports.id', $report_id)
                ->first();

            $activities = ConnectReportActivities::where('report_id', $report_id)->get();

            return ['status' => true, 'data' => ['report' => $report, 'activities' => $activities]];
        });

        // For Dashboard
        // GET COMPANY COUNTS
        Route::post('get-counts', function (Request $request) {
            $user_id = $request->input('user_id');

            $companies = Companies::select('id', 'name', 'works_manager_client_id', 'status')
                ->whereIn('companies.id', function ($query) use ($user_id) {
                    $querySQL = $query->select('client_id')
                        ->from('users')
                        ->leftJoin('user_details', 'user_details.user_id', '=', 'users.id')
                        ->leftJoin('teams', 'teams.wm_user_id', '=', 'user_details.wm_user_id');
                    if ($user_id != 1)
                        $querySQL = $querySQL->where('user_details.user_id', $user_id);
                })
                ->orderBy('name', 'ASC')
                ->get()->count();

            return ['status' => true, 'data' => $companies];
        });

        // For Admin Dashboard
        // GET REPORTS LIST BY MONTH AND YEAR
        // Params YEAR, MONTH, USERID, ROLE
        Route::post('get-reports-list-by-month-year', function (Request $request) {
            $year = $request->input('year');
            $month = $request->input('month');
            $user_id = $request->input('user_id');
            $role = $request->input('role');
            
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

            $allCompanies = Companies::where('id', '!=', 1)->orderBy('name', 'ASC')->get();

            $availableCompanies = Companies::select('works_manager_client_id', 'id', 'name')
                ->whereIn('companies.id', function ($query) use ($user_id) {
                    $querySQL = $query->select('client_id')
                        ->from('users')
                        ->leftJoin('user_details', 'user_details.user_id', '=', 'users.id')
                        ->leftJoin('teams', 'teams.wm_user_id', '=', 'user_details.wm_user_id');
                    $querySQL = $querySQL->where('user_details.user_id', $user_id);
                })
                ->orderBy('name', 'ASC')
                ->get();

            $companyIds = $availableCompanies->pluck('works_manager_client_id')->toArray();

            $availableReportsSQL = ConnectReports::selectRaw(
                "connect_reports.id, connect_reports.client_id, connect_reports.name as title, connect_reports.pages, 
                com.name as company_name, com.id as company_id, 
                com.master_company_id as master_company_id,
                connect_reports.month, 
                connect_reports.year, 
                CONCAT(ubu.first_name, ' ', ubu.last_name) as uploaded_by, 
                DATE_FORMAT(connect_reports.created_at,'%d/%m/%Y') as uploaded_date, 
                report_status.name as status_name, 
                report_status.role as status_role, 
                report_status.type as status_type, 
                connect_reports.reason as reason,
                ubu.email as uploaded_by_email, 
                connect_reports.status, 
                CONCAT(abu.first_name, ' ', abu.last_name) as approved_by, 
                CONCAT(rbu.first_name, ' ', rbu.last_name) as rejected_by, 
                CASE report_status.type WHEN 'approved' THEN CONCAT(abu.first_name, ' ', abu.last_name) WHEN 'rejected' THEN CONCAT(rbu.first_name, ' ', rbu.last_name) END as action_by,
                CASE connect_reports.is_approval_mail_sent WHEN 0 THEN 'Not yet' WHEN 1 THEN 'Yes' END as is_email_sent, 
                connect_reports.is_approval_mail_sent as 'is_email_sent_code', 
                connect_reports.approval_mail_requested_by, connect_reports.mail_sent_count,
                IF(cra.activity_type = 'opened', 'Opened' , '') as activity_status"
            )
                ->join('report_status', 'connect_reports.status', '=', 'report_status.id')
                ->leftJoin($accounts_base_table . '.users as ubu', 'ubu.id', '=', 'connect_reports.uploaded_by')
                ->leftJoin($accounts_base_table . '.companies as com', 'com.works_manager_client_id', '=', 'connect_reports.client_id')
                ->leftJoin($accounts_base_table . '.users as abu', 'abu.id', '=', 'connect_reports.approved_by')
                ->leftJoin($accounts_base_table . '.users as rbu', 'rbu.id', '=', 'connect_reports.rejected_by')
                ->leftJoin('connect_report_activities as cra', 'cra.report_id', '=', 'connect_reports.id')
                ->where('connect_reports.year', $year)
                ->where('connect_reports.month', $month);

            $isApprover = false;
            if ($role != 'admin' && $role != 'group_director' && $role != 'business_analyst') {
                $availableReportsSQL = $availableReportsSQL->whereIn('client_id', $companyIds)->orderBy('uploaded_date', 'DESC');
                if ($role == 'team_lead') {
                    $availableReportsSQL = $availableReportsSQL->where('uploaded_by', $user_id)->orderBy('uploaded_date', 'DESC');
                }
                $isApprover = true;
                $isAdmin = false;
            } else if ($role == 'admin' || $role == 'group_director' || $role == 'business_analyst') {
                $isAdmin = true;
                $isApprover = false;
                $availableReportsSQL = $availableReportsSQL->orderBy('company_name', 'ASC');
                $availableCompanies = $allCompanies;
            } else {
                $isApprover = false;
                $isAdmin = false;
                $availableCompanies = $allCompanies;
            }

            $availableReports = $availableReportsSQL->groupBy('connect_reports.id')->get();
            $companiesWithReports = $availableReports->map->only(['id', 'company_name'])->values();
            $clientIds = $availableReports->pluck('client_id')->toArray();

            $companiesWithoutReports = Companies::selectRaw('companies.id as id, companies.name as company_name')
                ->whereNotIn('works_manager_client_id', $clientIds)
                ->whereIn('works_manager_client_id', $companyIds)
                ->orderBy('company_name', 'ASC')
                ->get();

            $columns = [
                'id' => ['id' => 'id', 'title' => 'ID', 'showColumn' => false],
                'title' => ['id' => 'title', 'title' => 'Title', 'showColumn' => false],
                'company_name' => ['id' => 'company_name', 'title' => 'Company Name', 'showColumn' => true],
                'company_id' => ['id' => 'company_id', 'title' => 'Company Id', 'showColumn' => false],
                'month' => ['id' => 'month', 'title' => 'Month', 'showColumn' => true],
                'year' => ['id' => 'year', 'title' => 'Year', 'showColumn' => true],
                'uploaded_by' => ['id' => 'uploaded_by', 'title' => 'Uploaded By', 'showColumn' => ($isApprover || $isAdmin)],
                'uploaded_by_email' => ['id' => 'uploaded_by_email', 'title' => 'Uploaded By Email', 'showColumn' => false],
                'uploaded_date' => ['id' => 'uploaded_date', 'title' => 'Uploaded Date', 'showColumn' => true],
                'status_name' => ['id' => 'status_name', 'title' => 'Status', 'showColumn' => true],
                'action_by' => ['id' => 'action_by', 'title' => 'Action By', 'showColumn' => true],
                'approved_by' => ['id' => 'approved_by', 'title' => 'Approved By', 'showColumn' => false],
                'rejected_by' => ['id' => 'rejected_by', 'title' => 'Rejected By', 'showColumn' => false],
                'is_email_sent' => ['id' => 'is_email_sent', 'title' => 'Is E-Mail Sent', 'showColumn' => $isAdmin],
                'activity_status' => ['id' => 'activity_status', 'title' => 'Client Opened?', 'showColumn' => ($isApprover || $isAdmin)]
            ];

            $data = [
                'availableReports' => [
                    'columns' => $columns,
                    'data' => $availableReports
                ],
                'companiesWithReports' => [
                    'columns' => [
                        'name' => ['id' => 'name', 'title' => 'Client Name', 'showColumn' => true],
                    ],
                    'data' => $companiesWithReports
                ],
                'companiesWithoutReports' => [
                    'columns' => [
                        'name' => ['id' => 'name', 'title' => 'Client Name', 'showColumn' => true],
                    ],
                    'data' => $companiesWithoutReports
                ],
                'availableCompanies' => $availableCompanies
            ];

            return ['status' => true, 'data' => $data];
        });

        Route::post('get-reports-for-bulk-update', function(Request $reqeust) {
            
        });

        Route::post('export-reports-by-month-year', function(Request $request) {
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');

            $month = $request->input('month');
            $year = $request->input('year');

            $sql = "
                select 
                    c.name as 'Client', 
                    CONCAT(cr.month, ', ', cr.year) as 'For Period',
                    CONCAT(u.first_name, u.last_name) as 'Uploaded by',
                    DATE_FORMAT(cr.updated_at,'%d/%m/%Y') as 'Uploaded at',
                    rs.name as 'Status'
                FROM
                    {$reports_base_table}.connect_reports
                LEFT JOIN
                    {$accounts_base_table}.companies on companies.works_manager_client_id = connect_reports.client_id 
                LEFT JOIN 
                    {$accounts_base_table}.users on users.id = connect_reports.uploaded_by 
                LEFT JOIN 
                    {$reports_base_table}.report_status on report_status.id = connect_reports.status

                WHERE 
                    month = '{$month}' and year = {$year}
                    
                ORDER BY 
                    c.name ASC
            ";

            $data = ConnectReports::selectRaw("{$accounts_base_table}.companies.name as 'client', 
            CONCAT(connect_reports.month, ', ', connect_reports.year) as 'period',
            CONCAT({$accounts_base_table}.users.first_name, {$accounts_base_table}.users.last_name) as 'uploaded_by',
            DATE_FORMAT(connect_reports.updated_at,'%d/%m/%Y') as 'uploaded_date',
            {$reports_base_table}.report_status.name as 'status'")
                ->leftJoin('{$accounts_base_table}.companies', '{$accounts_base_table}.companies.works_manager_client_id', 'connect_reports.client_id')
                ->leftJoin('{$accounts_base_table}.users', '{$accounts_base_table}.users.id', 'connect_reports.uploaded_by')
                ->leftJoin('{$reports_base_table}.report_status', '{$reports_base_table}.report_status.id', 'connect_reports.status')
                ->where('month', $month)
                ->where('year', $year)->orderBy('{$accounts_base_table}.companies.name', 'ASC')->groupBy('connect_reports.id')->get();

            $dataArray = [
                [
                    'client',
                    'period',
                    'uploaded_by',
                    'uploaded_date',
                    'status'
                ],
            ];

            $headers = [
                'Client',
                'Period',
                'Uploaded by',
                'Uploaded date',
                'Status'
            ];

            // Convert each object to an array and add to the data array
            $d = $data->toArray();
            foreach ($d as $item) {
                $dataArray[] = (array) $item;
            }

            return Excel::download(new ExcelExport($d, $dataArray[0], $headers), 'Uploaded reports for ' . $month. ' ' . $year .  '.xlsx');
    
        });

    });

    // Report Admin Email Routes
    Route::prefix('email')->group(function () {

        Route::post('send-report-approval-request', function (Request $request) {
            $connect_report_id = $request->input('report_id');
            $requester_id = $request->input('user_id');
            $connect_report = ConnectReports::find($connect_report_id);
            $client_id = $connect_report->client_id;

            $company = Companies::where('works_manager_client_id', $client_id)->first();

            $name = $connect_report->name;
            $uploaded_by = $connect_report->uploaded_by;

            $user = User::find($uploaded_by);
            $user_name = $user->first_name . ' ' . $user->last_name;
            $bcc = ["rajesh.subramanian@carisma-solutions.com.au", "matheen.abdul@purplequay.com.au"];
            $testing = ["matheen.abdul@purplequay.com.au"];

            $team = [];
            $teamSQL = Team::where('client_id', $company->id)
                ->whereIn('role_id', [3, 24]);
            $team = $teamSQL->first();


            if (isset ($company)) {
                $team = [];
                $teamSQL = Team::where('client_id', $company->id)
                    ->whereIn('role_id', [3, 24]);
                $team = $teamSQL->first();

                // For Testing
                // Comment both below Mail calls while testing
                // Mail::to(['matheen.abdul@purplequay.com.au'])
                //     ->send(new SendReportApprovalRequest($name, $team->name, $user_name, $company->name, 'Report Request Approval Testing', 'request'));

                // Production Email Trigger
                if (isset ($team)) {
                    Mail::to($team->email)
                        ->bcc($bcc)
                        ->send(new SendReportApprovalRequest($name, $team->name, $user_name, $company->name, 'Report Request Approval Reminder', 'request'));
                    $connect_report->is_approval_mail_sent = 1;
                    $connect_report->approval_mail_sent_to = $team->email;
                    $connect_report->approval_mail_requested_by = $requester_id;
                    $connect_report->save();

                    return [
                        'status' => true,
                        'is_team_notified' => true,
                        'message' => 'Reminder request sent for client ' . $company->name,
                        'data' => $connect_report,
                        'team' => $team,
                        'team_sql' => $teamSQL,
                        'requester' => $name,
                        'username' => $user_name
                    ];
                } else {
                    Mail::to($bcc)
                        ->send(new SendReportApprovalRequest('Approval request email failed for ' . $name, 'Team', $user_name, $company->name, 'Report Request Approval Reminder Failed', 'failed'));
                    $connect_report->is_approval_mail_sent = 0;
                    $connect_report->save();

                    return [
                        'status' => true,
                        'is_team_notified' => false,
                        'message' => 'Reminder request could not be sent for the client ' . $company->name,
                        'data' => $connect_report,
                        'name' => $name,
                        'username' => $user_name
                    ];
                }
            } else {
                return ['status' => false, 'message' => 'Could not get team details. Please contact system administrator.'];
            }
        });

    });


    // Report Routes
    Route::prefix('reports')->group(function () {
        Route::post('reset', 'App\Http\Controllers\ConnectReportsController@reset')->name('reports.reset');

        Route::post('check-pdf-client', 'App\Http\Controllers\PDFCheckerController@checkPDFClient');
    });
});