<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeletedReports extends Model
{
    use HasFactory;

    protected $table = 'deleted_reports';

    protected $illable = ['client_id', 'name','month','year', 'file', 'status', 'uploaded_by', 'approved_by', 'rejected_by', 'reason'];
}
