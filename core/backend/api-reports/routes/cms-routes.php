<?php

use App\Models\Articles;
use App\Models\Companies;
use App\Models\ConnectReports;
use App\Models\Holidays;
use App\Models\Invoices;
use App\Models\KnowledgeCenter;
use App\Models\MyTeam;
use App\Models\Newsletters;
use App\Models\IT;
use App\Models\Team;
use App\Models\UsefulTools;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/get-newsletters', function () {
    $newsletters = Newsletters::orderBy('month', 'desc')->get();
    return ['status' => true, 'data' => $newsletters];
});

Route::post('/get-newsletters', function (Request $request) {
    $year = $request->input('year');

    if(isset($year)) {
        $newsletters = Newsletters::where('year', $year)->orderBy('month', 'desc')->get();
        return ['status' => true, 'data' => $newsletters];
    } else 
        return ['status' => false, 'data' => []];
});

Route::post('/get-newsletters-by-master-company', function (Request $request) {
    $year = $request->input('year');
    $master_company_id = $request->input('master_company_id');

    if(isset($year)) {
        $newsletters = Newsletters::where('year', $year)->where('master_company_id', $master_company_id)
            ->orderBy('month', 'desc')->get();

        return ['status' => true, 'data' => $newsletters];
    } else 
        return ['status' => false, 'data' => []];
});

Route::post('/save-newsletter', function (Request $request) {
    $title = $request->input('title');
    $month = $request->input('month');
    $year = $request->input('year');
    $link = $request->input('link');
    $master_company_id = $request->input('master_company_id');

    try {
        Newsletters::create(
            [
                'title' => $title,
                'month' => $month,
                'year' => $year,
                'link' => $link,
                'master_company_id' => $master_company_id
            ]
        );

        return ['status' => true, 'message' => 'Newsletter added'];
    } catch (Exception $e) {
        return ['status' => false, 'mesage' => 'Something went wrong while saving newsletter', 'error' => $e->getMessage()];
    }

});

Route::post('/update-newsletter', function (Request $request) {
    $id = $request->input('id');
    $title = $request->input('title');
    $month = $request->input('month');
    $year = $request->input('year');
    $link = $request->input('link');
    $master_company_id = $request->input('master_company_id');

    try {
        $newsletter = Newsletters::find($id);
        $newsletter->title = $title;
        $newsletter->month = $month;
        $newsletter->year = $year;
        $newsletter->link = $link;
        $newsletter->master_company_id = $master_company_id;
        $newsletter->save();

        return ['status' => true, 'message' => 'Newsletter updated'];
    } catch (Exception $e) {
        return ['status' => false, 'mesage' => 'Something went wrong while updating newsletter', 'error' => $e->getMessage()];
    }

});

Route::post('/delete-newsletter', function (Request $request) {
    $id = $request->input('id');

    try {
        $newsletter = Newsletters::find($id);
        if(isset($newsletter)) {
            $newsletter->delete();
            return ['status' => true, 'message' => 'Newsletter deleted'];
        } else return ['status' => false, 'message' => 'Newsletter not found'];

    } catch (Exception $e) {
        return ['status' => false, 'mesage' => 'Something went wrong while updating newsletter', 'error' => $e->getMessage()];
    }

});

Route::get('/get-holidays', function () {
    $indian_holidays = Holidays::where('iso_country_alpha3_code', 'IND')->get();
    $australian_holidays = Holidays::where('iso_country_alpha3_code', 'AUS')->get();

    return ['status' => true, 'data' => ['indian' => $indian_holidays, 'australian' => $australian_holidays]];
});

Route::get('/get-upcoming-events', function () {
    $currentDate = date('d-m-Y');
    $currentMonth = (int)date('m');
    $currentYear = (int)date('Y');

    // $holidays = Holidays::where('date', '>=', $currentDate)
    //     ->where('year', $currentYear)
    //     ->orderBy('month', 'DESC')
    //     ->get();

    $holidaysSQL = Holidays::where(DB::raw("STR_TO_DATE(date, '%d-%m-%Y')"), '>', DB::raw("STR_TO_DATE('" . $currentDate . "', '%d-%m-%Y')"))
        ->where('year', $currentYear)
        ->orderBy(DB::raw("STR_TO_DATE(date, '%d-%m-%Y')"), 'ASC');

    $holidays = $holidaysSQL->get();
    

    return ['status' => true, 'data' => $holidays];
});

