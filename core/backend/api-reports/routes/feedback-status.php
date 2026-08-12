<?php

use App\Http\Controllers\UserDataController;
use App\Models\CommentCodes;
use App\Models\Comments;
use App\Models\FeedbackStatus;
use App\Models\User;
use App\Models\Companies;
use App\Models\CompanyServices;
use App\Models\ConnectReports;
use App\Models\ContactFormRecipients;
use App\Models\Holidays;
use App\Models\Invoices;
use App\Models\KnowledgeCenter;
use App\Models\MyTeam;
use App\Models\FeedbackCodes;
use App\Models\Newsletters;
use App\Models\IT;
use App\Models\Roles;
use App\Models\Services;
use App\Models\Team;
use App\Models\UserDetails;
use App\Models\WeeklyReports;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Client routes
Route::prefix('client')->group(function() {
    
    // Feedback tab routes - Client Portal
    Route::prefix('feedback-tab')->group(function() {
        Route::post('get-feedback-by-job-id', function(Request $request) {
            $job_id = $request->input('job_id');
            $user_id = $request->input('user_id');

            $feedback = FeedbackStatus::where('Aid', $job_id)->where('UserId', $user_id)->get();

            return ['status' => true, 'data' => $feedback];
        });

        Route::post('save-feedback', function(Request $request) {
            try {
                $job_id = $request->input('Aid');
                $project_id = $request->input('Pid');
                $user_id = $request->input('UserId');
                $process_area = $request->input('ProcessArea');
                $feedback = $request->input('Feedback');
                $date = $request->input('Date');
                $job_status = $request->input('Status');

                $feedback_status = '1';
    
                FeedbackStatus::create([
                    'Aid' => $job_id,
                    'Pid' => $project_id,
                    'UserId' => $user_id,
                    'ProcessArea' => $process_area,
                    'Feedback' => $feedback,
                    'FeedbackStatus' => $feedback_status,
                    'Status' => $job_status,
                    'Date' => $date
                ]);
    
                return ['status' => true, 'message' => 'Feedback status saved'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while saving feedback status', 'error' => $e->getMessage()];
            }
        });
    });


    // Feedback status routes
    Route::prefix('feedback-status')->group(function() {

        // Get feedback codes
        Route::get('get-feedback-codes', function() {
            $codes = FeedbackCodes::all();

            return ['status' => true, 'data' => $codes];
        });

        // Get list of jobs with last feedback
        // Params - pid, startdate, enddate, all, status, feedbackcode
        Route::post('get-feedback-status', function(Request $request) {
            try {
                $start_date = $request->input('start_date');
                $end_date = $request->input('end_date');
                $project_id = $request->input('project_id');
                $user_id = $request->input('user_id');
    
                $select_procedure = "call Sp_FetchClientFeedback('$start_date', '$end_date', $user_id, $project_id)";
                $data = DB::connection('wm_mysql')->select($select_procedure);

                return ['status' => true, 'data' => $data];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedbacks', 'error' => $e->getMessage()];
            }
        });

        // Get feedback for job id
        // Params - job id
        Route::post('get-feedback-by-job-id', function(Request $request) {
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
            try {
                $job_id = $request->input('job_id');
                $feedback = DB::connection('wm_mysql')->select('call SP_ShowDashboardFeedback(?)', array($job_id));
        
                $comments = collect($feedback); // Convert $comments into a collection

                if ($comments->count() > 0) {
                    $userIds = collect($comments)->pluck('UserId')->toArray();
                    $user_ids = collect($userIds)->unique()->values()->all();
        
                    $users = User::leftJoin('{$accounts_base_table}.user_details', '{$accounts_base_table}.user_details.user_id', '=', 'users.id')
                        ->whereIn('users.id', $user_ids)->get();
                
                    $comments = $comments->map(function ($comment) use ($users) {
                        foreach ($users as $user) {
                            if ($comment->UserId == $user->user_id) {
                                $commentArray = (array) $comment; // Convert stdClass to array
                                $commentArray['username'] = $user->first_name . ' ' . $user->last_name;
                                $commentArray['profile_picture'] = $user->profile_picture;
                                $comment = (object) $commentArray;
                            }
                        }
                        return $comment;
                    });
                }

                return ['status' => true, 'data' => $comments];
            } catch(Exception $e) {
                return ['status' => true, 'message' => 'Something went wrong while fetching feedback'];
            }
        });
    
        // Insert new feedback
        // Params - id, aid, userId, pid, feedbackType, feedback, feedbackCode
        Route::post('insert-feedback', function(Request $request) {
            try {
                $job_id = $request->input('job_id');
                $project_id = $request->input('project_id');
                $user_id = $request->input('user_id');
                $feebdack_type = $request->input('feedback_type');
                $feedback = $request->input('feedback');
                $feedback_code = $request->input('feedback_code');
                $subject = $request->input('subject');

                if($request->has('id')) $id = $request->input('id');
                else $id = 0;
        
                DB::connection('wm_mysql')->select('call SP_InsertDashboardFeedback(?,?,?,?,?,?,?,?)', array ($id, $job_id, $user_id, $project_id, $feebdack_type, $feedback, $feedback_code, $subject));
    
                $user = User::find($user_id);
                $company = Companies::where('works_manager_client_id', $project_id)->first();
                $client_users = UserDetails::where('company_id', $company->id)->get();
        
                $is_client = true;
                
                try {
                    $client = new Client();
    
                    // Make a GET request to Notifications
                    $teams = Team::where('client_id', $company->id)->get();
    
                    foreach ($teams as $team) {                    
                        if($team->user_id !== $user->id) {
                            $response = $client->request('GET', env('ACCOUNTS_API') . '/client/notifications/send-notification', [
                                'headers' => [
                                    'Accept' => 'application/json',
                                ],
                                'body' => [
                                    'app_id'        => 1,
                                    'sub_app_id'    => 2,
                                    'user_id'       => $team->user_id,
                                    'type'          => 'alert',
                                    'action_title'  => '',
                                    'action_url'    => '',
                                    'title'         => 'New feedback from ' . $user->first_name,
                                    'body'          => $feedback
                                ]
                            ]);
                        }
                    }
    
                    foreach ($client_users as $cu) {                    
                        if($cu->user_id !== $user->id) {
                            $response = $client->request('GET', env('ACCOUNTS_API') . '/client/notifications/send-notification', [
                                'headers' => [
                                    'Accept' => 'application/json',
                                ],
                                'body' => [
                                    'app_id'        => 1,
                                    'sub_app_id'    => 2,
                                    'user_id'       => $cu->user_id,
                                    'type'          => 'alert',
                                    'action_title'  => '',
                                    'action_url'    => '',
                                    'title'         => 'New feedback from ' . $user->first_name,
                                    'body'          => $feedback
                                ]
                            ]);
                        }
                    }
        
                } catch (\Exception $e) {
                    // Handle any errors
                    return response()->json([
                        'status' => false,
                        'error' => [
                            'title' => 'Something went wrong',
                            'body' => $e->getMessage()
                        ],
                    ], 500);
                }


                return ['status' => true, 'message' => 'Feedback has been posted'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedbacks', 'error' => $e->getMessage()];
            }
        });

        // Get feedback comments
        // Params - masterid
        Route::post('get-feedback-comments', function(Request $request) {
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
            try {
                $master_id = $request->input('master_id');
    
                $feedback_comments = DB::connection('wm_mysql')->select('call SP_RetrieveDashboardFeedbacksubject(?)', array ($master_id));
        
                $comments = collect($feedback_comments); // Convert $comments into a collection

                if ($comments->count() > 0) {
                    $userIds = collect($comments)->pluck('UserId')->toArray();
                    $user_ids = collect($userIds)->unique()->values()->all();
        
                    $users = User::leftJoin('{$accounts_base_table}.user_details', '{$accounts_base_table}.user_details.user_id', '=', 'users.id')
                        ->whereIn('users.id', $user_ids)->get();
                        
                    $comments = $comments->map(function ($comment) use ($users) {
                        foreach ($users as $user) {
                            if ($comment->UserId == $user->user_id) {
                                $commentArray = (array) $comment; // Convert stdClass to array
                                $commentArray['username'] = $user->first_name . ' ' . $user->last_name;
                                $commentArray['profile_picture'] = $user->profile_picture;
                                $comment = (object) $commentArray;
                            }
                        }
                        return $comment;
                    });
                }

                return ['status' => true, 'data' => $comments];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedback comments', 'error' => $e->getMessage()];
            }
        });

        // Insert Feedback Comments
        // Params - __masterid, __aid, __userId, __pid, __feedbackType, __feedback, __feedbackCode
        Route::post('insert-feedback-comments', function(Request $request) {
            try {
                $master_id = $request->input('master_id');
                $job_id = $request->input('job_id');
                $user_id = $request->input('user_id');
                $project_id = $request->input('project_id');
                $feebdack_type = $request->input('feedback_type');
                $feedback = $request->input('feedback');
                $feedback_code = $request->input('feedback_code');
        
                DB::connection('wm_mysql')->select('call SP_InsertDashboardFeedbackmasterID(?,?,?,?,?,?,?)', array ($master_id, $job_id, $user_id, $project_id, $feebdack_type, $feedback, $feedback_code));
    
                return ['status' => true, 'message' => 'Feedback comment has been posted'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedbacks', 'error' => $e->getMessage()];
            }
        });

        Route::post('update-feedback-closure', function(Request $request) {
            try {
                if(!$request->has('feedback_id')) return ['status' => false, 'message' => 'Required parameters not found'];
                $feedback_id = $request->input('feedback_id');
                $status = 4;

                $select_procedure = "call Sp_UpdateFeedbackStatus($status, $feedback_id)";
                DB::connection('wm_mysql')->select($select_procedure);
    
                return ['status' => true, 'message' => 'Feedback status has been updated'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while updating feedback. If problem persists, please contact system administrator.', 'error' => $e->getMessage()];
            }
        });

    });
});


// Admin routes
Route::prefix('admin')->group(function() {

    Route::prefix('feedback-tab')->group(function() {

        Route::post('get-feedback-by-user-id', function(Request $request) {
            // call Sp_FetchFeedbackComments('2024-06-25','2024-06-27',41)
            $user_id = $request->input('user_id');
            $start_date = $request->input('start_date');
            $end_date = $request->input('end_date');

            $select_procedure = "call Sp_FetchFeedbackComments('$start_date', '$end_date', $user_id)";
            $data = DB::connection('wm_mysql')->select($select_procedure);
    
            return ['status' => true, 'data' => $data];
        });

        Route::post('get-feedback-by-job-id', function(Request $request) {
            $job_id = $request->input('job_id');

            $feedback = FeedbackStatus::from('tbl_dashboardfeedback as fbs')
                ->select('a.Aid', 'a.JobDescription', 'fbs.Date', 'fbs.Status', 'fbs.Pid', 'fbs.ProcessArea', 'fbs.SubProcessArea', 'fbs.Feedback', 'fbs.UserId', 'fbs.DTComments', 'fbs.FeedbackStatus', 'fbs.IsActive')
                ->leftJoin('activity as a', 'a.Aid', 'fbs.Aid')
                ->where('fbs.Aid', $job_id)->get();

            return ['status' => true, 'data' => $feedback];
        });

        Route::post('save-feedback', function(Request $request) {
            try {
                $feedback_id = $request->input('feedback_id');
                $user_id = $request->input('user_id');
                $sub_process_area = $request->input('sub_process_area');
                $dt_comments = $request->input('dt_comments');
                $status = '2';

                $feedback = FeedbackStatus::find($feedback_id);
                if(isset($feedback_id)) {
                    $feedback->SubProcessArea = $sub_process_area;
                    $feedback->DTComments = $dt_comments;
                    $feedback->DTUserId = $user_id;
                    $feedback->updated_by = $user_id;
                    $feedback->FeedbackStatus = $status;
                    $feedback->save();

                    return ['status' => true, 'message' => 'Feedback comment saved'];
                } else {
                    return ['status' => false, 'message' => 'Feedback could not be found'];
                }
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while saving feedback status'];
            }
        });
    });

    Route::prefix('feedback-status')->group(function() {

        // Get feedback codes
        Route::get('get-feedback-codes', function() {
            $codes = FeedbackCodes::all();
    
            return ['status' => true, 'data' => $codes];
        });
    
        // Get list of jobs with last feedback
        // Params - pid, startdate, enddate, all, status, feedbackcode
        Route::post('get-feedback-status', function(Request $request) {
            try {
                $project_id = $request->input('project_id');
                $start_date = $request->input('start_date');
                $end_date = $request->input('end_date');
                $all = $request->input('all');
                $status = $request->input('status');
                $feedback_code = $request->input('feedback_code');
    
                $feedbacks = DB::connection('wm_mysql')->select('call Sp_ShowFeedbackJobStatus(?,?,?,?,?,?)', array ($project_id, $start_date, $end_date, $all, $status, $feedback_code));
    
                return ['status' => true, 'data' => $feedbacks];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedbacks', 'error' => $e->getMessage()];
            }
        });

        // Get feedback comments
        // Params - masterid
        Route::post('get-feedback-comments', function(Request $request) {
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
            try {
                $master_id = $request->input('master_id');
    
                $feedback_comments = DB::connection('wm_mysql')->select('call SP_RetrieveDashboardFeedbacksubject(?)', array ($master_id));
        
                $comments = collect($feedback_comments); // Convert $comments into a collection

                if ($comments->count() > 0) {
                    $userIds = collect($comments)->pluck('UserId')->toArray();
                    $user_ids = collect($userIds)->unique()->values()->all();
        
                    $users = User::leftJoin('{$accounts_base_table}.user_details', '{$accounts_base_table}.user_details.user_id', '=', 'users.id')
                        ->whereIn('users.id', $user_ids)->get();
                        
                    $comments = $comments->map(function ($comment) use ($users) {
                        foreach ($users as $user) {
                            if ($comment->UserId == $user->user_id) {
                                $commentArray = (array) $comment; // Convert stdClass to array
                                $commentArray['username'] = $user->first_name . ' ' . $user->last_name;
                                $commentArray['profile_picture'] = $user->profile_picture;
                                $comment = (object) $commentArray;
                            }
                        }
                        return $comment;
                    });
                }

                return ['status' => true, 'data' => $comments];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedback comments', 'error' => $e->getMessage()];
            }
        });

        // Insert Feedback Comments
        // Params - __masterid, __aid, __userId, __pid, __feedbackType, __feedback, __feedbackCode
        Route::post('insert-feedback-comments', function(Request $request) {
            try {
                $master_id = $request->input('master_id');
                $job_id = $request->input('job_id');
                $user_id = $request->input('user_id');
                $project_id = $request->input('project_id');
                $feebdack_type = $request->input('feedback_type');
                $feedback = $request->input('feedback');
                $feedback_code = $request->input('feedback_code');
        
                DB::connection('wm_mysql')->select('call SP_InsertDashboardFeedbackmasterID(?,?,?,?,?,?,?)', array ($master_id, $job_id, $user_id, $project_id, $feebdack_type, $feedback, $feedback_code));
    
                return ['status' => true, 'message' => 'Feedback comment has been posted'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedbacks', 'error' => $e->getMessage()];
            }
        });

        Route::post('update-feedback-closure', function(Request $request) {
            try {
                if(!$request->has('feedback_id') || !$request->has('sub_process_area')) return ['status' => false, 'message' => 'Required parameters not found'];
                $feedback_id = $request->input('feedback_id');
                $sub_process_area = $request->input('sub_process_area');
                $dt_comments = $request->input('dt_comments');
                $dt_user_id = $request->input('dt_user_id');

                // Error in SP - Stored procedure not working at the moment
                // $select_procedure = "call SP_feedbackdtUpdate($feedback_id, '$dt_comments', '$sub_process_area')";
                // DB::connection('wm_mysql')->select($select_procedure);

                DB::connection('wm_mysql')->table('tbl_dashboardfeedback')
                ->where('id', $feedback_id)
                ->update([
                    'FeedbackStatus' => 3,
                    'DTComments' => $dt_comments,
                    'DTUserId' => $dt_user_id,
                    'SubProcessArea' => $sub_process_area
                ]);
    
                return ['status' => true, 'message' => 'Feedback status has been updated'];
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Error while fetching feedbacks', 'error' => $e->getMessage()];
            }
        });
    });


});