<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeedbackStatus extends Model
{
    use HasFactory;

    protected $connection = 'wm_mysql';

    protected $table = 'tbl_dashboardfeedback';

    protected $fillable = ['id', 'Aid', 'UserId', 'Pid', 'ProcessArea', 'Date', 'SubProcessArea', 'Feedback', 'DTComments', 'FeedbackStatus', 'Status'];
}
