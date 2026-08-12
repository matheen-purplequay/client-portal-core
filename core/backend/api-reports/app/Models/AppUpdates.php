<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppUpdates extends Model
{
    use HasFactory;

    protected $connection = 'accounts_mysql';

    protected $table = 'app_updates';
}
