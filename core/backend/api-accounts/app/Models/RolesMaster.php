<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolesMaster extends Model
{
    use HasFactory;
    
    protected $table = 'roles_master';

    protected $fillable = ['title', 'code', 'description', 'heirarchy', 'group_order', 'type', 'category'];

}