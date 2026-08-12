<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    public function base(): View
    {
        return view('auth.loginapi');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(RouteServiceProvider::HOME);
    }


    /**
     * Handle token request.
     */
    public function autoLogin(Request $request)
    {
        // Get the JWT token from the request (you may need to adjust this depending on how the token is sent).
        $token = $request->input('jwt_token');

        if (!$token) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        try {
            // Attempt to authenticate the user using the JWT token.
            if (Auth::guard('api')->onceUsingId(auth()->user()->id)) {
                // Authentication succeeded.
                return response()->json(['message' => 'Auto-login successful']);
            } else {
                // Authentication failed.
                return response()->json(['message' => 'Auto-login failed'], 401);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Auto-login failed'], 401);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
