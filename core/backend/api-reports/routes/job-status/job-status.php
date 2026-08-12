<?php

use App\Models\CommentCodes;
use App\Models\Comments;
use App\Models\JobRating;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('client')->group(function () {

    // Jobs related routes
    Route::prefix('jobs')->group(function () {
        // Get Priority List Master
        Route::get('/get-priority-master', function () {
            $data = DB::connection('wm_mysql')->select('call SP_FetchPriorityMaster()');
            return ['status' => true, 'data' => $data];
        });

        // Aggregate job status count
        // call SP_ShowStatusWiseCount(205,720)
        Route::post('get-jobs-status-count', function(Request $request) {
            $project_id = $request->input('project_id');
            $client_id = $request->input('user_id');
            $start_date = $request->input('start_date');
            $end_date = $request->input('end_date');
            $all = $request->input('all');
            $comment_code = $request->input('comment_code');
            $job_status = $request->input('job_status');

            $insert_procedure = "call SP_ShowStatusWiseCount($project_id, $start_date, $end_date, $all, $job_status, $comment_code, $client_id)";
            $data = DB::connection('wm_mysql')->select($insert_procedure);

            return ['status' => true, 'data' => $data];
        });

        // Get Weekly Movement
        Route::post('get-weekly-movement', function (Request $request) {
            $project_id = $request->input('project_id');
            $start_date = $request->input('start_date');
            $end_date = $request->input('end_date');

            try {
                $jobs = DB::connection('wm_mysql')->select('call Sp_fetchdashboardweeklyreport(?,?,?)', array ($project_id, $start_date, $end_date));
                // $originalJobs = $jobs;
                // $data = collect($jobs);
                // $convertedData = [];
                // foreach ($data as $row) {
                //     foreach ($row as $key => $value) {
                //         $convertedData[$key] = mb_convert_encoding($value, 'UTF-8'); // Replace 'latin1' with actual source encoding if known
                //     }
                // }
                return ['status' => true, 'data' => $jobs];
            } catch(Exception $e) {
                return ['status' => false, 'message' => $e->getMessage()];
            }
        });

        // < FOR TESTING - PLEASE DELETE AFTERWARDS
        // Route::post('get-weekly-movement2', function(Request $request) {
        //     $project_id = $request->input('project_id');
        //     $start_date = $request->input('start_date');
        //     $end_date = $request->input('end_date');

        //     try {
        //         $jobs = DB::connection('wm_mysql')->select('call Sp_fetchdashboardweeklyreport1(?,?,?)', array ($project_id, $start_date, $end_date));
        //         return ['status' => true, 'data' => $jobs];
        //     } catch(Exception $e) {
        //         return ['status' => false, 'message' => $e->getMessage()];
        //     }
        // });
        // FOR TESTING - PLEASE DELETE AFTERWARDS />
    });

    // Job Details routes
    Route::prefix('details')->group(function() {
        Route::post('get-details-by-id', function(Request $request) {
            $job_id = $request->input('job_id');

            $details = DB::connection('wm_mysql')->table('tbl_jobstatusupdatelog as tj')
                ->select('tj.Aid', 'a.JobDescription', 'ts.Name', 'tj.smsfNewStatus', 
                        'tj.smsfOldStatus', 'ts.Wsid', 'tj.LastModdate')
                ->leftJoin('activity as a', 'a.Aid', '=', 'tj.Aid')
                ->leftJoin('tbl_smsfjobstatus as ts', 'ts.Code', '=', 'tj.smsfNewStatus')
                ->where('tj.Aid', $job_id)
                ->where('tj.IsApproved', 1)
                ->orderBy('tj.LastModdate', 'DESC')
                ->get();

            return ['status' => true, 'data' => $details];
        });
    });

    // Rating routes
    Route::prefix('rating')->group(function() {
        // Fetch by job id
        Route::post('by-job-id', function(Request $request) {
            $job_id = $request->input('job_id');

            $rating = JobRating::where('job_id', $job_id)->first();
            return ['status' => true, 'data' => $rating];
        });

        // Insert or Update job rating
        Route::post('save-rating', function(Request $request) {
            $job_id = $request->input('job_id');
            $job_quality_rating = $request->input('job_quality_rating');
            $presentation_rating = $request->input('presentation_rating');
            $tat_rating = $request->input('tat_rating');
            $overall_rating = $request->input('overall_rating');
            $overall_comments = $request->input('overall_comments');
            $user_id = $request->input('user_id');
            
            try {
                JobRating::updateOrCreate(
                    [ 'job_id' => $job_id ],
                    [
                        'job_id' => $job_id,
                        'job_quality_rating' => $job_quality_rating,
                        'presentation_rating' => $presentation_rating,
                        'tat_rating' => $tat_rating,
                        'overall_comments' => $overall_comments,
                        'user_id' => $user_id
                    ]
                );

                DB::connection('wm_mysql')->table('jobmonitor')->where('Aid', $job_id)->limit(1)->update(array('rating' => $overall_rating));

                return ['status' => true, 'message' => 'Rating saved successfully for job id ' . $job_id];
            } catch (Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while saving rating', 'error' => $e->getMessage()];
            }

        });
    });
});

Route::prefix('admin')->group(function () {

    // Rating routes
    Route::prefix('rating')->group(function() {
        Route::post('by-client', function(Request $request) {

        });
        Route::post('by-job-id', function(Request $request) {

        });
        Route::post('upsert-rating', function(Request $request) {

        });
    });
});