Route::post('/get-my-team', function (Request $request) {
    $accounts_base_table = env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts');
    $reports_base_table = env('REPORTS_BASE_TABLE', 'welinnwd_pqreports');
    
    $client_id = $request->input('client_id');

    // Getting Associates and Team Lead
    $query1 = Team::select(
        'teams.id',
        'teams.name',
        'teams.role_id as role_id',
        'rm.title as role_title',
        'rm.category as role_category',
        'teams.heirarchy',
        'teams.client_id',
        'teams.wm_user_id',
        'teams.vertical_id as vertical_id',
        's.title as vertical_title',
        'teams.email',
        'teams.status'
    )
        ->leftJoin($accounts_base_table.'.roles_master as rm', 'teams.role_id', '=', 'rm.id')
        ->leftJoin($accounts_base_table.'.services as s', 'teams.vertical_id', '=', 's.wm_vertical_id')
        ->where('teams.client_id', $client_id)
        ->where('rm.category', 'employee')
        ->where('status', 'active')
        ->orderBy('teams.heirarchy', 'asc');
    $associates = $query1->get();

    $associates = $associates->map(function ($item) {

        return [
            'id' => $item->id,
            'client_id' => $item->client_id,
            'name' => $item->name,
            'wm_user_id' => $item->wm_user_id,
            'heirarchy' => $item->heirarchy,
            'role' => [
                'id' => $item->role_id,
                'title' => $item->role_title,
            ],
            'vertical' => [
                'id' => $item->vertical_id,
                'title' => $item->vertical_title,
            ],
            'email' => $item->email,
            'status' => $item->status,
        ];
    });

    // Getting Other Roles
    $query2 = Team::select(
        'teams.id',
        'teams.name',
        'teams.role_id as role_id',
        'rm.title as role_title',
        'rm.category as role_category',
        'teams.heirarchy as role_heirarchy',
        'teams.heirarchy',
        'teams.client_id',
        'teams.wm_user_id',
        'teams.vertical_id as vertical_id',
        's.title as vertical_title',
        'teams.email',
        'teams.status'
        )
        ->leftJoin($accounts_base_table.'.roles_master as rm', 'teams.role_id', '=', 'rm.id')
        ->leftJoin($accounts_base_table.'.services as s', 'teams.vertical_id', '=', 's.wm_vertical_id')
        ->where('teams.client_id', $client_id)
        ->where('rm.category', '!=', 'employee')
        ->where('status', 'active')
        ->orderBy('teams.heirarchy', 'asc')
        ->orderBy('rm.heirarchy', 'asc');
    $others = $query2->get();

    $others = $others->map(function ($item) {
        return [
            'id' => $item->id,
            'client_id' => $item->client_id,
            'name' => $item->name,
            'wm_user_id' => $item->wm_user_id,
            'heirarchy' => $item->heirarchy,
            'role' => [
                'id' => $item->role_id,
                'title' => $item->role_title,
            ],
            'vertical' => [
                'id' => $item->vertical_id,
                'title' => $item->vertical_title,
            ],
            'email' => $item->email,
            'status' => $item->status,
        ];
    });

    // Getting Other Roles
    $project_group_directors_query = Team::select(
        'teams.id',
        'teams.name',
        'teams.role_id as role_id',
        'rm.title as role_title',
        'rm.category as role_category',
        'teams.heirarchy as role_heirarchy',
        'teams.heirarchy',
        'teams.client_id',
        'teams.wm_user_id',
        'teams.vertical_id as vertical_id',
        's.title as vertical_title',
        'teams.email',
        'teams.status'
        )
        ->leftJoin($accounts_base_table.'.roles_master as rm', 'teams.role_id', '=', 'rm.id')
        ->leftJoin($accounts_base_table.'.services as s', 'teams.vertical_id', '=', 's.wm_vertical_id')
        ->where('teams.client_id', $client_id)
        ->where(
            function($query) {
                return $query
                    ->where('rm.code', 'project_director')
                    ->orWhere('rm.code', 'client_lead')
                    ->orWhere('rm.code', 'client_manager')
                    ->orWhere('rm.code', 'group_director');
           })
        ->where('status', 'active')
        ->orderBy('teams.heirarchy', 'ASC')
        ->orderBy('rm.heirarchy', 'ASC');
    $project_group_directors = $project_group_directors_query->get();

    $project_group_directors = $project_group_directors->map(function ($item) {
        return [
            'id' => $item->id,
            'client_id' => $item->client_id,
            'name' => $item->name,
            'wm_user_id' => $item->wm_user_id,
            'heirarchy' => $item->heirarchy,
            'role' => [
                'id' => $item->role_id,
                'title' => $item->role_title,
            ],
            'vertical' => [
                'id' => $item->vertical_id,
                'title' => $item->vertical_title,
            ],
            'email' => $item->email,
            'status' => $item->status,
        ];
    });


    return [
        'status' => true, 
        'data' => [
            'associates' => $associates, 
            'others' => $others, 
            'directors' => $project_group_directors
            ] 
        ];
});

