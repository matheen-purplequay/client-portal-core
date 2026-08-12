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


Route::prefix('reports')->group(function () {
    
    Route::prefix('business-services')->group(function() {
        
        Route::post('jobs-with-status', function(Request $request) {
            $whereCondition = $request->input('whereCondition');

            $query = DB::connection('wm_mysql')
                ->table('jobmonitor as J')
                ->select([
                    'J.Aid',
                    'tgn.GroupJobName',
                    'A.Jobdescription as Jobname',
                    'N.Naturejob',
                    'C.Contactname as ReceivedFrom',
                    'U.Usename as Accountant',
                    'J.Workstatus',
                    'W.NewWorkStatus',
                    'W.wno as StatusId',
                    'J.FinancialYear'
                ])
                ->leftJoin('Activity as A', 'A.Aid', '=', 'J.Aid')
                ->leftJoin('tbl_groupjobname as tgn', 'tgn.Id', '=', 'A.Groupjobid')
                ->leftJoin('natureofjob as N', 'N.nojid', '=', 'J.nojid')
                ->leftJoin('contacts as C', 'C.cid', '=', 'J.cid')
                ->leftJoin('user as U', 'U.uid', '=', 'J.uid')
                ->leftJoin('workstatus as W', 'W.wno', '=', 'J.Workstatus')
                ->where('J.daterecieved', '>=', '2025-01-01')
                ->where('J.serviceid', $service_id)
                ->where('J.Pid', $project_id)
                ->groupBy('J.Aid', 'J.budgettime')
                ->limit($p_limit)
                ->offset($p_offset);
            
            if (!empty($whereCondition)) {
                $query->whereRaw($whereCondition);
            }
            
            $result = $query->get();


        });
        
    });
    
});