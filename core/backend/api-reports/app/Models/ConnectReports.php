<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConnectReports extends Model
{
    use HasFactory;

    protected $connection = 'records_mysql';

    protected $table = 'connect_reports';
}
