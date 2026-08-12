<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientReminders extends Model
{
    use HasFactory;

    protected $table = 'client_reminders';

    protected $fillable = ['user_id', 'when', 'reminder', 'created_by'];
}
