<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NetworkLimitRequest extends Model
{
    use HasFactory;

    protected $table = 'network_limit_increase_requests';

    protected $fillable = [
        'id',
        'user_id',
        'preferred_limit'
    ];
}
