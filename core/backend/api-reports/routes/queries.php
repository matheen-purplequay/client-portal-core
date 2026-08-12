<?php

use App\Models\Queries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::prefix('queries')->group(function() {

    // Client Queries Routes
    Route::prefix('client')->group(function() {
        
    });

    // Admin Queries Routes
    Route::prefix('admin')->group(function() {

        // Get all categories
        Route::get('query-categories', function() {
            $accountHead = DB::connection('wm_mysql')->table('tbl_queryaccounthead')->all();
            $subAccountHead = DB::connection('wm_mysql')->table('tbl_querysubhead')->all();

            $categories = [];
            foreach ($subAccountHead as $sah) {
                foreach ($accountHead as $ah) {
                    if($sah->AccountHeadID == $ah->id) {
                        $categories[$ah->AccountHeadID]['categoryName'] = $ah->AccountHead;
                        $categories[$ah->AccountHeadID]['id'] = $ah->AccountHeadID;
                        $categories[$ah->AccountHeadID]['subCategories'] = $sah;
                    }
                }
            }

            return [
                'status' => true,
                'data' => $categories
            ];
        });

        // Get all queries
        Route::get('get-all-queries', function() {
            $queries = Queries::all();

            return [
                'status' => true,
                'data' => $queries
            ];
        });

        // Get queries by client
        Route::post('get-queries-by-client', function(Request $request) {

        });

        // Get sub queries

    });
});