<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterCompany extends Model
{
    use HasFactory;
    
    protected $table = 'master_company';
    
    protected $fillable = ['name', 'short_name', 'description', 'company_logo', 'fallback_logo'];
}
