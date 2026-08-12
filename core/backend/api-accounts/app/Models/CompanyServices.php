<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyServices extends Model
{
    use HasFactory;
    
    protected $table = 'company_services';
    
    protected $fillable =  ['client_id', 'service_id', 'engagement_id', 'order_number', 'is_active', 'created_by', 'updated_by'];
}
