<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // Find the user by email
        $user = \App\Models\User::find(1)->first();
        return ['User ', $user];
        // $token = $user->createToken('authToken')->plainTextToken;

        // return response()->json(['token' => $token], 200);
    }
}
