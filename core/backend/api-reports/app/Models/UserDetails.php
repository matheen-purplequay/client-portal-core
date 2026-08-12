<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDetails extends Model
{
    use HasFactory;

    protected $connection = 'accounts_mysql';

    protected $table = 'user_details';

    protected $fillable = ['user_id', 'wm_user_id'. 'company_id', 'role'];
}
