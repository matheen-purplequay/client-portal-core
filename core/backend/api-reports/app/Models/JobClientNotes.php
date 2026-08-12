<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobClientNotes extends Model
{
    use HasFactory;
    
    protected $table = "job_client_notes";
    
    protected $fillable = [
        'id', 'project_id', 'user_id', 'client_id', 'notes', 'is_deleted', 'created_at', 'updated_at'
    ];
}
