<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobRating extends Model
{
    use HasFactory;
    protected $connection = 'wm_mysql';

    protected $table = 'tbl_jobrating';

    protected $fillable = ['rid', 'job_id', 'job_quality_rating', 'presentation_rating', 'tat_rating', 'overall_comments'];
}
