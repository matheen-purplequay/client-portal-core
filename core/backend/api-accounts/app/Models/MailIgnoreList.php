<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MailIgnoreList extends Model
{
    use HasFactory;

    protected $table = 'mail_ignore_list';

    protected $fillable = ['user_id', 'created_at', 'updated_at'];
}
