<?php

namespace App\Http\Controllers;

use App\Models\IT;
use Illuminate\Http\Request;

class ITController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $title = $request->input('title');
        $date_of_issue = $request->input('date_of_issue');
        $file = $request->file('policy');

        try {
            $it = new IT();
            $it->title = $title;
            $it->date_of_issue = $date_of_issue;

            $fileName = time().'_'.$file->getClientOriginalName();
            $path =  '/common/it';
            $filePath = $file->storeAs($path, $fileName, 'public');
            $it->link = $filePath;
            $it->save();
            return ['status' => true, 'message' => 'IT Policy uploaded', 'data' => $it];

        } catch (\Exception $e) {
              return ['status' => false, 'message' => 'Something went wrong while uploading IT policy', 'error' => $e->getMessage()];
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(IT $iT)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(IT $iT)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, IT $iT)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(IT $iT)
    {
        //
    }
}
