<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConnectReportActivities extends Model
{
    use HasFactory;

    protected $table = 'connect_report_activities';

    protected $fillable = ['report_id', 'status_id', 'user_id', 'reason', 'activity_type', 'comments'];
}
