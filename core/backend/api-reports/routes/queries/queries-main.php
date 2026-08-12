<?php
use App\Exports\ExcelExport;
use App\Models\ConnectReports;
use App\Models\Invoices;
use App\Models\WeeklyReports;
use App\Models\Queries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;


Route::prefix('admin')->group(function() {
    Route::prefix('queries')->group(function() {
        
        Route::post('check-if-user-is-approver', function(Request $request) {
            try {
                if(!$request->has('user_id') && !$request->has('client_id')) return ['status' => false, 'message' => 'Insufficient parameters'];
                $user_id = $request->input('user_id');
                $client_id = $request->input('client_id');
                
                $check = DB::connection('wm_mysql')->table('tbl_query_approvers')->select('*')->where('user_id', $user_id)->where('client_id', $client_id)->get();
                
                if(isset($check) && $check->count() > 0) {
                    return ['status' => true, 'message' => 'User is approver'];
                } else {
                    return ['status' => false, 'message' => 'User is not an approver'];
                }
            } catch (Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while checking if user is approver'];
            }
        });
        
        Route::post('get-draft-queries', function(Request $request) {
            try {
                $project_id = $request->input('project_id');
                $draft_queries = Queries::where('status_id', 1)->get();
                return [ 'satus' => true, 'data' => $draft_queries ];
            } catch(Exception $e) {
                return [ 'satus' => false, 'message' => 'Something went wrong while getting draft queries', 'error' => $e->getMessage() ];
            }
        });
        
        Route::post('get-draft-sub-queries', function(Request $request) {
            try {
                $query_id = $request->input('query_id');
                
                $draft_sub_queries = DB::connection('wm_mysql')->select('CALL SP_SMSF_Portal_GetDraftSubQueries(?, ?)', [$query_id]);
                
                return [ 'satus' => true, 'data' => $draft_sub_queries ];
            } catch(Exception $e) {
                return [ 'satus' => false, 'message' => 'Something went wrong while getting draft sub queries', 'error' => $e->getMessage() ];
            }
        });
        
        Route::get('get-rejected-queries', function(Request $request) {
            try {
                $draft_queries = DB::connection('wm_mysql')->table('tbl_queries as tq')
                    ->select(
                        'tq.id', 'tq.job_id', 'tq.query_code', 'tq.title', 'tq.query', 'tq.posted_date', 
                        'a.jobdescription as job_name', 'tq.job_touchpoint',
                        'tq.category_id as category_id', 'tmcat.master_name as category_name', 
                        'tq.sub_category_id as sub_category_id', 'tmsub.master_name as sub_category_name',
                        'tq.criticality_id as criticality_id', 'tmcri.master_name as criticality_name',
                        'tq.response_type', 'tq.raised_by', 'u.usename as raised_by_name', 'tq.raised_to', 'c.Contactname as raised_to_name'
                        )
                    ->leftJoin('activity as a', 'a.Aid', '=', 'tq.job_id')
                    ->leftJoin('tbl_master as tmcat', 'tmcat.id', '=', 'tq.category_id')
                    ->leftJoin('tbl_master as tmsub', 'tmsub.id', '=', 'tq.sub_category_id')
                    ->leftJoin('tbl_master as tmcri', 'tmcri.id', '=', 'tq.criticality_id')
                    ->leftJoin('user as u', 'u.Uid', '=', 'tq.raised_by')
                    ->leftJoin('contacts as c', 'c.Cid', '=', 'tq.raised_to')
                    ->where('tq.status_id', 5)
                    ->get();
                return [ 'satus' => true, 'data' => $draft_queries ];
            } catch(Exception $e) {
                return [ 'satus' => false, 'message' => 'Something went wrong while getting draft queries', 'error' => $e->getMessage() ];
            }
        });
        
        Route::post('check-if-queries-exists', function (Request $request) {
            $jobId = $request->get('job_id');
            $title = $request->get('title');
            $query = $request->get('query');
            $clientId = $request->get('client_id');
        
            if (!$jobId || !$title || !$query || !$clientId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Missing required parameters',
                ], 400);
            }
        
            $queries = DB::connection('wm_mysql')->table('tbl_queries')
                ->select('id', 'query_code', 'title', 'query', 'posted_date')
                ->where('job_id', $jobId)
                ->where('title', $title)
                ->where('query', $query)
                ->where('client_id', $clientId)
                ->whereNotIn('status_id', [4, 5, 6])
                ->get();
        
            if ($queries->count() > 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Query already exists',
                    'queries' => $queries,
                ]);
            }
        
            return response()->json([
                'status' => true,
                'message' => 'No queries found',
            ]);
        });
        
        // Get Query Statistics
        Route::post('get-query-statistics', function(Request $request) {
            try {
                $project_id = $request->input('project_id');
                $user_id = (int)$request->input('user_id');
        
                // Get PDO instance from Laravel
                $pdo = DB::connection('wm_mysql')->getPdo();
        
                // Prepare and execute stored procedure
                $stmt = $pdo->prepare("CALL SP_SMSF_Portal_GetQueryCounts_Testing(?, ?)");
                $stmt->execute([$project_id, $user_id]);
        
                // First generated sql
                $sql = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Then result set: status
                $stmt->nextRowset();
                $status = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Move to second result set: aging
                $stmt->nextRowset();
                $aging = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Move to second result set: criticality
                $stmt->nextRowset();
                $criticality = $stmt->fetchAll(PDO::FETCH_ASSOC);

                return [
                    'status'  => true,
                    'status'        => $status,
                    'aging'         => $aging,
                    'criticality'   => $criticality
                ];
        
            } catch(Exception $e) {
                return [
                    'status'  => false,
                    'error'   => $e->getMessage(),
                    'message' => 'Something went wrong while fetching query stats'
                ];
            }
        });
        
        // Query Master routes
        Route::prefix('master')->group(function() {
            //Get Master data related to queries
            Route::get('get-master-data', function(Request $request) {
                
                $rows = DB::connection('wm_mysql')->table('tbl_master')
                    ->select("id","master_code","master_name","master_group","parent_master_id")
                    ->whereIn("master_group", ["category", "sub_category", "criticality", "response_type"])
                    ->get()->toArray();
            
                // Force to associative array
                $rows = array_map(function ($row) {
                    return (array) $row;
                }, $rows);
            
                $data = [
                    'categories' => [],
                    'criticalities' => [],
                    'response_types' => []
                ];
            
                $categories = array_filter($rows, function ($r) {
                    return isset($r['master_group']) && $r['master_group'] === 'category';
                });
            
                $subs = array_filter($rows, function ($r) {
                    return isset($r['master_group']) && $r['master_group'] === 'sub_category';
                });
            
                $criticalities = array_filter($rows, function ($r) {
                    return isset($r['master_group']) && $r['master_group'] === 'criticality';
                });
                
                $response_types = array_filter($rows, function ($r) {
                    return isset($r['master_group']) && $r['master_group'] === 'response_type';
                });
            
                foreach ($categories as $cat) {
                    $subList = array_values(array_filter($subs, function ($s) use ($cat) {
                        return isset($s['parent_master_id']) && $s['parent_master_id'] == $cat['id'];
                    }));
            
                    $data['categories'][] = [
                        'id' => $cat['id'],
                        'master_code' => $cat['master_code'],
                        'master_name' => $cat['master_name'],
                        'master_group' => $cat['master_group'],
                        'sub_category' => $subList
                    ];
                }
            
                $data['criticalities'] = array_values($criticalities);
                
                $data['response_types'] = array_values($response_types);
            
                return response()->json($data);
            });
    
            
        });
        
        

    });
});