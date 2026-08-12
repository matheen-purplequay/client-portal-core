<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teams extends Model
{
    use HasFactory;
    
    protected $table = 'teams';
    
    
    protected $fillable = ['client_id', 'name', 'wm_user_id', 'user_id', 'role_id', 'email', 'status', 'heirarchy'];
}
