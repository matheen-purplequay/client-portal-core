<?php
use App\Exports\ExcelExport;
use App\Models\ConnectReports;
use App\Models\Invoices;
use App\Models\WeeklyReports;
use App\Models\Queries;
use App\Models\QueryTemplates;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

Route::prefix('query-templates')->group(function() {

    Route::post('/save-query-template', function (Request $request) {
        try {
            // Generate alpha-numeric code similar to CodeGenerator.GetAlphaNumericCodeFromCurrentTimestamp()
            $query_template_code = 'QT' . strtoupper(Str::random(5));
    
            QueryTemplates::create([
                    'query_template_code' => $query_template_code,
                    'title' => $request->input('title'),
                    'job_stage_id' => 0, 
                    'category_id' => $request->input('category_id'),
                    'sub_category_id' => $request->input('sub_category_id'),
                    'criticality_id' => $request->input('criticality_id'),
                    'query' => $request->input('query'),
                    'response_type' => $request->input('response_type'),
                    'project_id' => $request->input('project_id')
                ]);
    
            return [
                'status' => true,
                'message' => 'Query template has been created'
            ];
        } catch (\Exception $e) {
            return [
                'status' => false,
                'message' => 'Something went wrong while saving query template',
                'error' => $e->getMessage()
            ];
        }
    });
    
    // Extract data from query templates upload and save it to templates
    Route::post('/save-query-templates-excel', function (Request $request) {
        try {
            $file = $request->file('excel_file');
            $project_id = $request->input('project_id');
            
            if (!$file) {
                return [
                    'status' => false,
                    'message' => 'No file uploaded'
                ];
            }
            
            // Extract data from Excel using your existing AgreedExcelImport class
            $data = Excel::toArray(new \App\Imports\AgreedExcelImport, $file)[0];
            
            // Lookup ID for 'Low' criticality (hardcoded as per your requirement)
            $criticality_id = DB::connection('wm_mysql')->table('tbl_master')
                                ->where('master_group', 'criticality')
                                ->where('master_name', 'Low')->value('id') ?? 1;

            $templatesInserted = 0;
            
            // Iterate through rows (skipping the header)
            foreach (array_slice($data, 1) as $row) {
                // Expected columns: title (0), query (1), category (2), sub_category (3)
                $title = isset($row[0]) ? trim($row[0]) : null;
                $query = isset($row[1]) ? trim($row[1]) : null;
                $category_name = isset($row[2]) ? trim($row[2]) : null;
                $sub_category_name = isset($row[3]) ? trim($row[3]) : null;

                if (empty($title) || empty($query)) continue;

                // 1. Map category name to its ID
                $category_id = DB::connection('wm_mysql')->table('tbl_master')
                                ->where('master_group', 'category')
                                ->where('master_name', $category_name)->value('id') ?? 0;

                // 2. Map subcategory name to its ID (ensuring it's linked to the category)
                $sub_category_id = 0;
                if ($category_id > 0) {
                    $sub_category_id = DB::connection('wm_mysql')->table('tbl_master')
                                        ->where('master_group', 'sub_category')
                                        ->where('parent_master_id', $category_id)
                                        ->where('master_name', $sub_category_name)->value('id') ?? 0;
                }

                // Generate a unique code (e.g., QTABC12)
                $query_template_code = 'QT' . strtoupper(Str::random(5));

                QueryTemplates::create([
                    'query_template_code' => $query_template_code,
                    'title' => $title,
                    'job_stage_id' => 0, 
                    'category_id' => $category_id,
                    'sub_category_id' => $sub_category_id,
                    'criticality_id' => $criticality_id,
                    'query' => $query,
                    'response_type' => 'confirmation', // Hardcoded as requested
                    'project_id' => $project_id
                ]);
                
                $templatesInserted++;
            }

            return [
                'status' => true,
                'message' => $templatesInserted . ' query templates have been created'
            ];
        } catch (\Exception $e) {
            return [
                'status' => false,
                'message' => 'Something went wrong while saving query templates from Excel',
                'error' => $e->getMessage()
            ];
        }
    });
    
    Route::post('get-query-templates', function(Request $request) {
        try {
            if(!$request->has('project_id')) return ['status' => false, 'message' => 'Insufficient parameters'];
            $project_id = $request->input('project_id');
            $templates = DB::connection('wm_mysql')->table('tbl_query_templates')->select('*')->where('project_id', $project_id)->get();
            return ['status' => true, 'templates' => $templates];
        } catch(Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong while fetching templates'];
        }
    });
});
