<?php
use App\Mail\SendReportApprovalRequest;
use App\Models\AgreedsJobs;
use App\Models\AgreedsMonth;
use App\Models\Companies;
use App\Models\ConnectReportActivities;
use App\Models\ConnectReports;
use App\Models\DeletedReports;
use App\Models\Invoices;
use App\Models\Team;
use App\Models\User;
use App\Models\UserDetails;
use App\Models\WeeklyReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mime\Test\Constraint\EmailHeaderSame;

Route::prefix('admin')->group(function() {
    
});