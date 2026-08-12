<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentCodes extends Model
{
    use HasFactory;

    protected $table = 'comment_codes';

    protected $fillable = ['code', 'title', 'description'];
}
