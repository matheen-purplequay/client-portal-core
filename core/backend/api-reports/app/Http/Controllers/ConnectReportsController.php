<?php

namespace App\Http\Controllers;

use App\Mail\SendReportApprovalRequest;
use App\Mail\SendReportApprovalUpdate;
use App\Mail\SendReportStatus;
use App\Models\Companies;
use App\Models\ConnectReportActivities;
use App\Models\ConnectReports;
use App\Models\MasterCompany;
use App\Models\MyTeam;
use App\Models\ReportStatus;
use App\Models\User;
use App\Models\WeeklyReports;
use App\Models\Team;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use \Thread;

class ConnectReportsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // $companies =Companies::all();
        $isFirstTime = false;
        $companies = DB::connection('wm_mysql')->table('project')->where('Pid', '!=', 8)->where('access', 1)->get();
        if( session('client_id') && session('month') && session('year') && session('report_type')) {
            // Retrieve the session data
            $reportType = session('report_type');
            $month = session('month');
            $year = session('year');
            $clientId = session('client_id');

            // Clear the session data
            $request->session()->forget([
                'report_type',
                'month',
                'year',
                'client_id',
            ]);
        }
        else if( $request->has('client_id') && $request->has('month') && $request->has('year') && $request->has('report_type')) {
            $client_id = $request->input('client_id');
            $month = $request->input('month');
            $year = $request->input('year');
            $report_type = $request->input('report_type');
            $filters = [
                'client_id' => $client_id,
                'month' => $month,
                'year' => $year,
                'report_type' => $report_type
            ];
            $isFirstTime = true;
            if($report_type == 'connect') {
                $reports = ConnectReports::where('month', $month)
                    ->where('year', $year)
                    ->where('client_id', $client_id)
                    ->select('connect_reports.id', 'connect_reports.name', 'connect_reports.month', 'connect_reports.year', 'connect_reports.client_director', 'connect_reports.team_lead', 'connect_reports.status', 'connect_reports.reason', 'report_status.name as status_name')
                    ->join('report_status', 'connect_reports.status', '=', 'report_status.id')->get();
                return view('pages.reports.reports-list')->with(compact('companies', 'reports', 'filters'));
            }
        } else {
            $user = Auth::user();
            return view('pages.reports.reports-list')->with(compact('companies', 'isFirstTime', 'user'));
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // $companies =Companies::all();
        $companies = DB::connection('wm_mysql')->table('project')->where('Pid', '!=', 8)->where('access', 1)->get();
        return view('pages.reports.reports-upload')->with(compact('companies'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $client_id = $request->input('client_id');
        if($client_id != '') {
            $name = $request->input('name');
            $pages = $request->input('pages');
            $month = $request->input('month');
            $year = $request->input('year');
            $file = $request->file('report');
            $uploaded_by = $request->input('uploaded_by');
            $custom_section = $request->input('custom_section');

            // Check if already a report uploaded for the selected month and year
            $existing_report = ConnectReports::where('month', $month)->where('year', $year)->where('client_id', $client_id)->first();
            if(isset($existing_report)) {
                return [
                    'status' => false, 
                    'error' => [
                        'code' => 800,
                        'type' => 'error',
                        'title' => 'Existing report fount',
                        'message' => 'Report already exists for selected month and year. Please remove existing report if new report need to be uploaded.'
                    ]
                ];
            }

            if(!is_file($file)) {
                return ['status' => false, 'message' => 'File not present', 'file' => $request->file('report')];
            }
            $client_director = $request->input('client_director');
            $team_lead = $request->input('team_lead');
            $report_type = $request->input('report_type');
            // $teams = DB::connection('accounts_mysql')->table('teams')->where('client_id', $client_id)->get();

            if($request->has('report')) {

                if($report_type == 'connect') {
                    try {
                        // Save Connect Report
                        $connect = new ConnectReports();
                        $connect->name = $name;
                        $connect->month = $month;
                        $connect->year = $year;
                        $connect->uploaded_by = $uploaded_by;
                        $connect->custom_section = $custom_section;
                        $connect->client_id = $client_id;
                        $fileName = time().'_'.$file->getClientOriginalName();
                        $path =  $client_id . '/connect';
                        $filePath = $file->storeAs($path, $fileName, 'public');
                        $connect->file = $filePath;
                        $connect->save();

                        $company = Companies::where('works_manager_client_id', $client_id)->first();
                        $user = User::find($uploaded_by);
                        $user_name = $user->first_name . ' ' . $user->last_name;
                        $bcc = ["rajesh.subramanian@carisma-solutions.com.au", "aashikka.roshan@purplequay.com.au", "matheen.abdul@purplequay.com.au"];
                        // if(isset($company)) {
                        //     $team = [];
                        //     $teamSQL = Team::where('client_id', $company->id)
                        //     ->whereIn('role_id', [3,24]);
                        //     $team = $teamSQL->first();
            
                        //     if(isset($team)) {
                        //         Mail::to($team->email)
                        //             ->bcc($bcc)
                        //             ->send(new SendReportApprovalRequest($name, $team->name, $user_name, $company->name));
                        //         $connect->is_approval_mail_sent = 1;
                        //         $connect->approval_mail_sent_to = $team->email;
                        //         $connect->save();
                        //     } else {
                        //         Mail::to($bcc)
                        //             ->send(new SendReportApprovalRequest('Approval request email failed for ' . $name, 'Team', $user_name, $company->name));
                        //         $connect->is_approval_mail_sent = 1;
                        //         $connect->approval_mail_sent_to = implode($bcc, ',');
                        //         $connect->save();
                        //     }
                        // }

                        if($request->has('uploaded_by')) {
                            $activity = new ConnectReportActivities();
                            $activity->report_id = $connect->id;
                            $activity->activity_type = 'uploaded';
                            $activity->user_id = $uploaded_by;
                            $activity->save();
                        }

                        return ['status' => true, 'message' => 'Connect report uploaded'];
                    } catch (Exception $e) {
                          return $e->getMessage();
                    }
                } else if($report_type == 'weekly') {
                    $weekly = new WeeklyReports();
                    $weekly->name = $name;
                    $weekly->pages = $pages;
                    $weekly->month = $month;
                    $weekly->week = '';
                    $weekly->year = $year;
                    $weekly->pages = $pages;
                    $weekly->client_id = $client_id;
                    $fileName = time().'_'.$file->getClientOriginalName();
                    $path =  $client_id . '/weekly';
                    $filePath = $file->storeAs($path, $fileName, 'public');
                    $weekly->file = $filePath;
                    $weekly->save();
                    return ['status' => true, 'message' => 'Weekly report uploaded'];
                }
                
            } else {
                return ['status' => false, 'message' => 'No file uploaded'];
            }
    
        } else {
            return ['status' => false, 'message' => 'Something went wrong.', 'request' => $request->post()];
        }
    }

    /**
     * Updated status of given report
     * This function not yet used or need to be checked if it is used
     */
    public function updateStatus(Request $request)
    {
        $report_id = $request->input('report_id');
        $role = $request->input('role');
        $user_id = $request->input('user_id');
        $type = $request->input('type');
        $status = ReportStatus::where('role', $role)->where('type', $type)->first();
        if(isset($status)) {
            $report = ConnectReports::where('id', $report_id)->first();
            $report->status = $status->id;
            $report->action_by = $user_id;
            $report->save();
            
            if($type == 'approved') return ['status' => true, 'message' => 'Report approved'];
            else if($type == 'rejected') return ['status' => true, 'message' => 'Report rejected'];
            else if($type == 'deactivated') return ['status' => true, 'message' => 'Report deactivated'];
        } else {
            return ['status' => false, 'message' => 'Status not found'];
        }
    }

    /**
     * Approve given report
     */
    public function approve(Request $request)
    {
        $report_id = $request->input('report_id');
        $role = $request->input('role');
        $user_id = $request->input('user_id');
        $type = $request->input('type');
        $status = ReportStatus::where('role', $role)->where('type', $type)->first();
        $report = ConnectReports::where('id', $report_id)->first();
        $company = Companies::where('works_manager_client_id', $report->client_id)->first();

        $activity = new ConnectReportActivities();
        $activity->report_id = $report_id;
        $activity->status_id = $status->id;
        $activity->user_id = $user_id;
        $activity->activity_type = 'reviewed';
        $activity->save();

        $user = User::find($report->uploaded_by);
        $report->status = $status->id;
        $report->approved_by = $user_id;
        $report->save();

        $uploaded_by_name = $user->first_name . ' ' . $user->last_name;

        $master_company = MasterCompany::where('master_company_id', $company->master_company_id)->first();
        $notifiable_users = User::leftJoin('user_details', 'user_details.user_id', 'users.id')
            ->where('user_details.company_id', $company->id)->pluck('users.email');

        try {
            $bcc = config('settings.email.system-admin.bcc');
            Mail::to($user->email)->bcc($bcc)
                ->send(new SendReportStatus($report->name, $uploaded_by_name, $company->name, 'Report approved', 'approved'));

            Mail::to($notifiable_users)->bcc($bcc)
                ->send(new SendReportApprovalUpdate($company->name, $report->month, $report->year, $master_company->portal_link, $master_company->primary_color, $master_company->support_email));
        } catch(Exception $e) {
            return ['status' => true, 'message' => 'Something went wrong while sending email', 'error' => $e->getMessage()];
        }
        
        return ['status' => true, 'message' => 'Report approved'];
    }

    /**
     * Approve given report
     */
    public function bulkApprove(Request $request)
    {
        $report_ids = $request->input('report_ids');
        $role = $request->input('role');
        $user_id = $request->input('user_id');
        $type = $request->input('type');
        $status = ReportStatus::where('role', $role)->where('type', $type)->first();

        $saved_reports = [];
        $unsaved_reports = [];

        foreach ($report_ids as $report_id) {
            try {
                $report = ConnectReports::where('id', $report_id)->first();
                $company = Companies::where('works_manager_client_id', $report->client_id)->first();
        
                $activity = new ConnectReportActivities();
                $activity->report_id = $report_id;
                $activity->status_id = $status->id;
                $activity->user_id = $user_id;
                $activity->activity_type = 'reviewed';
                $activity->save();
        
                $user = User::find($report->uploaded_by);
                $report->status = $status->id;
                $report->approved_by = $user_id;
                $report->save();
    
                $saved_reports = [
                    'title' => $report->name,
                    'id' => $report->id,
                    'month' => $report->month,
                    'year' => $report->year,
                    'client' => $company->name
                ];
            } catch(Exception $e) {
                if($report !== null) {
                    $unsaved_reports = [
                        'title' => $report->name,
                        'id' => $report->id,
                        'month' => $report->month,
                        'year' => $report->year,
                        'client' => $company->name
                    ];
                }
            }
        }

        return ['status' => true, 'message' => 'Report approved', 'saved_reports' => $saved_reports, 'unsaved_reports' => $unsaved_reports];
    }

    /**
     * Reject given report
     */
    public function reject(Request $request)
    {
        $report_id = $request->input('report_id');
        $role = $request->input('role');
        $user_id = $request->input('user_id');
        $type = $request->input('type');
        $reason = $request->input('reason');
        $status = ReportStatus::where('role', $role)->where('type', $type)->first();
        $report = ConnectReports::where('id', $report_id)->first();
        $company = Companies::where('works_manager_client_id', $report->client_id)->first();

        $activity = new ConnectReportActivities();
        $activity->report_id = $report_id;
        $activity->status_id = $status->id;
        $activity->reason = $reason;
        $activity->activity_type = 'reviewed';
        $activity->user_id = $user_id;
        $activity->save();

        $user = User::find($report->uploaded_by);
        $report->status = $status->id;
        $report->rejected_by = $user_id;
        $report->reason = $reason;
        $report->save();

        $uploaded_by_name = $user->first_name . ' ' . $user->last_name;
        $err = '';

        try {
            $bcc = config('settings.email.system-admin.bcc');
            Mail::to($user->email)->bcc($bcc)
                ->send(new SendReportStatus($report->name, $uploaded_by_name, $company->name, 'Report rejected', 'rejected'));

            return ['status' => true, 'message' => 'Report rejected'];
        } catch(Exception $e) {
            $err = $e->getMessage();
            return ['status' => true, 'message' => 'Report rejected but error occurred while sending email', 'error' => $err];
        }
    }

    /**
     * Reset given report
     */
    public function reset(Request $request)
    {
        $report_id = $request->input('report_id');
        $user_id = $request->input('user_id');
        $report = ConnectReports::where('id', $report_id)->first();
        $report->status = 0;
        $report->reset_by = $user_id;
        $report->reason = "Report reset by user";
        $report->save();

        $activity = new ConnectReportActivities();
        $activity->report_id = $report_id;
        $activity->status_id = 0;
        $activity->user_id = $user_id;
        $activity->activity_type = 'reset';
        $activity->reason = "Report reset by user";
        $activity->save();

        
        return ['status' => true, 'message' => 'Report is reset'];
    }

    /**
     * Display the specified resource.
     */
    public function show(ConnectReports $connectReports)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ConnectReports $connectReports)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ConnectReports $connectReports)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ConnectReports $connectReports)
    {
        //
    }
}
