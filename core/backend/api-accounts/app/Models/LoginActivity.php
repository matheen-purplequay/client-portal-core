<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginActivity extends Model
{
    use HasFactory;
    
    protected $table = 'login_activity';
    
    protected $fillable = ['user_id', 'device_info', 'ip_address', 'location', 'login_timestamp', 'local_timestamp'];
}
