<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardsMaster extends Model
{
    use HasFactory;

    protected $connection = 'records_mysql';

    protected $table = 'dashboards_master';

    protected $fillable = ['id', 'code', 'title'];
}
