<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDetails extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = ['user_id', 'wm_user_id'. 'company_id', 'role', 'role_id', 'hide_in_selection'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
