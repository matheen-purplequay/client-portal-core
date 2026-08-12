<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgreedsMonth extends Model
{
    use HasFactory;

    protected $fillable = ['month', 'year', 'number_of_jobs', 'project_id'];

}
