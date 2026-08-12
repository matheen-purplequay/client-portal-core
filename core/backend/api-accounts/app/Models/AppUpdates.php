<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppUpdates extends Model
{
    use HasFactory;

    protected $table = 'app_updates';

    protected $fillable = [
        'id',
        'app_id',
        'sub_app_id',
        'title',
        'notes',
        'major_version',
        'minor_version',
        'is_approved',
        'is_active',
        'created_at',
        'updated_at '
    ];
}
