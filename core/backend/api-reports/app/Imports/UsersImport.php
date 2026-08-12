<?php

namespace App\Imports;

use App\Models\Company;
use App\Models\User;
use App\Models\UserDetails;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;

class UsersImport implements ToCollection
{
    /**
    * @param Collection $collection
    */
    public function collection(Collection $rows)
    {
        try {
            // DB::beginTransaction();

            foreach($rows as $row) {
                // Insert into 'users' table
                $user = User::create(
                    [
                        'first_name' => $row['first_name'],
                        'last_name' => $row['last_name'],
                        'email' => $row['email'],
                        'password' => bcrypt('passowrd'),
                    ]
                );
        
                // Insert into 'companies' table
                $company = Company::updateOrCreate(
                    [
                        'name' => $row['company_name'],
                    ],
                    [
                        'industry_type' => $row['industry_type'],
                        'client_type' => $row['client_type'],
                    ]
                );
        
                // Insert into 'user_details' table
                UserDetails::create([
                    'role' => $row['role'],
                    'status' => $row['status'],
                    'user_id' => $user->id,
                    'company_id' => $company->id,
                ]);
            }
            
            // DB::commit();

            return response()->json(['status' => true, 'message' => 'Excel file uploaded and processed successfully']);
        } catch (\Exception $e) {
            DB::rollback();

            // Handle the exception, log, or return an error response
            return response()->json(['status' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
