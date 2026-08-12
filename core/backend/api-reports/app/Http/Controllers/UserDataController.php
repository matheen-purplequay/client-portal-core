<?php

namespace App\Http\Controllers;

use App\Imports\UsersImport;
use App\Models\Company;
use App\Models\User;
use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class UserDataController extends Controller
{
    public function loadUsers(Request $request) {
        try {
            Excel::import(new UsersImport, $request->file('users'), null, \Maatwebsite\Excel\Excel::XLSX);
            // return ['status' => true, 'message' => 'Users have been uploaded successfull'];
        } catch (\Exception $e) { 
            return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage()];
        }
    }
}
