<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientTestUser extends Model
{
    use HasFactory;
    
    protected $connection = 'mysql';
        
    protected $table = 'client_test_users';
    
    protected $fillable = ['id', 'user_id', 'company_id', 'role_id'];
}
