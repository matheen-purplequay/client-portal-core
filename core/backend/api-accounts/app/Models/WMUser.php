<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WMUser extends Model
{
    use HasFactory;
    
    protected $connection = 'wm_mysql';
    
    protected $table = 'user';
    
    protected $fillable = ['Uid', 'Usename', 'NewOfficialEmailID', 'TLID', 'TeamID', 'Employeeid'];
}
