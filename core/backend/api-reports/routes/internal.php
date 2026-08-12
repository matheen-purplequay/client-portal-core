<?php
use App\Models\ConnectReports;
use App\Models\Invoices;
use App\Models\SupportTicket;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

Route::middleware("auth:sanctum")->group(function () {
    Route::post("/raise-issue", function (Request $request) {
        $type = $request->input("type");
        $subject = $request->input("subject");
        $query = $request->input("query");
        $device_id = ($request->input("device_id"))? $request->input("device_id") : NULL;
        $raised_by = $request->input("raised_by");
        $status = 'raised';


        SupportTicket::create([
            'type' => $type,
            'subject' => $subject,
            'query' => $query,
            'device_id' => $device_id,
            'raised_by' => $raised_by,
            'status' => $status,
        ]);
    });
});