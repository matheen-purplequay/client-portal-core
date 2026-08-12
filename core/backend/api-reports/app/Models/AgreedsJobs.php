<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgreedsJobs extends Model
{
    use HasFactory;

    protected $fillable = ['job_name', 'date_received', 'job_status', 'month', 'year', 'project_id'];

}
