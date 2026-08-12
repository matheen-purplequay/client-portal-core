<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Contracts\Role;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    protected $connection = 'mysql';

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'password',
        'phone',
        'login_attempts',
        'last_login_attempt',
        'next_login_attempt',
        'created_at',
        'updated_at'
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

    public function role() {
        return $this->belongsToMany(Roles::class);
    }

    // Define the "apps" relationship
    public function app()
    {
        return $this->belongsTo(App::class, 'app_id');
    }

    public function userDetails()
    {
        return $this->hasOne(UserDetails::class, 'user_id', 'id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // Override the assignRole method to associate roles with the app
    public function assignRole($role)
    {
        if ($this->app) {
            // Assign the role to the user within the app context
            $role = Role::where('name', $role)->where('app_id', $this->app_id)->first();
            if ($role) {
                $this->roles()->sync([$role->id], false);
            }
        }
    }

    // Override the revokeRole method to revoke roles within the app context
    public function revokeRole($role)
    {
        if ($this->app) {
            $role = Role::where('name', $role)->where('app_id', $this->app_id)->first();
            if ($role) {
                $this->roles()->detach($role->id);
            }
        }
    }

    public function approvers()
    {
        return $this->hasMany(QueryApprovers::class, 'user_id', 'id');
    }
}
