<?php

namespace App\Http\Controllers;

use App\Models\Companies;
use App\Models\Invoices;
use Illuminate\Http\Request;

class InvoicesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $companies = Companies::all();
        return view('pages.reports.reports-upload')->with(compact('companies'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $client_id = $request->input('client_id');
        if($client_id != '') {
            $name = $request->input('name');
            $pages = $request->input('pages');
            $month = $request->input('month');
            $year = $request->input('year');
            $file = $request->file('report');
            $report_type = $request->input('report_type');
    
            $invoice = new Invoices();
            $invoice->name = $name;
            $invoice->pages = $pages;
            $invoice->month = $month;
            $invoice->year = $year;
            $invoice->pages = $pages;
            $invoice->client_id = $client_id;
            $fileName = time().'_'.$file->getClientOriginalName();
            $path =  $client_id . '/invoices';
            $filePath = $file->storeAs($path, $fileName, 'public');
            $invoice->file = $filePath;
            $invoice->save();
            return back()->with('message', 'Report has been uploaded');
        } else {
            return back()->with('message', 'Something wrong. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoices $invoices)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Invoices $invoices)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Invoices $invoices)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoices $invoices)
    {
        //
    }
}
