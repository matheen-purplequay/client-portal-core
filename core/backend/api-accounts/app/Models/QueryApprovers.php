<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueryApprovers extends Model
{
    use HasFactory;

    protected $connection = 'wm_mysql';

    protected $table = 'tbl_query_approvers';

    protected $fillable = [
        'user_id', 'client_id'
    ];

    public function userDetail()
    {
        return $this->belongsTo(UserDetails::class, 'user_id', 'user_id');
    }
}
