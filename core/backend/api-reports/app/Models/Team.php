<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;
    protected $connection = 'accounts_mysql';
    protected $fillable = ['client_id', 'name', 'wm_user_id', 'role_id' ,'vertical_id', 'email', 'heirarchy'];
}
