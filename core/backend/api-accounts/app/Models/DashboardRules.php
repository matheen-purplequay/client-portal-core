<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardRules extends Model
{
    use HasFactory;
    
    protected $connection = 'records_mysql';
    
    protected $table = 'dashboard_rules';
    
    protected $fillable = ['dashboard_id', 'client_id', 'rule', 'status'];
}
