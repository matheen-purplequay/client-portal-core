<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientPortalMessages extends Model
{
    use HasFactory;

    protected $connection = 'accounts_mysql';
    protected $table = 'client_portal_messages';
}
