<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientPortalNotifications extends Model
{
    use HasFactory;

    protected $connection = 'accounts_mysql';

    protected $table = 'client_portal_notifications';

    protected $fillable = [
        'id',
        'app_id',
        'sub_app_id',
        'user_id',
        'type',
        'action_title',
        'action_url',
        'title',
        'body',
        'notification_sent',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at'
    ];
}
