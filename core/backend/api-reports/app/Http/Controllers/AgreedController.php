<?php

namespace App\Http\Controllers;
use App\Models\Companies;
use App\Models\ConnectReports;
use App\Models\WeeklyReports;
use App\Models\Agreed;
use Illuminate\Http\Request;

class AgreedController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $companies = Companies::all();
        return view('pages.reports.agreed-upload')->with(compact('companies'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $client_id = $request->input('client_id');
    }

    /**
     * Display the specified resource.
     */
    public function show(Agreed $agreed)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Agreed $agreed)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Agreed $agreed)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agreed $agreed)
    {
        //
    }
}
