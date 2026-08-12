<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactFormRecipients extends Model
{
    use HasFactory;
    protected $table = 'contact_form_recipients';
    protected $fillable = ['client_id', 'email_to', 'email_cc'];
}