Route::post('/get-articles', function (Request $request) {
    $month = $request->input('month');
    $year = $request->input('year');
    $category = $request->input('category');

    $query = Articles::where('year', $year);

    if ($month != '0' && $month != 0)
        $query = $query->where('month', $month);

    if ($category != '' || $category != NULL)
        $query = $query->where('category', $category);
    $articles = $query->get();

    $categories = Articles::groupBy('category')->pluck('category')->toArray();

    return ['status' => true, 'data' => $articles, 'categories' => $categories];
});

Route::post('/save-article', function (Request $request) {
    $title = $request->input('title');
    $description = $request->input('description');
    $link = $request->input('link');
    $category = $request->input('category');
    $month = $request->input('month');
    $year = $request->input('year');

    try {
        Articles::create(
            [
                'title' => $title,
                'description' => $description,
                'link' => $link,
                'category' => $category,
                'month' => $month,
                'year' => $year
            ]
        );

        return ['status' => true, 'message' => 'Article added'];
    } catch (Exception $e) {
        return ['status' => false, 'mesage' => 'Something went wrong while saving article', 'error' => $e->getMessage()];
    }

});

Route::get('/get-useful-tools-categories', function () {
    $categories = UsefulTools::groupBy('category')->pluck('category')->toArray();
    if (count($categories) > 0)
        $sub_categories = UsefulTools::where('category', $categories[0])->groupBy('sub_category')->pluck('sub_category')->toArray();
    else
        $sub_categories = [];

    return ['status' => true, 'categories' => $categories, 'sub_categories' => $sub_categories];
});

Route::post('/get-useful-tools', function (Request $request) {
    $category = $request->input('category');
    $sub_category = $request->input('sub_category');

    $query = UsefulTools::where('active', 1);

    if ($category != '')
        $query = $query->where('category', $category);
    if ($sub_category != '')
        $query = $query->where('sub_category', $sub_category);
    $tools = $query->get();

    $categories = UsefulTools::groupBy('category')->pluck('category')->toArray();
    $sub_categories = UsefulTools::where('category', $category)->groupBy('sub_category')->pluck('sub_category')->toArray();

    return ['status' => true, 'data' => $tools, 'categories' => $categories, 'sub_categories' => $sub_categories];
});

Route::post('/save-useful-tools', function (Request $request) {
    $title = $request->input('title');
    $description = $request->input('description');
    $link = $request->input('link');
    $category = $request->input('category');

    try {
        UsefulTools::create(
            [
                'title' => $title,
                'description' => $description,
                'link' => $link,
                'category' => $category
            ]
        );

        return ['status' => true, 'message' => 'Tools added'];
    } catch (Exception $e) {
        return ['status' => false, 'mesage' => 'Something went wrong while saving tools', 'error' => $e->getMessage()];
    }

});

Route::post('/get-tool', function (Request $request) {
    $filename = $request->input('file_link');
    $file_path = storage_path() . '/app/public/' . $filename;

    if (file_exists($file_path)) {
        return response()->file($file_path);
    } else {
        exit('Requested file does not exist on our server!');
    }
});

// Get all PDFs
Route::get('/get-all-it-pdf', function () {
    $itPolicies = IT::all();
    return ['status' => true, 'data' => $itPolicies];
});

Route::post('/save-it', 'App\Http\Controllers\ITController@store');

// Preview Reports
Route::post('/it-preview', function (Request $request) {
    $id_id = $request->input('it_id');

    $itLinks = IT::where('id', $id_id)->first();
    $filename = $itLinks->link;
    $file = Storage::get($filename);
    // Check if file exists in app/storage/file folder
    $file_path = storage_path() . '/app/public/' . $filename;

    if (file_exists($file_path)) {
        return response()->file($file_path);
    } else {
        exit('Requested file does not exist on our server!' . $file_path);
    }
});


Route::prefix('admin')->group(function () {
    Route::get('/get-all-useful-tools', function () {
        $tools = UsefulTools::all();
        return ['status' => true, 'data' => $tools];
    });
    Route::get('/get-all-articles', function () {
        $articles = Articles::all();
        return ['status' => true, 'data' => $articles];
    });
});


// Admin Routes
Route::prefix('admin')->group(function() {
    // App Updates
    Route::post('');
});
