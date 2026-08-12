<?php

use App\Http\Controllers\NotificationController;
use App\Models\CommentCodes;
use App\Models\Comments;
use App\Models\Companies;
use App\Models\InstructionNotes;
use App\Models\JobRating;
use App\Models\Team;
use App\Models\User;
use App\Models\UserDetails;
use App\Models\JobClientNotes;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Client Routes
Route::prefix('client')->group(function () {

    Route::post('/get-comments', function (Request $request) {
        $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
        $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
        $job_id = $request->input('job_id');

        $comments = Comments::where('job_id', $job_id)
            ->select(
                'comments.id',
                'comments.job_id',
                'comments.user_id',
                'comments.comment',
                'comments.created_at',
                '{$accounts_base_table}.users.first_name as first_name',
                '{$accounts_base_table}.users.last_name as last_name',
                '{$accounts_base_table}.users.email',
                '{$accounts_base_table}.user_details.profile_picture as profile_picture'
            )
            ->leftJoin('{$accounts_base_table}.users', '{$accounts_base_table}.users.id', '=', 'comments.user_id')
            ->leftJoin('{$accounts_base_table}.user_details', '{$accounts_base_table}.user_details.user_id', '=', 'comments.user_id')
            ->get();

        return ['status' => true, 'data' => $comments];
    });

    Route::post('/send-comment', function (Request $request) {
        $comment = new Comments();
        $comment->job_id = $request->input('job_id');
        $comment->user_id = $request->input('user_id');
        $comment->comment = $request->input('comment');
        $comment->save();

        return ['status' => true, 'message' => 'Comment saved', 'comment' => $comment->id];
    });

    // For Job Status and Comments
    // Insert comments to Works Manager comments table using SP
    Route::post('/comments/insert', function (Request $request) {
        // SP_InsertDashboardComments for CLIENT
        //1 __id INT, 2 __aid INT, 3 __userId INT, 4 __pid INT, 5 __commentType INT, 6 __comments LONGTEXT, 
        // 7 __commentCode Int, 8 __Code int, 9 __ViewStatus int

        /* 1 */  $id = 0;
        /* 2 */  $job_id = $request->input('job_id');
        /* 3 */  $user_id = $request->input('user_id');
        /* 4 */  $client_id = $request->input('client_id');
        /* 5 */  $comment_type = $request->input('comment_type');
        /* 6 */  $comments = $request->input('comments');
        /* 7 */  $comment_code = $request->input('comment_code');
        /* 8 */  $code = $request->input('code');
        
        $user = User::find($user_id);
        $user_details = UserDetails::where('user_id', $user->id)->first();

        $company = Companies::where('works_manager_client_id', $client_id)->first();
        // $wm_client_users_sp = "call Sp_FetchClientpartners($client_id, $user_details->wm_client_id)";
        // $wm_client_users_results = DB::connection('wm_mysql')->select($wm_client_users_sp);
        $client_users = [];
        // $wm_client_users_array = array_map(function($result) {
        //     return $result->SecondaryCid;
        // }, $wm_client_users_results);
        
        // if(count($wm_client_users_array) > 0) {
        //     $wm_client_users = array_map('intval', explode(',', $wm_client_users_array[0]));
    
        //     $client_users = UserDetails::whereIn('user_id', $wm_client_users)->get();
        // }

        if($company !== null && $user !== null) {
            try {
                $insert_procedure = "call SP_InsertDashboardComments($id, $job_id, $user_id, $client_id, $comment_type, '$comments', $comment_code, $code)";
                $data = DB::connection('wm_mysql')->select($insert_procedure);  
            } catch(Exception $e) {
                return response()->json([
                    'status' => false,
                    'error' => [
                        'title' => 'Something went wrong',
                        'body' => $e->getMessage()
                    ],
                ], 500);
            }

            if($user->company_id !== 1) $is_client = true;
            else $is_client = false;
    
            try {
                // Make a GET request to Notifications
                $teams = Team::where('client_id', $company->id)->get();
                $ids = [];

                // foreach ($teams as $team) {                    
                //     if($team->user_id !== $user->id) {
                //         $result = app('App\Http\Controllers\NotificationController')->sendDirectNotificationToDevice(
                //             $team->user_id, 
                //             'New comment from ' . $user->first_name, 
                //             $comments, 
                //             1, 
                //             2, 
                //             'alert', 
                //         );
                //     }
                //     $t = [
                //         'team_id' => $team->user_id,
                //         'result' => $result
                //     ];
                //     $ids[] = $t;
                // }

                // foreach ($client_users as $cu) {                    
                //     if($cu->user_id !== $user->id) {
                //         $result = app('App\Http\Controllers\NotificationController')->sendDirectNotificationToDevice(
                //             $cu->user_id, 
                //             'New comment from ' . $user->first_name, 
                //             $comments, 
                //             1, 
                //             2, 
                //             'alert', 
                //         );
                //     }
                //     $t = [
                //         'cu_id' => $cu->user_id,
                //         'result' => $result
                //     ];
                //     $ids[] = $t;
                // }
    
                return ['status' => true, 'message' => 'Comments have been saved', 'ids' => $ids, 'teams' => $teams, 'cusers' => $client_users];
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
        } else if($company === null) return ['status' => false, 'message' => 'Company does not exists'];
        else if($user === null) return ['status' => false, 'message' => 'User does not exists'];
        else return ['status' => false, 'message' => 'Something went wrong'];
        
        
        // Old way of calling stored procedure - not needed if new method works
        // $data = DB::connection('wm_mysql')->select('call SP_InsertDashboardComments(?,?,?,?,?,?,?,?,?)', array($id, $job_id, $user_id, $client_id, $comment_type, $comments, $comment_code, $code, $viewstatus));
    });

    // For Job Status and Comments
    // Get comments from WM comments table
    Route::post('/comments/get', function (Request $request) {
        $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
        $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
        // SP_ShowDashboardComments
        // __aid INT

        $job_id = $request->input('job_id');

        $data = DB::connection('wm_mysql')->select('call SP_ShowDashboardComments(?)', array($job_id));

        $comments = collect($data); // Convert $comments into a collection

        if ($comments->count() > 0) {
            $userIds = collect($comments)->pluck('UserId')->toArray();
            $user_ids = collect($userIds)->unique()->values()->all();

            $users = User::leftJoin('{$accounts_base_table}.user_details', '{$accounts_base_table}.user_details.user_id', '=', 'users.id')
                ->whereIn('users.id', $user_ids)->get();
            
            $comments = $comments->map(function ($comment) use ($users) {
                foreach ($users as $user) {
                    if(file_exists(Storage::disk('local')->url($user->profile_picture))) {
                        // $profile_photo = asset(Storage::disk('local')->url($user->profile_picture));
                        $profile_photo = Storage::url($user->profile_picture);
                        str_replace('pqreports', 'pqaccountsapi', $profile_photo);
                    }
                    else 
                        $profile_photo = $user->profile_picture;

                    if ($comment->UserId == $user->user_id) {
                        $commentArray = (array) $comment; // Convert stdClass to array
                        $commentArray['username'] = "$user->first_name $user->last_name";
                        $commentArray['profile_picture'] = 'https://pqaccountsapi.welingkaronline.org/storage/' . $profile_photo;
                        $comment = (object) $commentArray;
                    }
                }
                return $comment;
            });

            return ['status' => true, 'data' => $comments, 'users' => $users, 'user_ids' => $user_ids];
        } else {
            return ['status' => false, 'data' => []];
        }
    });


    Route::get('/get-comment-codes', function () {
        $codes = CommentCodes::where('app_id', '1')->get();
        return ['status' => true, 'data' => $codes];
    });

    Route::prefix('instructions')->group(function () {

        Route::post('mark-read', function (Request $request) {
            $job_id = $request->input('job_id');
            $comment_viewed_by = $request->input('comment_viewed_by');

            try {
                DB::connection('wm_mysql')->table('jobmonitor')->where('Aid', $job_id)->update([
                    'CommentViewStatus' => 1,
                    'CommentViewedBy' => $comment_viewed_by
                ]);

                return ['status' => true, 'message' => 'Instruction has been marked as resolved'];
            } catch (Exception $e) {
                return ['status' => true, 'message' => 'Something went wrong while updating instruction status', 'error' => $e->getMessage()];
            }
        });

    });
    
    Route::prefix('notes')->group(function() {
        
        Route::post('get-notes', function(Request $request) {
            if(!$request->has('client_id') || !$request->has('user_id') || !$request->has('job_id')) {
                return ['status' => false, 'message' => 'Invalid configuration. Something went wrong while fetching notes.'];
            }
            
            $client_id = $request->input('client_id');
            $user_id = $request->input('user_id');
            $job_id = $request->input('job_id');
            
            $data = JobClientNotes::select('id', 'note', 'created_at')->where('client_id', $client_id)->where('user_id', $user_id)->where('job_id', $job_id)->where('is_deleted', 0)->get();
                
            return ['status' => true, 'data' => $data];
        });
        
        Route::post('save-note', function(Request $request) {
            if(!$request->has('client_id') || !$request->has('user_id') || !$request->has('job_id') || !$request->has('note')) {
                return ['status' => false, 'message' => 'Invalid configuration. Something went wrong while fetching notes.'];
            }
            
            $client_id = $request->input('client_id');
            $user_id = $request->input('user_id');
            $job_id = $request->input('job_id');
            $note = $request->input('note');
            
            if(strlen($note) > 3000) {
                return ['status' => false, 'message' => 'Notes length too long. Must be less than 3000 letters.'];
            }
            
            JobClientNotes::upsert(
                [
                    [
                        'client_id'     =>  $client_id,
                        'user_id'       =>  $user_id,
                        'job_id'        =>  $job_id,
                        'note'         =>  $note,
                    ]
                ],
                ['client_id', 'job_id', 'user_id'], 
                ['note'] 
            );
            
                
            return ['status' => true, 'message' => 'Notes saved successfully'];
        });
        
        Route::post('delete-note', function(Request $request) {
            if(!$request->has('client_id') || !$request->has('user_id') || !$request->has('job_id') || !$request->has('note_id')) {
                return ['status' => false, 'message' => 'Invalid configuration. Something went wrong while fetching notes.'];
            }
            
            $client_id = $request->input('client_id');
            $user_id = $request->input('user_id');
            $job_id = $request->input('job_id');
            $note_id = $request->input('note_id');
        
            $note = JobClientNotes::where('client_id', $client_id)->where('job_id', $job_id)->where('id', $note_id)->first();
                
            if(!isset($note)) {
                return ['status' => false, 'message' => 'No note found.'];
            }
            
            $note->is_deleted = 1;
            $note->save();
            
            return ['status' => true, 'message' => 'Notes deleted'];
        });
    });
});


// Admin Routes
Route::prefix('admin')->group(function () {

    Route::prefix('comments')->group(function () {
        Route::get('get-codes', function () {
            $codes = CommentCodes::where('app_id', '2')->get();

            return ['status' => true, 'data' => $codes];
        });

        Route::post('get', function (Request $request) {
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
            $wm_user_id = $request->input('wm_user_id');
            $status = 0;
            if ($request->has('status'))
                $status = $request->input('status');

            $data = DB::connection('wm_mysql')->select('call SP_FetchClientwisecomments(?, ?)', array($wm_user_id, $status));

            $comments = collect($data); // Convert $comments into a collection

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
                            // return (object)$commentArray; // Convert back to stdClass
                        }
                    }
                    return $comment;
                });

                return ['status' => true, 'data' => $comments, 'users' => $users, 'user_ids' => $user_ids];
            } else {
                return ['status' => false, 'data' => $data];
            }
        });

        Route::post('get-by-job-id', function (Request $request) {
            $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
            $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
            $job_id = $request->input('job_id');

            $data = DB::connection('wm_mysql')->select('call SP_ShowDashboardComments(?)', array($job_id));

            $comments = collect($data); // Convert $comments into a collection

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
                            // return (object)$commentArray; // Convert back to stdClass
                        }
                    }
                    return $comment;
                });

                return ['status' => true, 'data' => $comments, 'users' => $users, 'user_ids' => $user_ids];
            } else {
                return ['status' => false, 'data' => []];
            }
        });
    });

    Route::post('/send-comment', function (Request $request) {
        // SP_InsertDashboardComments For ADMIN
        //1 __id INT, 2 __aid INT, 3 __userId INT, 4 __pid INT, 5 __commentType INT, 6 __comments LONGTEXT, 
        // 7 __commentCode Int, 8 __Code int, 9 __ViewStatus int

        /* 1 */  $id = 0;
        /* 2 */  $job_id = $request->input('job_id');
        /* 3 */  $user_id = $request->input('user_id');
        /* 4 */  $client_id = $request->input('client_id');
        /* 5 */  $comment_type = $request->input('comment_type');
        /* 6 */  $comments = $request->input('comments');
        /* 7 */  $comment_code = $request->input('comment_code');
        /* 8 */  $code = $request->input('code');

        if(!isset($code)) $code = 0;
        
        $insert_procedure = "call SP_InsertDTComments($id, $job_id, $user_id, $client_id, $comment_type, '$comments', $comment_code, $code)";
        $data = DB::connection('wm_mysql')->select($insert_procedure);

        // Old way of calling stored procedure - not needed if new method works
        // $data = DB::connection('wm_mysql')->select('call SP_InsertDashboardComments(?,?,?,?,?,?,?,?,?)', array($id, $job_id, $user_id, $client_id, $comment_type, $comments, $comment_code, $code, $viewstatus));

        return ['status' => true, 'message' => 'Comments has been saved', 'data' => $data];
    });



    Route::prefix('instructions')->group(function () {

        Route::post('mark-read', function (Request $request) {
            $job_id = $request->input('job_id');
            $comment_viewed_by = $request->input('comment_viewed_by');

            try {
                DB::connection('wm_mysql')->table('jobmonitor')->where('Aid', $job_id)->update([
                    'CommentViewStatus' => 1,
                    'TeamCommentViewedBy' => $comment_viewed_by
                ]);

                return ['status' => true, 'message' => 'Instruction has been marked as resolved'];
            } catch (Exception $e) {
                return ['status' => true, 'message' => 'Something went wrong while updating instruction status', 'error' => $e->getMessage()];
            }
        });


        // Instruction Notes Routes
        Route::prefix('notes')->group(function() {

            Route::post('get-notes', function(Request $request) {
                $instruction_id = $request->input('instruction_id');
                $notes = InstructionNotes::where('instruction_id', $instruction_id)->get();

                return ['status' => true, 'data' => $notes];
            });

            Route::post('save-note', function(Request $request) {
                $instruction_id = $request->input('instruction_id');
                $user_id = $request->input('user_id');
                $notes = $request->input('notes');
    
                InstructionNotes::upsert([
                        'insruction_id' => $instruction_id,
                        'user_id' => $user_id
                    ],
                    [
                        'insruction_id' => $instruction_id,
                        'user_id' => $user_id,
                        'notes' => $notes
                    ]);
                
                return ['status' => true, 'message' => 'Notes saved'];
            });
        });


    });
});
