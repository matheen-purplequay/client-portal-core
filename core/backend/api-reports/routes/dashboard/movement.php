<?php
use App\Exports\ExcelExport;
use App\Models\ConnectReports;
use App\Models\Invoices;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;


Route::prefix('client')->group(function() {
    
    Route::prefix('dashboard')->group(function() {
        
        // Calls SP_FetchBSjobDashboardWithCounts_test, which emits TWO result sets:
        //   1) paginated jobs   2) per-status counts
        //
        // `get-movement-with-counts`    → returns { status, data, counts } for the table + panel.
        // `export-movement-with-counts` → reuses the same helper, ignores counts,
        //                                 lifts the pagination cap so the full set exports.
    
        // -------------------------------------------------------------------------
        // Helper: build the WHERE clause WITHOUT status_id, and pull status_id out
        // as its own value — the new proc takes them as separate parameters and
        // applies status_id only to the jobs result set (not to the counts).
        // -------------------------------------------------------------------------
    
       function buildJobFilters(Request $request) {
    $where_parts = [];
    $status_id = 0; // 0 = no status filter (proc contract)

    if ($request->has('filters')) {
        $filters = json_decode($request->input('filters'));
        $pdo = DB::connection('wm_mysql')->getPdo();

        $q = function ($value) use ($pdo) {
            return $pdo->quote(trim((string) $value));
        };
        $filled = function ($value) {
            return isset($value) && trim((string) $value) !== '';
        };

        if (isset($filters->status_id)) {
            // Note: the OLD getMovement() translated -1 into
            // 'J.wsid != 11 and J.wsid != 35' inline. That logic now lives
            // inside the proc, so we just forward the raw int.
            $status_id = (int) $filters->status_id;
        }

        if ($filled($filters->received_from ?? null)) {
            $where_parts[] = "J.ReceivedForm IN (SELECT cid FROM contacts "
                . "WHERE LOWER(TRIM(Contactname)) = LOWER(" . $q($filters->received_from) . "))";
        }

        if ($filled($filters->accountant ?? null)) {
            $where_parts[] = "J.uid IN (SELECT uid FROM user "
                . "WHERE LOWER(TRIM(Usename)) = LOWER(" . $q($filters->accountant) . "))";
        }

        // Partner and director may hold a contacts.Cid or the name string
        // itself, so both are matched. Drop the leg that does not apply once
        // the column storage is confirmed.
        if ($filled($filters->partner ?? null)) {
            $partner = $q($filters->partner);
            $where_parts[] = "(J.partner IN (SELECT Cid FROM contacts "
                . "WHERE LOWER(TRIM(Contactname)) = LOWER(" . $partner . "))"
                . " OR LOWER(TRIM(J.partner)) = LOWER(" . $partner . "))";
        }

        if ($filled($filters->director ?? null)) {
            $director = $q($filters->director);
            $where_parts[] = "(J.director IN (SELECT Cid FROM contacts "
                . "WHERE LOWER(TRIM(Contactname)) = LOWER(" . $director . "))"
                . " OR LOWER(TRIM(J.director)) = LOWER(" . $director . "))";
        }

        if ($filled($filters->financial_year ?? null)) {
            $where_parts[] = "J.FinancialYear = " . $q($filters->financial_year);
        }

        if (isset($filters->received_date_range)) {
            $where_parts[] = "J.daterecieved BETWEEN " . $q($filters->received_date_range->from)
                . " AND " . $q($filters->received_date_range->to);
        }

        if (isset($filters->commenced_date_range)) {
            $where_parts[] = "J.datecommence BETWEEN " . $q($filters->commenced_date_range->from)
                . " AND " . $q($filters->commenced_date_range->to);
        }

        // natureofjob (N) is joined in the jobs subquery but NOT in the counts
        // query, so this filters via J.nojid to stay valid in both.
        if ($filled($filters->nature_of_job ?? null)) {
            $where_parts[] = "J.nojid IN (SELECT nojid FROM natureofjob "
                . "WHERE LOWER(TRIM(Naturejob)) = LOWER(" . $q($filters->nature_of_job) . "))";
        }
    }

    return [
        'where_condition' => implode(' AND ', $where_parts),
        'status_id'       => $status_id,
    ];
}
    
        // -------------------------------------------------------------------------
        // Helper: calls the merged proc, walks both result sets, applies the
        // per-project hide-columns pass to the jobs rows. Used by both the
        // table fetch and the export.
        //
        // Returns:
        //   ['status' => false, 'message' => ...]                   on validation failure
        //   ['data' => [...jobs], 'counts' => [...statusCounts]]    on success
        // -------------------------------------------------------------------------
    
        function getMovementWithCounts(Request $request) {
            if (!$request->has('project_id') || !$request->has('service_id')) {
                return ['status' => false, 'message' => 'Insufficient parameters.'];
            }
    
            $user_id    = $request->input('user_id', 0);
            $project_id = $request->input('project_id');
            $service_id = $request->input('service_id');
    
            // Caller can override `limit` — export sets it large to avoid truncation.
            $page   = (int) $request->input('page', 1);
            $limit  = (int) $request->input('limit', 5000);
            $offset = ($page - 1) * $limit;
    
            $built     = buildJobFilters($request);
            $where     = $built['where_condition'];
            $status_id = $built['status_id'];
    
            // The proc emits TWO result sets. Laravel's DB::select() only reads
            // the first, so drop to PDO and walk both with nextRowset().
            $pdo  = DB::connection('wm_mysql')->getPdo();
            $stmt = $pdo->prepare('CALL SP_FetchBSjobDashboardWithCounts_final(?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $user_id,
                $project_id,
                $service_id,
                $limit,
                $offset,
                $where,
                $status_id,
            ]);
    
            $jobs = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowset();
            $counts = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->closeCursor();
    
            // Same per-project column-hide pass that getMovement() does today.
            // Applied to jobs only — counts are status-keyed and unaffected.
            $hideConfig = DB::connection('wm_mysql')->table('report_client_hide_columns')
                ->select('pid', 'column_key')
                ->where('report_key', 'job_status')
                ->where('pid', $project_id)
                ->get()
                ->groupBy('pid')
                ->map(function ($items) {
                    return $items->pluck('column_key')->toArray();
                })
                ->toArray();
    
            if (!empty($hideConfig) && isset($hideConfig[$project_id])) {
                foreach ($jobs as $row) {
                    foreach ($hideConfig[$project_id] as $column) {
                        if (property_exists($row, $column)) {
                            unset($row->$column);
                        }
                    }
                }
            }
    
            return ['data' => $jobs, 'counts' => $counts, 'where' => $where];
        }
    
        // -------------------------------------------------------------------------
        // Route: get jobs + counts for the dashboard table + panel.
        // -------------------------------------------------------------------------
    
        Route::post('get-movement-with-counts', function(Request $request) {
            try {
                $result = getMovementWithCounts($request);
                if (isset($result['status']) && $result['status'] === false) {
                    return $result; // validation failure passthrough
                }
    
                return [
                    'status' => true,
                    'data'   => $result['data'],
                    'counts' => $result['counts']
                ];
            } catch (Exception $e) {
                return [
                    'status'  => false,
                    'error'   => $e->getMessage(),
                    'message' => 'Something went wrong while fetching job movement with counts',
                ];
            }
        });
    
        // -------------------------------------------------------------------------
        // Route: export the same filtered jobs to Excel.
        // Reuses getMovementWithCounts() and discards counts. Lifts the pagination
        // cap by injecting a large `limit` — the legacy export-movement silently
        // truncated at 5000 rows; this version doesn't.
        // -------------------------------------------------------------------------
        
        Route::post('export-movement-with-counts', function(Request $request) {
            try {
                // Force a single large page so the proc's LIMIT/OFFSET doesn't
                // cap the export. 1_000_000 is a sentinel; raise if you ever
                // expect a single project to exceed it.
                $request->merge(['page' => 1, 'limit' => 1000000]);
    
                $result = getMovementWithCounts($request);
                if (isset($result['status']) && $result['status'] === false) {
                    return $result;
                }
    
                $data = $result['data']; // counts ignored for export

                // Columns returned by the proc vary (Partner/Director/AssociateName
                // are conditional, per-project hide-columns can drop others), so
                // derive the export columns from the actual result instead of a
                // fixed list that drifts out of sync with the stored procedure.
                $excludedColumns = ['Aid', 'StatusId'];

                $labelMap = [
                    'GroupJobName'  => 'Group Job Name',
                    'Jobname'       => 'Job Name',
                    'Naturejob'     => 'Nature of Job',
                    'ReceivedFrom'  => 'Received From',
                    'Partner'       => 'Partner',
                    'Director'      => 'Director',
                    'AssociateName' => 'Associate Name',
                    'Accountant'    => 'Accountant',
                    'Workstatus'    => 'Work Status',
                    'FinancialYear' => 'Financial Year',
                    'ReceivedDate'  => 'Received Date',
                    'CommencedDate' => 'Commenced Date',

                    // Per-status timeline dates, pivoted by SP_FetchBSjobDashboardWithCounts_final.
                    'YetToStartDate'                       => 'Job In Yet To Start',
                    'WipProcessingDate'                    => 'WIP Processing',
                    'SentForQueriesDate'                   => 'Sent For Queries',
                    'QueryRepliesReceivedYetToAttendDate'  => 'Query Replies Rcvd. Yet To Attend',
                    'WipQueryRepliesDate'                  => 'WIP Query Replies',
                    'InternalReviewDate'                   => 'Internal Review',
                    'WipInternalReviewRepliesDate'         => 'WIP Internal Review Replies',
                    'SentForReviewDate'                    => 'Sent For Review',
                    'ReviewRepliesReceivedYetToAttendDate' => 'Review Replies Rcvd. Yet To Attend',
                    'WipReviewRepliesDate'                 => 'WIP Review Replies',
                    'SentForFinalReviewDate'                => 'Sent For Final Review',
                    'JobCompletedDate'                     => 'Job Completed',
                    'OnHoldDate'                            => 'On Hold',
                    'CancelledDate'                         => 'Cancelled',
                ];

                $columns = !empty($data)
                    ? array_values(array_diff(array_keys((array) $data[0]), $excludedColumns))
                    : array_values(array_diff(array_keys($labelMap), $excludedColumns));

                $headers = array_map(fn($column) => $labelMap[$column] ?? $column, $columns);

                return Excel::download(
                    new ExcelExport($data, $columns, $headers),
                    'Job_Movement_Export.xlsx'
                );
            } catch (Exception $e) {
                return [
                    'status'  => false,
                    'error'   => $e->getMessage(),
                    'message' => 'Something went wrong while exporting job movement',
                ];
            }
        });
    });
    
    Route::prefix('business-services')->group(function() {
        
        function getMovement(Request $request) {
            if(!$request->has('project_id') || !$request->has('service_id')) {
                return ['status' => false, 'message' => 'Insufficient parameters.'];
            }

            $user_id = 0;
            if($request->has('user_id')) $user_id = $request->input('user_id');
            $project_id = $request->input('project_id');
            $service_id = $request->input('service_id');
            $where_condition = '';
            
            if($request->has('filters')) {
                $jsonFilters = $request->input('filters');
                $filters = json_decode($jsonFilters);
                
                $where_parts = [];
                
                if (isset($filters->status_id)) {
                    if ((int)$filters->status_id === -1) {
                        $where_parts[] = 'J.wsid != 11 and J.wsid != 35';
                    } else {
                        $where_parts[] = 'J.wsid = ' . (int) $filters->status_id;
                    }
                }
                
                if (isset($filters->received_from)) {
                    // Use quotes for string filters
                    $where_parts[] = "LOWER(TRIM(C.Contactname)) = LOWER(TRIM('" . addslashes($filters->received_from) . "'))";
                }

                if (isset($filters->accountant)) {
                    // Use quotes for string filters
                    $where_parts[] = "LOWER(TRIM(U.Usename)) = LOWER(TRIM('" . addslashes($filters->accountant) . "'))";
                }

                if (isset($filters->financial_year)) {
                    // Use quotes for string filters
                    $where_parts[] = "J.FinancialYear = '" . addslashes($filters->financial_year) . "'";
                }

                if (isset($filters->received_date_range)) {
                    // Use quotes for string filters
                    $where_parts[] = "J.daterecieved between '" . addslashes($filters->received_date_range->from) . "' and '" . addslashes($filters->received_date_range->to) . "'";
                }

                if (isset($filters->commenced_date_range)) {
                    // Use quotes for string filters
                    $where_parts[] = "J.datecommence between '" . addslashes($filters->commenced_date_range->from) . "' and '" . addslashes($filters->commenced_date_range->to) . "'";
                }

                if (isset($filters->nature_of_job)) {
                    // Use quotes for string filters
                    $where_parts[] = "LOWER(TRIM(N.Naturejob)) = LOWER(TRIM('" . addslashes($filters->nature_of_job) . "'))";
                }
                
                // Add more filters in the future easily here
                // if (isset($filters->something)) $where_parts[] = "J.something = '{$filters->something}'";
                
                $where_condition = implode(' AND ', $where_parts);

            } else  {
                $where_condition = '';
            }
            
            $page = $request->input('page', 1); // default page 1
            $limit = 5000;
            $offset = ($page - 1) * $limit;

            $data = DB::connection('wm_mysql')->select('CALL SP_FetchBSjobDashboard(?, ?, ?, ?, ?, ?)', [$user_id, $project_id, $service_id, $limit, $offset, $where_condition]);
            
            $hideConfig = DB::connection('wm_mysql')->table('report_client_hide_columns')->select('pid', 'column_key')->where('report_key', 'job_status')->where('pid', $project_id)
                ->get()->groupBy('pid')
                ->map(function ($items) {
                    return $items->pluck('column_key')->toArray();
                })->toArray();
            
            if (!empty($hideConfig) && isset($hideConfig[$project_id])) {
                foreach ($data as $row) {
                    foreach ($hideConfig[$project_id] as $column) {
                        if (property_exists($row, $column)) {
                            unset($row->$column);
                        }
                    }
                }
            }
            
            return ['data' => $data, 'conditions' => $where_condition];
            // return $data;
        }

        // Movement Routes
        Route::post('get-movement', function(Request $request) {
            try {
                $results = getMovement($request);
                $data = $results['data'];
                
                return [
                    'status' => true,
                    'data' => $data,
                ];
            } catch(Exception $e) {
                return [
                    'status' => false,
                    'error' => $e->getMessage(),
                   'message' => 'Something went wrong while fetching job movment for business services'
                ];
            }
        });
        
        Route::post('export-movement', function(Request $request) {
            try {
                
                $data = getMovement($request)['data'];
                $dataArray = [
                    [
                        "GroupJobName",
                        "Jobname",
                        "Naturejob",
                        "ReceivedFrom",
                        "Accountant",
                        // "Workstatus",
                        "NewWorkStatus",
                        // "StatusId",
                        "FinancialYear",
                        "ReceivedDate",
                        "CommencedDate",
                        // "QuerySentDate",
                        // "QueryRepliesReceivedDate",
                        // "InternalReviewSentDate",
                        // "ReviewSentDate",
                        // "ReviewRepliesReceivedDate",
                        // "FinalReviewSentDate",
                        // "ClosedDate",
                        "TimeTakenTillDate",
                        // "TotalBudget",
                        // "UnderOverBudget",
                        // "Amount",
                        // "Hours",
                        // "PriorityDate",
                        // "BudgetAlertDate",
                        // "Remarks"
                    ],
                ];
            
                $headers = [
                    "GroupJobName",
                    "Job Name",
                    "Nature of Job",
                    "Received From",
                    "Accountant",
                    // "Work status",
                    "Work Status",
                    // "Status Id",
                    "Financial Year",
                    "Received Date",
                    "Commenced Date",
                    // "Query Sent Date",
                    // "Query Replies Received Date",
                    // "Internal Review Sent Date",
                    // "Review Sent Date",
                    // "Review Replies Received Date",
                    // "Final Review Sent Date",
                    // "Closed Date",
                    "Time Taken Till Date",
                    // "Total Budget",
                    // "Under Over Budget",
                    // "Amount",
                    // "Hours",
                    // "Priority Date",
                    // "Budget Alert Date",
                    // "Remarks"
                ];
            
                // Convert each object to an array and add to the data array
                foreach ($data as $item) {
                    $dataArray[] = (array) $item;
                }
                return Excel::download(new ExcelExport($data, $dataArray[0], $headers), 'Job_Movement_Export.xlsx');
                
            } catch(Exception $e) {
                return [
                    'status' => false,
                    'error' => $e->getMessage(),
                   'message' => 'Something went wrong while fetching job movment for business services'
                ];
            }
        });
        
        
        // Lodgement Routes
        Route::prefix('lodgement')->group(function () {
            Route::post('get-lodgement-by-client', function(Request $request) {
                try {
                    $year = $request->input('year');
                    $project_id = $request->input('project_id');
                    $service_id = $request->input('service_id');
                    
                    $data = collect(DB::connection('wm_mysql')->select('CALL SP_GetUpcomingJobsPercentageStats(?, ?, ?)', [$year, $project_id, $service_id]))->first();
                    
                    return ['status' => true, 'data' => $data];
                } catch(Exception $e) {
                    return ['status' => false, 'message' => 'Something went wrong when fetching lodgement data' ];
                }
            });
            
            Route::post('get-lodgement-table-by-client', function (Request $request) {
                try {
                    if(!$request->has('status_code') || !$request->has('year') || !$request->has('project_id') || !$request->has('service_id')) return ['status' => false, 'message' => 'Invalid parameters'];
                    
                    $status_code = $request->input('status_code');
                    $year = $request->input('year');
                    $project_id = $request->input('project_id');
                    $service_id = $request->input('service_id');
                    
                    $data = DB::connection('wm_mysql')->select('CALL SP_GetUpcomingJobs_GridList(?, ?, ?, ?, ?, ?)', [$status_code, $year, $project_id, $service_id, '', '']);
                    
                    return ['status' => true, 'data' => $data];
                } catch(Exception $e) {
                    return ['status' => false, 'message' => 'Something went wrong when fetching lodgement data'];
                }
            });
        });
        
        
        Route::prefix('reports')->group(function() {
            // Get all reports list
            Route::post('get-reports-list', function(Request $request) {
                try {
                    $user_id = $request->input('user_id');
                    $data = DB::connection('wm_mysql')->table('timedb.tbl_dp_report_definitions')->select('*')->get();

                    return [
                        'status' => true,
                        'data' => $data
                    ];
                } catch(Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching reports list'
                    ];
                }
            });
            
            // Get dynamic report
            Route::post('get-dynamic-report', function(Request $request) {
                try {
                    $service_id = (int)$request->input('service_id');
                    $project_id = (int)$request->input('project_id');
            
                    $report_id = 1;
                    $limit = 20;
                    $offset = 0;
            
                    // Build filters safely
                    $filters = "J.daterecieved >= '2025-01-01' AND J.serviceid={$service_id} AND J.pid={$project_id}";
            
                    // Get PDO instance from Laravel
                    $pdo = DB::connection('wm_mysql')->getPdo();
            
                    // Prepare and execute stored procedure
                    $stmt = $pdo->prepare("CALL sp_dp_get_dynamic_report(?, ?, ?, ?)");
                    $stmt->execute([$report_id, $filters, $limit, $offset]);
            
                    // First generated sql
                    $sql = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    // Then result set: actual rows
                    $stmt->nextRowset();
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
                    // Move to second result set: column names
                    $stmt->nextRowset();
                    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
                    return [
                        'status'  => true,
                        'sql'     => $sql,
                        'data'    => $data,
                        'columns' => $columns
                    ];
            
                } catch(Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching dynamic report'
                    ];
                }
            });

            function getTATReport(Request $request) {
                try {
                    $month_and_year = $request->input('month_year');
                    $service_id = $request->input('service_id');
                    $project_id = $request->input('project_id');
                    $associate_id = $request->input('associate_id', 0);
                    
                    $test = $request->has('test_mode');
                    
                    $periodType = $request->input('period_type');
                    $month = $request->input('month');
                    $from_date = $request->input('from_date') ?: null;
                    $to_date = $request->input('to_date') ?: null;
                    $year = $request->input('year') ?: null;
                    
                    if(!$test) {
                        $data = DB::connection('wm_mysql')->select('call SP_CP_GetTAT_ForJobs(?,?,?,?)', [$month_and_year, $service_id, $project_id, $associate_id]);
                    } else {
                        $data = DB::connection('wm_mysql')->select('call GetJobTAT_T1_T2_Test_clientreport(?,?,?,?,?,?,?)', [$periodType, $month, $from_date, $to_date, $year, $project_id, $service_id]);
                        $data = collect($data)->map(function($row) {
                            return collect($row)->forget(['T1', 'T2', 'TimeTakenTillDate', 'TotalBudget', 'UnderOverBudget', 'EffortVariantPercent', 'BudgetStatus']);
                        });
                    }
            
                    $hideConfig = DB::connection('wm_mysql')->table('report_client_hide_columns')->select('pid', 'column_key')->where('report_key', 'tat_report')
                        ->get()
                        ->groupBy('pid')
                        ->map(function ($items) {
                            return $items->pluck('column_key')->toArray();
                        })
                        ->toArray();
            
                    // Process each row
                    foreach ($data as $row) {
                        $clientId = $project_id; // since you passed pid as filter
            
                        if (isset($hideConfig[$clientId])) {
                            foreach ($hideConfig[$clientId] as $column) {
                                if (property_exists($row, $column)) {
                                    unset($row->$column);
                                }
                            }
                        }
                    }
            
                    return $data;
            
                } catch(Exception $e) {
                    return [];
                }
            }

            
            // function getTATReport(Request $request) {
            //     try {
            //         $month_and_year = $request->input('month_year');
            //         $service_id = $request->input('service_id');
            //         $project_id = $request->input('project_id');
            //         $associate_id = 0;
            //         $hideConfig = [
            //             101 => ['Total Budget Time', 'Under Over Budget', 'Effort_Variant_Percent', 'Budget Status'],
            //             205 => ['Total Budget Time', 'Budget Status'],
            //         ];
                    
            //         if($request->has('associate_id')) $associate_id = $request->input('associate_id');
                    
            //         $data = DB::connection('wm_mysql')->select('call SP_CP_GetTAT_ForJobs(?,?,?,?)', [$month_and_year, $service_id, $project_id, $associate_id]);
                    
            //         return $data;
            //     } catch(Exception $e) {
            //         return [];
            //     }
            // }

            // Get Turn around time reports
            Route::post('get-tat-reports', function(Request $request) {
                try {
                    $data = getTATReport($request);
                    
                    return [
                        'status' => true,
                        'data' => $data
                    ];
                } catch(Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching reports list'
                    ];
                }
            });
            
            // Download TAT Report
            // Route::post('export-tat-report', function(Request $request) {
            //     try {
                    
            //         $data = getTATReport($request);
            //         $dataArray = [
            //             [
            //                 "Client",
            //                 "Job",
            //                 "Vertical",
            //                 "Associate_Name",
            //                 "Date_Received",
            //                 "Date_Completed",
            //                 "Completed_Month",
            //                 "Total_TAT",
            //                 "TAT-Net_Working_Days",
            //                 "TAT-Client",
            //                 "TAT-Internal",
            //                 "Time_Taken_Till_Date",
            //                 "Total_Budget_Time",
            //                 "Under_Over_Budget",
            //                 "Effort_Variant_Percent",
            //                 "Budget_Status",
            //                 "DDD",
            //                 "Job_Efforts",
            //                 "PDRE",
            //                 "PDRE_Time",
            //                 "COPQ",
            //                 "COQ"
            //             ],
            //         ];
                
            //         $headers = [
            //             "Client",
            //             "Job",
            //             "Vertical",
            //             "Associate_Name",
            //             "Date_Received",
            //             "Date_Completed",
            //             "Completed_Month",
            //             "Total_TAT",
            //             "TAT-Net_Working_Days",
            //             "TAT-Client",
            //             "TAT-Internal",
            //             "Time_Taken_Till_Date",
            //             "Total_Budget_Time",
            //             "Under_Over_Budget",
            //             "Effort_Variant_Percent",
            //             "Budget_Status",
            //             "DDD",
            //             "Job_Efforts",
            //             "PDRE",
            //             "PDRE_Time",
            //             "COPQ",
            //             "COQ"
            //         ];
                
            //         // Convert each object to an array and add to the data array
            //         foreach ($data as $item) {
            //             $dataArray[] = (array) $item;
            //         }
                    
            //         $report_name = 'TAT Report ' . Carbon::now()->format('d-m-Y') . '.xlsx';
                    
            //         return Excel::download(new ExcelExport($data, $dataArray[0], $headers), $report_name);
                    
            //     } catch(Exception $e) {
            //         return [
            //             'status' => false,
            //             'error' => $e->getMessage(),
            //           'message' => 'Something went wrong while fetching job movment for business services'
            //         ];
            //     }
            // });
            
            
            Route::post('export-tat-report', function(Request $request) {
                try {
            
                    $data = getTATReport($request);
            
                    // get hide config from DB
                    $hideConfig = DB::connection('wm_mysql')
                        ->table('report_client_hide_columns')
                        ->select('client_id', 'column_key')
                        ->get()
                        ->groupBy('client_id')
                        ->map(function ($items) {
                            return $items->pluck('column_key')->toArray();
                        })
                        ->toArray();
            
                    $columnMap = [
                        'total_budget' => 'Total_Budget_Time',
                        'under_over_budget' => 'Under_Over_Budget',
                        'effort_variance_percent' => 'Effort_Variant_Percent',
                        'budget_status' => 'Budget_Status',
                    ];
            
                    $clientId = $request->input('project_id');
            
                    $headers = [
                        "Client","Job","Vertical","Associate_Name","Date_Received","Date_Completed",
                        "Completed_Month","Total_TAT","TAT-Net_Working_Days","TAT-Client","TAT-Internal",
                        "Time_Taken_Till_Date","Total_Budget_Time","Under_Over_Budget",
                        "Effort_Variant_Percent","Budget_Status","DDD","Job_Efforts",
                        "PDRE","PDRE_Time","COPQ","COQ"
                    ];
            
                    // ðŸ”¹ remove hidden headers
                    if (isset($hideConfig[$clientId])) {
                        foreach ($hideConfig[$clientId] as $key) {
                            if (isset($columnMap[$key])) {
                                $colName = $columnMap[$key];
                                $headers = array_values(array_filter($headers, function($h) use ($colName) {
                                    return $h !== $colName;
                                }));
                            }
                        }
                    }
            
                    $dataArray = [$headers];
            
                    foreach ($data as $item) {
            
                        $row = (array) $item;
            
                        if (isset($hideConfig[$clientId])) {
                            foreach ($hideConfig[$clientId] as $key) {
                                if (isset($columnMap[$key])) {
                                    $colName = $columnMap[$key];
                                    unset($row[$colName]);
                                }
                            }
                        }
            
                        $filteredRow = [];
                        foreach ($headers as $h) {
                            $filteredRow[$h] = $row[$h] ?? null;
                        }
            
                        $dataArray[] = $filteredRow;
                    }
            
                    $report_name = 'TAT Report ' . Carbon::now()->format('d-m-Y') . '.xlsx';
            
                    return Excel::download(new ExcelExport($data, $headers, $headers), $report_name);
            
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching job movement for business services'
                    ];
                }
            });
            
        });
        
        // Dashboard Routes
        Route::prefix('dashboard')->group(function() {
            
            // Client Current Job Status
            Route::post('client-current-job-status', function(Request $request) {
                try {
                    if($request->has('id')) {
                        $project_id = $request->input('id');
                        $rows = DB::connection('wm_mysql')->select('CALL sp_contactnamewisecount(?)', [$project_id]);
                        return [
                            'status' => true, 'data' => $rows
                        ];
                    } else return ['status' => false, 'message' => 'ID is missing'];
                } catch(Exception $e) {
                    return [
                        'status' => false, 'message' => 'Something went wrong while generating client current job status'
                    ];
                }
            });

            // Internal Current Job Status
            Route::post('internal-current-job-status', function(Request $request) {
                try {
                    if($request->has('id')) {
                        $project_id = $request->input('id');
                        $rows = DB::connection('wm_mysql')->select('CALL sp_Accountantnamewisecount(?)', [$project_id]);
                        return [
                            'status' => true, 'data' => $rows
                        ];
                    }
                } catch(Exception $e) {
                    return [
                        'status' => false, 'message' => 'Something went wrong while generating internal current job status'
                    ];
                }
            });

            //Job names with status
            Route::post('job-names-with-status', function(Request $request) {
                try {
                    if($request->has('id')) {
                        $project_id = $request->input('id');
                        $rows = DB::connection('wm_mysql')->select('CALL sp_Detailedreportofjobnamewithstatus(?)', [$project_id]);
                        return [
                            'status' => true, 'data' => $rows
                        ];
                    }
                } catch(Exception $e) {
                    return [
                        'status' => false, 'message' => 'Something went wrong while generating job names with status'
                    ];
                }
            });

            //Internal Review Jobs
            Route::post('internal-review-jobs', function(Request $request) {
                try {
                    if($request->has('id')) {
                        $project_id = $request->input('id');
                        $rows = DB::connection('wm_mysql')->select('CALL sp_Detailedreportofinternalreview(?)', [$project_id]);
                        return [
                            'status' => true, 'data' => $rows
                        ];
                    }
                } catch(Exception $e) {
                    return [
                        'status' => false, 'message' => 'Something went wrong while generating job names with status'
                    ];
                }
            });

            //Total Job Status Statistics
            Route::post('total-job-status-count', function(Request $request) {
                try {
                    if($request->has('id') && $request->has('service_id') && $request->has('user_id')) {
                        $project_id = $request->input('id');
                        $service_id = $request->input('service_id');
                        $user_id = $request->input('user_id');
                        $where = '';
                        if($request->has('conditions')) $request->input('conditions');
                        
                        $rows = DB::connection('wm_mysql')->select('CALL sp_totaljobstatuscountbyclientwise(?, ?, ?, ?)', [$project_id, $service_id, $user_id, $where]);
                        return [
                            'status' => true, 'data' => $rows
                        ];
                    } else {
                        return [
                            'status' => false, 'message' => 'Insufficient parameters'
                        ];
                    }
                } catch(Exception $e) {
                    return [
                        'status' => false, 'message' => 'Something went wrong while generating total job status'
                    ];
                }
            });



            // Get day wise job count comparision
            // CALL sp_datewisejobstatuscountcomparison2(278, '2025-09-01', '2025-09-08');
            Route::post('get-day-wise-job-comparision', function(Request $request) {
                try {
                    $project_id = $request->input('id');
                    // $start_date = $request->input('start_date');
                    // $end_date = $request->input('end_date');
                    $end_date = now()->format('Y-m-d');
                    $start_date = now()->subDays(7)->format('Y-m-d');

                    $data = DB::connection('wm_mysql')->select('CALL sp_datewisejobstatuscountcomparison2(?, ?, ?)', [$project_id, $start_date, $end_date]);
                    return ['status' => true, 'data' => $data, 'start_date' => $start_date, 'end_date' => $end_date, 'id' => $project_id];
                } catch (Exception $e) {
                    return ['status' => false, 'data' => 'Something went wrong while getting job wise comparision'];
                }
            });
        });

        // Job Routes
        Route::prefix('job')->group(function() {

            // Get Job Status History
            Route::post('get-job-status-history', function(Request $request) {
                try {
                    $job_id = $request->input('job_id');
                    
                    // Call Stored Procedure to get job history 
                    $details = DB::connection('wm_mysql')->select('CALL FilterSequentialStatusChanges(?)', [$job_id]);
                    
                    // Convert simple array to laravel collections for mapping
                    $details = collect($details);
                    
                    // Calculate duration in days (ignoring hours/minutes/seconds)
                    $details = $details->map(function ($item, $index) use ($details) {
                        $currentDate = Carbon::parse($item->LastModdate)->startOfDay();
                        $nextDate = isset($details[$index + 1])
                        ? Carbon::parse($details[$index + 1]->LastModdate)->startOfDay()
                        : null;

                        $item->duration = $nextDate
                        ? $currentDate->diffInDays($nextDate)
                        : 0; // last record duration = 0

                        return $item;
                    });

                    $details = $details->sortBy('StatusChangingDate')->values();

                    return ['status' => true, 'data' => $details];
                } catch (Exception $e) {
                    return ['status' => false, 'data' => 'Something went wrong while job history'];
                }

            });

            // Get Job Information
            Route::post('get-job-information', function(Request $request) {
                try {
                    $job_id = $request->input('job_id');
                    $data = DB::connection('wm_mysql')->select('CALL SP_FetchBSJobInformation(?)', [$job_id]);
                    return ['status' => true, 'data' => $data[0]];
                } catch (Exception $e) {
                    return ['status' => false, 'data' => 'Something went wrong while job information'];
                }

            });
        });

    });
});
