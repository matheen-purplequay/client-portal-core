<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhitelistIPs extends Model
{
    use HasFactory;

    protected $connection = 'accounts_mysql';

    protected $table = 'whitelist_ips';

    protected $fillable = [
        'id',
        'user_id',
        'ipv4_address',
        'ipv6_address',
        'network_name',
        'device_info',
        'allow_notification',
        'status'
    ];
}
