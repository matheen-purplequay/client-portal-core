<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientPortalPermissions extends Model
{
    use HasFactory;
    
    protected $table = 'client_portal_permissions';

    protected $fillable = ['role', 'module', 'can_create', 'can_read', 'can_update', 'can_delete', 'can_review'];

}
