<?php

namespace App\Http\Controllers;

use App\Imports\AgreedExcelImport;
use App\Models\AgreedsJobs;
use App\Models\AgreedsMonth;
use Illuminate\Http\Request;
use Excel;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class ExcelController extends Controller
{
    public function upload(Request $request)
    {
        $file = $request->file('excel_file');
        $project_id = $request->input('project_id');
        $month = $request->input('month');
        $year = $request->input('year');
        // Delete this condition after fixing frontend - which sends incorrect year (2026 instead of 2025)
        $currentYear = date('Y');
        $currentMonth = date('n');
        if ($currentYear = $year + 1 && $currentMonth == 12) {
            $year = $currentYear - 1;
        }
        // End of Delete
        $number_of_jobs = $request->input('number_of_jobs');
        $flag = 'start';
    
        try {
            if ($file) {
                $flag = $flag . ' - file exists';
                $data = Excel::toArray(new AgreedExcelImport, $file)[0];

                // $validator = Validator::make($data, [
                //     '*.1' => 'date_format:d-m-Y', // Validation rule for dateReceived in the format 'dd-mm-yyyy'
                // ]);
            
                // if ($validator->fails()) {
                //     return ['status' => false, 'message' => 'Invalid date format found. Please change to dd-mm-yyyy format and try again.', 'errors' => $validator->errors()];
                // }

                $existingRecords = AgreedsJobs::where('project_id', $project_id)
                    ->where('month', $month)
                    ->where('year', $year)->get()->count();
             
                if ($existingRecords > 0) {
                    $flag = $flag . ' - records exists';
                    $deleted = AgreedsJobs::where('project_id', $project_id)
                    ->where('month', $month)
                    ->where('year', $year)->delete();
                    if($deleted < 0) {
                        return ['status' => true, 'message' => 'Something went wrong', 'error' => 'existing records not deleted'];
                    }
                }

                foreach (array_slice($data,1) as $row) {
                    $originalDate = $row[1];
                    if(is_string($originalDate)) {
                        if(is_numeric($originalDate)) {
                            $convertedDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((int)$originalDate);
                            $convertedDate = $convertedDate->format("d-m-Y");
                        } else {
                            $convertedDate = $originalDate;
                        }
                    } else {
                        $convertedDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row[1]);
                        $convertedDate = $convertedDate->format("d-m-Y");
                    }
                    if(isset($row[0]) && isset($convertedDate) && isset($row[2])) {
                        AgreedsJobs::create([
                            'job_name' => $row[0],
                            'date_received' => $convertedDate,
                            'job_status' => $row[2],
                            'month' => $month,
                            'year' => $year,
                            'project_id' => $project_id,
                        ]);
                    }
                }
                $flag = $flag . ' - after agreed jobs create';
            }

            if(isset($project_id) && isset($month) && isset($year) && isset($number_of_jobs)) {
                AgreedsMonth::updateOrCreate(
                    [
                        'project_id'=> $project_id,
                        'month' => $month,
                        'year' => $year
                    ],
                    [
                        'month' => $month,
                        'year' => $year,
                        'number_of_jobs' => $number_of_jobs,
                        'project_id' => $project_id
                    ]
                );
                $flag = $flag . ' - after agreed jobs details create';
                return ['status' => true, 'message' => 'Agreed details saved', 'flag' => $flag];
            } else return ['status' => true, 'message' => 'Nothing saved', 'flag' => $flag];
        }
        catch(Exception $e) {
            return ['status' => true, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
        }
    
    }
}
