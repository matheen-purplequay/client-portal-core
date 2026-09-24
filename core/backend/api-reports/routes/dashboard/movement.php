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

        // -------------------------------------------------------------------------
        // Route: Manager Status — a cheap check of whether the current contact
        // manages more than one secondary contact (see get-partner-wise-jobs
        // below for the convention). Called on page load just to decide
        // whether to show the "Manager View" toggle at all, without paying
        // for the full jobmonitor aggregation until the toggle is actually
        // clicked.
        // -------------------------------------------------------------------------

        Route::post('get-manager-status', function(Request $request) {
            try {
                $user_id = (int) $request->input('user_id', 0);

                $mapping = DB::connection('wm_mysql')->table('tbl_clientcontactmaping')
                    ->where('PrimaryCid', $user_id)
                    ->where('IsActive', 1)
                    ->value('SecondaryCid');

                $secondaryCids = array_values(array_unique(array_filter(
                    array_map('intval', explode(',', (string) $mapping)),
                    fn($cid) => $cid > 0
                )));

                return [
                    'status' => true,
                    'data' => ['is_manager' => count($secondaryCids) > 1]
                ];
            } catch (Exception $e) {
                return [
                    'status'  => false,
                    'error'   => $e->getMessage(),
                    'message' => 'Something went wrong while checking manager status',
                ];
            }
        });

        // -------------------------------------------------------------------------
        // Route: Partner-Wise Jobs — a per-status breakdown across the contacts
        // (partners) that a manager-level contact oversees, for the "Manager
        // View" toggle on the Job Status page. Fetched lazily, only once the
        // toggle is actually clicked (see get-manager-status above for the
        // cheap on-load check that decides whether to show the toggle).
        //
        // CALL SP_clientportalPartnerWiseJobs(__pid, __Vertical, __Cid);
        // Emits THREE result sets: (1) PartnerCount/IsManager, (2) partner
        // id+name, (3) per-partner per-status counts. Wsid->key/label
        // mapping and the grid pivot stay here in PHP since that's just
        // display shaping, not query logic.
        // -------------------------------------------------------------------------

        Route::post('get-partner-wise-jobs', function(Request $request) {
            try {
                $project_id = (int) $request->input('project_id');
                $vertical   = (int) $request->input('service_id', 0);
                $user_id    = (int) $request->input('user_id', 0);

                $statusMap = [
                    1  => ['key' => 'jobInYetToStart', 'label' => 'Yet To Start'],
                    4  => ['key' => 'wipProcessing', 'label' => 'WIP Processing'],
                    5  => ['key' => 'sentForQueries', 'label' => 'Sent for Queries'],
                    30 => ['key' => 'queryRepliesReceivedYetToAttend', 'label' => 'Query Replies Received/Yet To Attend'],
                    24 => ['key' => 'wipQueryReplies', 'label' => 'WIP Query Replies'],
                    28 => ['key' => 'internalReview', 'label' => 'Internal Review'],
                    31 => ['key' => 'wipInternalReviewReplies', 'label' => 'WIP Internal Review Replies'],
                    32 => ['key' => 'sentForReview', 'label' => 'Sent for Review'],
                    33 => ['key' => 'reviewRepliesReceivedYetToAttend', 'label' => 'Review Replies Received/Yet To Attend'],
                    25 => ['key' => 'wipReviewReplies', 'label' => 'WIP Review Replies'],
                    6  => ['key' => 'sentForFinalReview', 'label' => 'Sent for Final Review'],
                    34 => ['key' => 'onHold', 'label' => 'On Hold'],
                ];

                $pdo  = DB::connection('wm_mysql')->getPdo();
                $stmt = $pdo->prepare('CALL SP_clientportalPartnerWiseJobs(?, ?, ?)');
                $stmt->execute([$project_id, $vertical, $user_id]);

                $managerInfo = $stmt->fetch(PDO::FETCH_OBJ);
                $stmt->nextRowset();
                $partnerRows = $stmt->fetchAll(PDO::FETCH_OBJ);
                $stmt->nextRowset();
                $countRows = $stmt->fetchAll(PDO::FETCH_OBJ);
                $stmt->closeCursor();

                $isManager = $managerInfo ? (bool) $managerInfo->IsManager : false;

                if (empty($partnerRows)) {
                    return [
                        'status' => true,
                        'data' => ['is_manager' => false, 'partners' => [], 'rows' => [], 'totals' => []]
                    ];
                }

                $partners = array_map(fn($p) => ['cid' => (int) $p->Cid, 'name' => $p->Name ?? ('Contact ' . $p->Cid)], $partnerRows);
                $partnerCids = array_column($partners, 'cid');

                $grid = [];
                foreach ($statusMap as $wsid => $info) {
                    $grid[$info['key']] = array_fill_keys($partnerCids, 0);
                }
                foreach ($countRows as $r) {
                    if (isset($statusMap[$r->Wsid])) {
                        $grid[$statusMap[$r->Wsid]['key']][(int) $r->PartnerCid] = (int) $r->Cnt;
                    }
                }

                $totals = array_fill_keys($partnerCids, 0);
                $totals['all'] = 0;
                $resultRows = [];
                foreach ($statusMap as $wsid => $info) {
                    $counts = $grid[$info['key']];
                    $rowTotal = array_sum($counts);
                    foreach ($partnerCids as $cid) {
                        $totals[$cid] += $counts[$cid];
                    }
                    $totals['all'] += $rowTotal;
                    $resultRows[] = [
                        'key'    => $info['key'],
                        'label'  => $info['label'],
                        'wsid'   => $wsid,
                        'counts' => $counts,
                        'total'  => $rowTotal,
                    ];
                }

                return [
                    'status' => true,
                    'data' => [
                        'is_manager' => $isManager,
                        'partners'   => $partners,
                        'rows'       => $resultRows,
                        'totals'     => $totals,
                    ]
                ];
            } catch (Exception $e) {
                return [
                    'status'  => false,
                    'error'   => $e->getMessage(),
                    'message' => 'Something went wrong while fetching partner-wise jobs',
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

            // Associate Productivity - Month on Month
            // CALL sp_FetchProductivityComparisonReport('08-2026', 54, 4);
            // Returns one row per associate for the given month, with each
            // metric's current-month value alongside its own prev_* (previous
            // month) counterpart already joined in by the proc — no second
            // call needed to build the month-over-month comparison.
            function getProductivityComparisonReport(Request $request) {
                $month_year = $request->input('month_year') ?: Carbon::now()->format('m-Y');
                $project_id = (int) $request->input('project_id');
                $service_id = (int) $request->input('service_id', 0); // 0 = all teams, per the proc's own contract

                return DB::connection('wm_mysql')->select(
                    'CALL sp_FetchProductivityComparisonReport(?, ?, ?)',
                    [$month_year, $project_id, $service_id]
                );
            }

            Route::post('get-productivity-report', function(Request $request) {
                try {
                    $data = getProductivityComparisonReport($request);

                    return [
                        'status' => true,
                        'data' => $data
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the productivity report'
                    ];
                }
            });

            // Business verticals for the productivity report's filter dropdown.
            // coemaster.Code is what sp_FetchProductivityComparisonReport takes as __ServiceId.
            Route::post('get-productivity-verticals', function(Request $request) {
                try {
                    $verticals = DB::connection('wm_mysql')
                        ->table('coemaster')
                        ->select('Code as id', 'Name as title')
                        ->where('IsActive', 1)
                        ->where('IsBusinessVertical', 1)
                        ->orderBy('Code')
                        ->get();

                    return [
                        'status' => true,
                        'data' => $verticals
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching verticals'
                    ];
                }
            });

            Route::post('export-productivity-report', function(Request $request) {
                try {
                    $data = getProductivityComparisonReport($request);
                    $month_year = $request->input('month_year') ?: Carbon::now()->format('m-Y');

                    $headers = [
                        "Associate Name",
                        "Total Jobs Worked", "Total Hours", "Productive Hours",
                        "Prev Total Jobs Worked", "Prev Total Hours", "Prev Productive Hours",
                        "Job Trend", "Time Trend",
                    ];

                    $columns = [
                        'name',
                        'ReceivedJobs', 'total_hours', 'total_hours_without_overheads',
                        'Prev_ReceivedJobs', 'prev_total_hours', 'prev_total_hours_without_overheads',
                        'job_trend', 'time_trend',
                    ];

                    $dataArray = array_map(function ($row) {
                        $row = (array) $row;
                        $row['job_trend'] = (int) $row['ReceivedJobs'] - (int) $row['Prev_ReceivedJobs'];
                        $row['time_trend'] = round((float) $row['total_hours'] - (float) $row['prev_total_hours'], 2);
                        return (object) $row;
                    }, $data);

                    $report_name = 'Associate Productivity ' . $month_year . '.xlsx';

                    return Excel::download(new ExcelExport($dataArray, $columns, $headers), $report_name);
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while exporting the productivity report'
                    ];
                }
            });

            // Associate Time Utilisation - Current Month
            // CALL sp_FetchAssociateTime_Utilisation_connectreport('08-2026', vertical, clientid);
            // The proc pivots associate names into columns dynamically (one column
            // per active associate for that month/vertical/client), so the row shape
            // is data-dependent — PDO/Laravel just passes whatever columns MySQL
            // returns straight through as object properties.
            // Note: the proc only returns Location/Metric/<associate columns>/Total —
            // no jobs-worked count or percentage figures exist in this data source.
            Route::post('get-associate-time-utilisation', function(Request $request) {
                try {
                    $month_year = $request->input('month_year') ?: Carbon::now()->format('m-Y');
                    $project_id = (int) $request->input('project_id');
                    $vertical = (string) $request->input('service_id', '');

                    $data = DB::connection('wm_mysql')->select(
                        'CALL sp_FetchAssociateTime_Utilisation_connectreport(?, ?, ?)',
                        [$month_year, $vertical, $project_id]
                    );

                    // The proc returns a single { Message: 'No Data Found' } row when
                    // there's nothing to pivot, instead of an empty result set.
                    if (count($data) === 1 && isset($data[0]->Message)) {
                        $data = [];
                    }

                    return [
                        'status' => true,
                        'data' => $data
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching associate time utilisation'
                    ];
                }
            });

            // Turnaround Report - Jobs by Elapsed-Time Bucket
            // CALL SP_clientportalTurnaroundBucketreport / ...ReportOpen(__pid, __Vertical, __Cid);
            // `status` (open|closed, default closed) picks which proc runs —
            // closed jobs measure daterecieved -> datecompleted, open jobs
            // measure daterecieved -> today (still in progress).
            // The proc returns a single row: TotalJobs plus one count per
            // elapsed-day bucket, for the given project, optionally narrowed
            // by vertical/client (0 = all).
            Route::post('get-turnaround-report', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $vertical = (int) $request->input('service_id', 0);
                    $client_id = (int) $request->input('client_id', 0);
                    $isOpen = $request->input('status', 'closed') === 'open';
                    $procedure = $isOpen ? 'SP_clientportalTurnaroundBucketreportOpen' : 'SP_clientportalTurnaroundBucketreport';

                    $data = DB::connection('wm_mysql')->select(
                        "CALL {$procedure}(?, ?, ?)",
                        [$project_id, $vertical, $client_id]
                    );

                    $row = count($data) > 0 ? $data[0] : null;

                    return [
                        'status' => true,
                        'data' => [
                            'total_jobs_closed' => $row ? (int) ($isOpen ? $row->TotalJobsOpen : $row->TotalJobsClosed) : 0,
                            'bucket_0_5' => $row ? (int) $row->Bucket_0_5 : 0,
                            'bucket_6_10' => $row ? (int) $row->Bucket_6_10 : 0,
                            'bucket_11_20' => $row ? (int) $row->Bucket_11_20 : 0,
                            'bucket_21_30' => $row ? (int) $row->Bucket_21_30 : 0,
                            'bucket_31_60' => $row ? (int) $row->Bucket_31_60 : 0,
                            'bucket_above_60' => $row ? (int) $row->Bucket_Above_60 : 0,
                            'avg_working_days' => $row ? round((float) $row->AvgWorkingDays, 1) : 0
                        ]
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the turnaround report'
                    ];
                }
            });

            // Turnaround Report - All Jobs (open or closed), split Carisma vs Client time
            // CALL SP_clientportalTurnaroundJobsList / ...ListOpen(__pid, __Vertical, __Cid);
            // One row per job with TurnaroundDays split into
            // TurnaroundInCarisma/TurnaroundInClient — same scope as
            // get-turnaround-report's `status` param.
            Route::post('get-turnaround-jobs-list', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $vertical = (int) $request->input('service_id', 0);
                    $client_id = (int) $request->input('client_id', 0);
                    $isOpen = $request->input('status', 'closed') === 'open';
                    $procedure = $isOpen ? 'SP_clientportalTurnaroundJobsListOpen' : 'SP_clientportalTurnaroundJobsList';

                    $data = DB::connection('wm_mysql')->select(
                        "CALL {$procedure}(?, ?, ?)",
                        [$project_id, $vertical, $client_id]
                    );

                    $rows = array_map(function ($row) {
                        return [
                            'received_from' => $row->ReceivedFrom,
                            'job_name' => $row->JobName,
                            'nature_of_job' => $row->NatureOfJob,
                            'accountant' => $row->Accountant,
                            'job_status' => $row->JobStatus,
                            'turnaround_days' => (float) $row->TurnaroundDays,
                            'turnaround_in_carisma' => (float) $row->TurnaroundInCarisma,
                            'turnaround_in_client' => (float) $row->TurnaroundInClient,
                            // 'HH:MM' strings — the proc formats these directly so the
                            // frontend doesn't need to convert decimal hours itself.
                            'budget_time' => $row->BudgetTime,
                            'time_taken' => $row->TimeTaken
                        ];
                    }, $data);

                    return [
                        'status' => true,
                        'data' => $rows
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the turnaround jobs list'
                    ];
                }
            });

            // Budget Overview - Open Jobs (budget time vs. time booked)
            // CALL SP_clientportalBudgetOverview(__pid, __Vertical, __Cid);
            // One row per open job (workstatus <> 'Closed'), with BudgetTime and
            // TimeTaken as 'HH:MM:SS' strings — Accountant is intentionally not
            // selected by the proc. Variance/summary counts are derived here
            // rather than in SQL, since they're just simple time-string diffs.
            function getBudgetOverviewReport(Request $request) {
                $project_id = (int) $request->input('project_id');
                $vertical = (int) $request->input('service_id', 0);
                $client_id = (int) $request->input('client_id', 0);

                return DB::connection('wm_mysql')->select(
                    'CALL SP_clientportalBudgetOverview(?, ?, ?)',
                    [$project_id, $vertical, $client_id]
                );
            }

            function timeStringToSeconds($time) {
                if (!$time) return 0;
                $parts = array_map('intval', explode(':', $time));
                [$h, $m, $s] = array_pad($parts, 3, 0);
                return ($h * 3600) + ($m * 60) + $s;
            }

            function mapBudgetOverviewRows($data) {
                return array_map(function ($row) {
                    $budgetSeconds = timeStringToSeconds($row->BudgetTime);
                    $timeTakenSeconds = timeStringToSeconds($row->TimeTaken);

                    return [
                        'received_from' => $row->ReceivedFrom,
                        'job_name' => $row->JobName,
                        'nature_of_job' => $row->NatureOfJob,
                        'accountant' => $row->Accountant,
                        'job_status' => $row->JobStatus,
                        'budget_seconds' => $budgetSeconds,
                        'time_taken_seconds' => $timeTakenSeconds,
                        'variance_seconds' => $timeTakenSeconds - $budgetSeconds
                    ];
                }, $data);
            }

            Route::post('get-budget-overview', function(Request $request) {
                try {
                    $data = getBudgetOverviewReport($request);

                    return [
                        'status' => true,
                        'data' => mapBudgetOverviewRows($data)
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the budget overview'
                    ];
                }
            });

            // Budget Overview - Under/Over Budget counts for the dashboard home widget
            // CALL SP_clientportalBudgetOverviewCount(__pid, __Vertical, __Cid);
            // Single row: UnderBudgetCount and OverBudgetCount, same open-jobs
            // scope and budget-vs-booked comparison as SP_clientportalBudgetOverview.
            Route::post('get-budget-overview-count', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $vertical = (int) $request->input('service_id', 0);
                    $client_id = (int) $request->input('client_id', 0);

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalBudgetOverviewCount(?, ?, ?)',
                        [$project_id, $vertical, $client_id]
                    );

                    $row = count($data) > 0 ? $data[0] : null;

                    return [
                        'status' => true,
                        'data' => [
                            'under_budget' => $row ? (int) $row->UnderBudgetCount : 0,
                            'over_budget' => $row ? (int) $row->OverBudgetCount : 0
                        ]
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the budget overview count'
                    ];
                }
            });

            Route::post('export-budget-overview', function(Request $request) {
                try {
                    $rows = mapBudgetOverviewRows(getBudgetOverviewReport($request));

                    $formatSeconds = function ($seconds) {
                        $sign = $seconds < 0 ? '-' : '';
                        $seconds = abs($seconds);
                        return sprintf('%s%02d:%02d', $sign, intdiv($seconds, 3600), intdiv($seconds % 3600, 60));
                    };

                    $dataArray = array_map(function ($row) use ($formatSeconds) {
                        return (object) [
                            'received_from' => $row['received_from'],
                            'job_name' => $row['job_name'],
                            'nature_of_job' => $row['nature_of_job'],
                            'accountant' => $row['accountant'],
                            'job_status' => $row['job_status'],
                            'budget_time' => $formatSeconds($row['budget_seconds']),
                            'time_taken' => $formatSeconds($row['time_taken_seconds']),
                            'variance' => $formatSeconds($row['variance_seconds'])
                        ];
                    }, $rows);

                    $headers = ['Received From', 'Job Name', 'Nature of Job', 'Accountant', 'Job Status', 'Budget Time', 'Time Taken', 'Variance'];
                    $columns = ['received_from', 'job_name', 'nature_of_job', 'accountant', 'job_status', 'budget_time', 'time_taken', 'variance'];

                    return Excel::download(new ExcelExport($dataArray, $columns, $headers), 'Budget Overview.xlsx');
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while exporting the budget overview'
                    ];
                }
            });

            // Closed Jobs - Feedback
            // CALL SP_clientportalClosedJobsFeedback(__pid, __Vertical, __Cid);
            // One row per closed job (wsid = 11, same convention as
            // SP_clientportalTurnaroundreport). JobStatus isn't returned by the
            // proc — it's always 'Closed' here by definition of the filter.
            Route::post('get-closed-jobs-feedback', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $vertical = (int) $request->input('service_id', 0);
                    $client_id = (int) $request->input('client_id', 0);

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalClosedJobsFeedback(?, ?, ?)',
                        [$project_id, $vertical, $client_id]
                    );

                    $rows = array_map(function ($row) {
                        return [
                            'job_id' => $row->Aid,
                            'received_from' => $row->ReceivedFrom,
                            'job_name' => $row->JobName,
                            'nature_of_job' => $row->NatureOfJob,
                            'survey_submitted' => (int) $row->SurveyCount > 0,
                            'budget_time' => $row->BudgetTime,
                            'time_taken' => $row->TimeTaken,
                            'turnaround_days' => (int) $row->TurnaroundDays
                        ];
                    }, $data);

                    return [
                        'status' => true,
                        'data' => $rows
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching closed jobs'
                    ];
                }
            });

            // MOM - Meetings This Month count (for the dashboard home summary card)
            // CALL SP_clientportalMOMCountThisMonth(__pid);
            Route::post('get-mom-count', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalMOMCountThisMonth(?)',
                        [$project_id]
                    );
                    $row = count($data) > 0 ? $data[0] : null;

                    return [
                        'status' => true,
                        'data' => [
                            'meetings_this_month' => $row ? (int) $row->MeetingsThisMonth : 0
                        ]
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the MOM count'
                    ];
                }
            });

            // Closed Jobs - Feedback counts (for the dashboard home summary card)
            // CALL SP_clientportalClosedJobsFeedbackCount(__pid, __Vertical, __Cid);
            Route::post('get-closed-jobs-feedback-count', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $vertical = (int) $request->input('service_id', 0);
                    $client_id = (int) $request->input('client_id', 0);

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalClosedJobsFeedbackCount(?, ?, ?)',
                        [$project_id, $vertical, $client_id]
                    );
                    $row = count($data) > 0 ? $data[0] : null;

                    return [
                        'status' => true,
                        'data' => [
                            'closed_jobs' => $row ? (int) $row->ClosedJobs : 0,
                            'pending_feedback' => $row ? (int) $row->PendingFeedback : 0
                        ]
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the closed jobs feedback count'
                    ];
                }
            });

            // Closed Jobs - Feedback survey (submit / load)
            // CALL SP_clientportalSaveJobSurvey(...), SP_clientportalGetJobSurvey(__aid, __userid)
            // One survey per (job, user); saving again updates it.
            Route::post('save-job-survey', function(Request $request) {
                try {
                    $ratings = ['Extremely satisfied', 'Very satisfied', 'Somewhat satisfied', 'Dissatisfied', 'Very dissatisfied'];
                    $job_id = (int) $request->input('job_id');
                    $user_id = (int) $request->input('user_id');
                    $overall = (string) $request->input('overall_satisfaction');
                    $responsiveness = (string) $request->input('responsiveness');

                    if ($job_id <= 0 || $user_id <= 0
                        || !in_array($overall, $ratings, true) || !in_array($responsiveness, $ratings, true)) {
                        return ['status' => false, 'message' => 'Please answer questions 1 and 3 before submitting.'];
                    }

                    $text = function ($key) use ($request) {
                        return mb_substr(trim((string) $request->input($key, '')), 0, 4000);
                    };

                    DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalSaveJobSurvey(?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            $job_id,
                            (int) $request->input('project_id'),
                            $user_id,
                            $overall,
                            $text('overall_insights'),
                            $responsiveness,
                            $text('responsiveness_insights'),
                            $text('improvements')
                        ]
                    );

                    return ['status' => true, 'message' => 'Feedback submitted'];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while submitting the feedback'
                    ];
                }
            });

            Route::post('get-job-survey', function(Request $request) {
                try {
                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalGetJobSurvey(?, ?)',
                        [(int) $request->input('job_id'), (int) $request->input('user_id')]
                    );
                    $row = count($data) > 0 ? $data[0] : null;

                    return [
                        'status' => true,
                        'data' => $row ? [
                            'overall_satisfaction' => $row->OverallSatisfaction,
                            'overall_insights' => $row->OverallInsights,
                            'responsiveness' => $row->Responsiveness,
                            'responsiveness_insights' => $row->ResponsivenessInsights,
                            'improvements' => $row->Improvements
                        ] : null
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the feedback'
                    ];
                }
            });

            // Movement - Job Status Changes
            // CALL SP_clientportalMovementReport(__pid, __Vertical, __Cid, __FromDate, __ToDate);
            // One row per status-change log entry. NewWsid is bucketed into the
            // 5 summary categories here (New Jobs Received=1, Sent for
            // Queries=5, Sent for Review=6, Closed=11, else=Other Status
            // Changed) — that mapping is application logic, not part of the
            // proc, since it's just a client-side categorization of NewWsid.
            function movementPeriodToDateRange(Request $request) {
                $period = $request->input('period', '7d');

                if ($period === 'custom') {
                    $from = $request->input('from_date') ?: Carbon::now()->subDays(6)->format('Y-m-d');
                    $to = $request->input('to_date') ?: Carbon::now()->format('Y-m-d');
                    return [$from, $to];
                }

                $days = ['7d' => 6, '14d' => 13, '1m' => 29][$period] ?? 6;
                return [Carbon::now()->subDays($days)->format('Y-m-d'), Carbon::now()->format('Y-m-d')];
            }

            function movementCategory($newWsid) {
                $newWsid = (int) $newWsid;
                if ($newWsid === 1) return ['key' => 'new', 'label' => 'New Jobs Received', 'badge' => 'New Job'];
                if ($newWsid === 5) return ['key' => 'queries', 'label' => 'Sent for Queries', 'badge' => 'Sent for Queries'];
                if ($newWsid === 6) return ['key' => 'review', 'label' => 'Sent for Review', 'badge' => 'Sent for Review'];
                if ($newWsid === 11) return ['key' => 'closed', 'label' => 'Closed', 'badge' => 'Closed'];
                return ['key' => 'other', 'label' => 'Other Status Changed', 'badge' => 'Status Changed'];
            }

            function getMovementReport(Request $request) {
                $project_id = (int) $request->input('project_id');
                $vertical = (int) $request->input('service_id', 0);
                $client_id = (int) $request->input('client_id', 0);
                [$from_date, $to_date] = movementPeriodToDateRange($request);

                $data = DB::connection('wm_mysql')->select(
                    'CALL SP_clientportalMovementReport(?, ?, ?, ?, ?)',
                    [$project_id, $vertical, $client_id, $from_date, $to_date]
                );

                return [$data, $from_date, $to_date];
            }

            Route::post('get-movement-report', function(Request $request) {
                try {
                    [$data, $from_date, $to_date] = getMovementReport($request);

                    $rows = array_map(function ($row) {
                        $category = movementCategory($row->NewWsid);
                        // For the catch-all "other" bucket there's no single fixed badge —
                        // show the job's actual new status instead of a generic label, to
                        // match the per-status cards on the page.
                        $badge = $category['key'] === 'other' ? ($row->ToStatus ?: $category['badge']) : $category['badge'];
                        return [
                            'received_from' => $row->ReceivedFrom,
                            'job_name' => $row->JobName,
                            'nature_of_job' => $row->NatureOfJob,
                            'from_status' => $row->FromStatus,
                            'to_status' => $row->ToStatus,
                            'date' => $row->MovementDate,
                            'category' => $category['key'],
                            'category_label' => $category['label'],
                            'movement_badge' => $badge
                        ];
                    }, $data);

                    return [
                        'status' => true,
                        'data' => $rows,
                        'from_date' => $from_date,
                        'to_date' => $to_date
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the movement report'
                    ];
                }
            });

            Route::post('export-movement-report', function(Request $request) {
                try {
                    [$data] = getMovementReport($request);

                    $dataArray = array_map(function ($row) {
                        $category = movementCategory($row->NewWsid);
                        $badge = $category['key'] === 'other' ? ($row->ToStatus ?: $category['badge']) : $category['badge'];
                        return (object) [
                            'received_from' => $row->ReceivedFrom,
                            'job_name' => $row->JobName,
                            'nature_of_job' => $row->NatureOfJob,
                            'movement' => $badge,
                            'from_status' => $row->FromStatus,
                            'to_status' => $row->ToStatus,
                            'date' => $row->MovementDate
                        ];
                    }, $data);

                    $headers = ['Received From', 'Job Name', 'Nature of Job', 'Movement', 'From Status', 'To Status', 'Date'];
                    $columns = ['received_from', 'job_name', 'nature_of_job', 'movement', 'from_status', 'to_status', 'date'];

                    return Excel::download(new ExcelExport($dataArray, $columns, $headers), 'Movement Report.xlsx');
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while exporting the movement report'
                    ];
                }
            });

            // Movement Summary - New Jobs/All Movement counts for the dashboard home widget
            // CALL SP_clientportalMovementSummaryCount(__pid, __Vertical, __Cid, __FromDate, __ToDate);
            // Single row: NewJobsCount (NewWsid = 1) and AllMovementCount
            // (every status-change row in range), same scope as
            // SP_clientportalMovementReport.
            Route::post('get-movement-summary', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $vertical = (int) $request->input('service_id', 0);
                    $client_id = (int) $request->input('client_id', 0);
                    $from_date = $request->input('from_date');
                    $to_date = $request->input('to_date');

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalMovementSummaryCount(?, ?, ?, ?, ?)',
                        [$project_id, $vertical, $client_id, $from_date, $to_date]
                    );

                    $row = count($data) > 0 ? $data[0] : null;

                    return [
                        'status' => true,
                        'data' => [
                            'new_jobs' => $row ? (int) $row->NewJobsCount : 0,
                            'all_movement' => $row ? (int) $row->AllMovementCount : 0
                        ]
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the movement summary'
                    ];
                }
            });

            // Jobs Summary - Open/Closed counts for the dashboard home widget
            // CALL SP_clientportalJobsSummaryCount(__pid, __Vertical, __FromDate, __ToDate, __Cid);
            // Single row: OpenCount (Live Jobs convention, same as
            // SP_FetchBSjobDashboardWithCounts_final) and ClosedCount
            // (NewWsid = 11 within the date range), both scoped to the
            // selected vertical (0 = all) and to the logged-in contact's
            // visibility (__Cid — same ownership/secondary-contact
            // convention as `user_id` in getMovementWithCounts()).
            Route::post('get-jobs-summary', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $vertical = (int) $request->input('service_id', 0);
                    $from_date = $request->input('from_date');
                    $to_date = $request->input('to_date');
                    $user_id = (int) $request->input('user_id', 0);

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalJobsSummaryCount(?, ?, ?, ?, ?)',
                        [$project_id, $vertical, $from_date, $to_date, $user_id]
                    );

                    $row = count($data) > 0 ? $data[0] : null;

                    return [
                        'status' => true,
                        'data' => [
                            'open' => $row ? (int) $row->OpenCount : 0,
                            'closed' => $row ? (int) $row->ClosedCount : 0
                        ]
                    ];
                } catch (Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the jobs summary'
                    ];
                }
            });

            // MOM - Minutes of Meeting
            // CALL SP_clientportalMOMReport(__pid);
            // One row per logged call/meeting. cs.* is returned as-is
            // alongside the computed display columns (ClientDisplay,
            // PurposeName, formatdate, vertical1) — we only map the
            // known/named columns here, not the raw cs.* wildcard, since
            // its exact schema isn't visible from this repo. Description
            // (cs.Description) comes through via that same cs.* wildcard.
            Route::post('get-mom-report', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_clientportalMOMReport(?)',
                        [$project_id]
                    );

                    $rows = array_map(function ($row) {
                        return [
                            'client_name' => $row->clientname,
                            'client_present' => $row->ClientDisplay,
                            'purpose' => $row->PurposeName,
                            'description' => $row->Description,
                            'date' => $row->formatdate,
                            'vertical' => $row->vertical1
                        ];
                    }, $data);

                    return [
                        'status' => true,
                        'data' => $rows
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the MOM report'
                    ];
                }
            });

            // Workflow - today's stand-up rows across the client's Staff /
            // Half Staff / Hourly / Agreed contracts.
            // CALL SP_FullJobListingStandUp(__Pid, __Cid);
            // A contract with no stand-up logged today still comes back as a
            // row with null job/team/name/status fields (see the procedure's
            // own comments) - the frontend shows a placeholder for those.
            Route::post('get-workflow-standup', function(Request $request) {
                try {
                    $project_id = (int) $request->input('project_id');
                    $client_id = (int) $request->input('client_id', 0);

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_FullJobListingStandUp(?, ?)',
                        [$project_id, $client_id]
                    );

                    $rows = array_map(function ($row) {
                        return [
                            'job_description' => $row->jobdescription,
                            'team_name' => $row->Teamname,
                            'name_a' => $row->NameA,
                            'workstatus' => $row->workstatus,
                            'time_will_take' => $row->time_will_take,
                            'expected_finish_date' => $row->expected_finish_date
                        ];
                    }, $data);

                    return [
                        'status' => true,
                        'data' => $rows
                    ];
                } catch(Exception $e) {
                    return [
                        'status' => false,
                        'error' => $e->getMessage(),
                        'message' => 'Something went wrong while fetching the workflow stand-up'
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

                    // Rows already come back in chronological order from the procedure.
                    $details = $details->values();

                    return ['status' => true, 'data' => $details];
                } catch (Exception $e) {
                    return ['status' => false, 'data' => 'Something went wrong while job history'];
                }

            });

            // Get Job Budget Summary (budget vs booked time, in seconds)
            // CALL SP_clientportalJobBudgetSummary(__aid);
            Route::post('get-job-budget-summary', function(Request $request) {
                try {
                    $job_id = (int) $request->input('job_id');
                    $data = DB::connection('wm_mysql')->select('CALL SP_clientportalJobBudgetSummary(?)', [$job_id]);
                    $row = count($data) > 0 ? $data[0] : null;
                    return [
                        'status' => true,
                        'data' => [
                            'budget_seconds' => $row ? (int) $row->BudgetSeconds : 0,
                            'time_taken_seconds' => $row ? (int) $row->TimeTakenSeconds : 0
                        ]
                    ];
                } catch (Exception $e) {
                    return ['status' => false, 'data' => 'Something went wrong while job budget summary'];
                }
            });

            // Get Job Appreciation (client appreciation entries for one job)
            // CALL SP_clientportalJobAppreciation(__aid);
            Route::post('get-job-appreciation', function(Request $request) {
                try {
                    $job_id = (int) $request->input('job_id');
                    $data = DB::connection('wm_mysql')->select('CALL SP_clientportalJobAppreciation(?)', [$job_id]);

                    return [
                        'status' => true,
                        'data' => array_map(function ($row) {
                            return [
                                'id' => $row->Id,
                                'received_date' => $row->Receiveddate,
                                'message' => $row->AppContent,
                                'appreciation_for' => $row->AppreciationFor
                            ];
                        }, $data)
                    ];
                } catch (Exception $e) {
                    return ['status' => false, 'data' => 'Something went wrong while job appreciation'];
                }
            });

            // Get Job Feedback (the client's submitted survey for this job,
            // regardless of which portal user submitted it).
            // get-job-survey (below/elsewhere) is scoped to one exact
            // (job_id, user_id) pair by design — it's what the Angular
            // Feedback page uses to reopen *the current viewer's own*
            // answers for editing. This job detail widget just needs to
            // show whether the job has feedback at all, so it looks the
            // survey up by job_id alone (most recent, if more than one).
            Route::post('get-job-feedback', function(Request $request) {
                try {
                    $job_id = (int) $request->input('job_id');
                    $rows = DB::connection('wm_mysql')->select(
                        'SELECT OverallSatisfaction, OverallInsights, Responsiveness, ResponsivenessInsights, Improvements, CreatedOn
                         FROM tbl_clientportal_jobsurvey
                         WHERE Aid = ? AND IsActive = 1
                         ORDER BY CreatedOn DESC
                         LIMIT 1',
                        [$job_id]
                    );
                    $row = count($rows) > 0 ? $rows[0] : null;

                    return [
                        'status' => true,
                        'data' => $row ? [
                            'overall_satisfaction' => $row->OverallSatisfaction,
                            'overall_insights' => $row->OverallInsights,
                            'responsiveness' => $row->Responsiveness,
                            'responsiveness_insights' => $row->ResponsivenessInsights,
                            'improvements' => $row->Improvements
                        ] : null
                    ];
                } catch (Exception $e) {
                    return ['status' => false, 'data' => 'Something went wrong while fetching the feedback'];
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
