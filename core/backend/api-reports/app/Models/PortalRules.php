<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortalRules extends Model
{
    use HasFactory;

    protected $connection = 'records_mysql';

    protected $table = 'portal_rules';

    protected $fillable = ['dashboard_id', 'client_id', 'vertical_id', 'rule', 'status'];
}
