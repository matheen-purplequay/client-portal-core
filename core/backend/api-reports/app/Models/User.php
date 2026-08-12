<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Model implements Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
    
    protected $connection = 'accounts_mysql';
    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];


   // Implement the required methods
   public function getAuthIdentifierName()
   {
       return 'id'; // Change this to the actual column name used for the user's unique identifier
   }

   public function getAuthIdentifier()
   {
       return $this->getKey();
   }

   public function getAuthPassword()
   {
       return $this->password;
   }

   public function getRememberToken() {
        return $this->remember_token;
   }
    public function setRememberToken($value) {
        $this->remember_token = $value;
        $this->save();
    }
    public function getRememberTokenName() {}
}
