<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueryTemplates extends Model
{
    use HasFactory;
    
    protected $connection = 'wm_mysql';

    protected $table = 'tbl_query_templates';
    
    protected $fillable = [
        'query_template_code', 'job_stage_id', 'title', 
        'query', 'category_id', 'sub_category_id', 'criticality_id', 'response_type',
        'project_id'
    ];
}
