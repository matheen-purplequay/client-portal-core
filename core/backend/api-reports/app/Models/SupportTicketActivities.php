<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicketActivities extends Model
{
    use HasFactory;

    protected $table = 'support_tickets_activities';

    protected $fillable = ['support_ticket_id',  'message', 'created_by'];
}
