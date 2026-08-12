<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyServices extends Model
{
    use HasFactory;
    protected $connection = 'accounts_mysql';
    protected $table = 'company_services';
    protected $fillable = ['client_id', 'service_id'];
}
