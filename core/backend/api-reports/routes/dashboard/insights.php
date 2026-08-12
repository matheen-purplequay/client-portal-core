<?php

use App\Models\Companies;
use App\Models\EngagementVerticals;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('client')->group(function () {

    Route::prefix('dashboard')->group(function () {

        Route::prefix('insights')->group(function () {

            // -------------------------------------------------------------------------
            // POST /client/dashboard/insights/verticals
            // project_id is passed from the Angular userdata attribute — not user-typed input
            // 
            Route::post('/get-verticals', function (Request $request) {
                $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'cp_accounts');
                $reports_base_table = env('REPORTS_BASE_TABLE', 'cp_reports');

                $project_id = $request->input('project_id');
                $company = Companies::where('works_manager_client_id', $project_id)->first();
                if(empty($company)) {
                    return ['status' => false, 'message' => 'Company not found'];
                }
                $client_id = $company->id;
                $servicesSQL = EngagementVerticals::select(
                    'engagement_verticals.id',
                    'engagement_verticals.service_id',
                    'engagement_verticals.engagement_id',
                    'em.title',
                    'em.code',
                    's.title',
                    's.wm_vertical_id as wm_vertical_id',
                    's.service_id as new_service_id'
                )
                    ->leftJoin($accounts_base_table.'.services as s', 'engagement_verticals.service_id', '=', 's.id')
                    ->leftJoin($accounts_base_table.'.engagements_master as em', 'engagement_verticals.engagement_id', '=', 'em.id')
                    ->where('engagement_verticals.client_id', $client_id)
                    ->where('is_active', 1);

                $services = $servicesSQL->get();

                return ['status' => true, 'data' => $services ];
            });

            // -------------------------------------------------------------------------
            // POST /client/dashboard/insights/utilization
            // Calls SP_AssociateProductivity_Last3Months(month, client_id, vertical_id)
            // client_id is passed from the Angular userdata attribute — not user-typed input
            // -------------------------------------------------------------------------

            Route::post('utilization', function (Request $request) {
                try {
                    $project_id  = (int) $request->input('project_id', 0);
                    $month       = $request->input('month', '');
                    $vertical_id = (int) $request->input('vertical_id', 0);

                    if (!$project_id) {
                        return ['status' => false, 'message' => 'project_id is required.'];
                    }

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_AssociateProductivity_Last3Months(?, ?, ?)',
                        [$month, $project_id, $vertical_id]
                    );

                    return ['status' => true, 'data' => $data];
                } catch (Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching utilization data.',
                    ];
                }
            });

            // -------------------------------------------------------------------------
            // POST /client/dashboard/insights/feedback
            // Calls sp_ClientFeedback_ClientDelivery_shibu_1(month, client_id, vertical_id)
            // -------------------------------------------------------------------------

            Route::post('feedback-summary', function (Request $request) {
                try {
                    $project_id  = (int) $request->input('project_id', 0);
                    $month       = $request->input('month', '');
                    $vertical_id = (int) $request->input('vertical_id', 0);

                    if (!$project_id) {
                        return ['status' => false, 'message' => 'project_id is required.'];
                    }

                    $data = DB::connection('wm_mysql')->select(
                        'CALL SP_Feedback_Percentage_shibu(?, ?, ? ?)',
                        [$month, $project_id, $vertical_id, 0]
                    );

                    return ['status' => true, 'data' => $data];
                } catch (Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching feedback summary.',
                    ];
                }
            });

            Route::post('feedback', function (Request $request) {
                try {
                    $project_id  = (int) $request->input('project_id', 0);
                    $month       = $request->input('month', '');
                    $vertical_id = (int) $request->input('vertical_id', 0);

                    if (!$project_id) {
                        return ['status' => false, 'message' => 'project_id is required.'];
                    }

                    $data = DB::connection('wm_mysql')->select(
                        'CALL sp_ClientFeedback_ClientDelivery_shibu_1(?, ?, ?)',
                        [$month, $project_id, $vertical_id]
                    );

                    return ['status' => true, 'data' => $data];
                } catch (Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching feedback data.',
                    ];
                }
            });

            // -------------------------------------------------------------------------
            // POST /client/dashboard/insights/appreciation
            // Calls sp_ClientAppreciation_ClientDelivery(month, client_id, vertical_id)
            // -------------------------------------------------------------------------

            // -------------------------------------------------------------------------
            // POST /client/dashboard/insights/key-updates
            // Queries metrics_report.tbl_keyupdate + tbl_keyupdatelist by month
            // Returns items with description and image placeholder count
            // -------------------------------------------------------------------------

            Route::post('key-updates', function (Request $request) {
                try {
                    $project_id = (int) $request->input('project_id', 0);
                    $month_raw  = $request->input('month', '');

                    if (!$project_id || !$month_raw) {
                        return ['status' => false, 'message' => 'project_id and month are required.'];
                    }

                    // Convert MM-yyyy → yyyy-MM for the DB query
                    $parts = explode('-', $month_raw);
                    if (count($parts) !== 2) {
                        return ['status' => false, 'message' => 'Invalid month format. Expected MM-yyyy.'];
                    }
                    $formatted_month = $parts[1] . '-' . $parts[0];

                    $rows = DB::connection('wm_mysql')->select(
                        'SELECT kl.Id, kl.Description
                         FROM metrics_report.tbl_keyupdate k
                         INNER JOIN metrics_report.tbl_keyupdatelist kl ON k.Id = kl.kid
                         WHERE k.month = ?',
                        [$formatted_month]
                    );

                    $data = [];
                    foreach ($rows as $row) {
                        $imgResult = DB::connection('wm_mysql')->select(
                            'SELECT COUNT(*) as cnt FROM metrics_report.tbl_keyupdatelistimage WHERE Listid = ?',
                            [$row->Id]
                        );
                        $data[] = [
                            'id'          => $row->Id,
                            'description' => $row->Description,
                            'image_count' => (int) ($imgResult[0]->cnt ?? 0),
                        ];
                    }

                    return ['status' => true, 'data' => $data];
                } catch (Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching key updates.',
                    ];
                }
            });

            Route::post('appreciation', function (Request $request) {
                try {
                    $project_id  = (int) $request->input('project_id', 0);
                    $month       = $request->input('month', '');
                    $vertical_id = (int) $request->input('vertical_id', 0);

                    if (!$project_id) {
                        return ['status' => false, 'message' => 'project_id is required.'];
                    }

                    $data = DB::connection('wm_mysql')->select(
                        'CALL sp_ClientAppreciation_ClientDelivery(?, ?, ?)',
                        [$month, $project_id, $vertical_id]
                    );

                    return ['status' => true, 'data' => $data];
                } catch (Exception $e) {
                    return [
                        'status'  => false,
                        'error'   => $e->getMessage(),
                        'message' => 'Something went wrong while fetching appreciation data.',
                    ];
                }
            });

        });

    });

});
