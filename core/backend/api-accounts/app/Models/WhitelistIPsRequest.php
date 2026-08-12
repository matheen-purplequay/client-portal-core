<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhitelistIPsRequest extends Model
{
    use HasFactory;

    protected $table = 'whitelist_ip_requests';

    protected $fillable = [
        'client_id',
        'old_ipv4_address',
        'new_ipv4_address',
        'network_name',
        'status',
        'approved_by'
    ];
}
