<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientPortalRules extends Model
{
    use HasFactory;

    protected $table = 'client_portal_rules';

    protected $fillable = ['dashboard_id', 'client_id', 'service_id', 'rules', 'status'];
}
