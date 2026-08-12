<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyFrontendOrigin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = [
            'https://clientportal.carisma-solutions.com.au',
            'https://clientportal.purplequay.com.au',
            'https://admin-clientportal.purplequay.com.au',
            'https://clientqueryapi.purplequay.com.au',
            'https://deliveryportal.purplequay.com',
            'https://admin-deliveryportal.purplequay.com',
            'http://localhost:8002',
            'http://localhost:8003',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://172.16.29.45',
            'http://172.16.29.11',
            'https://cp-api-queries.purplequay.com'
        ];

        $origin = $request->headers->get('origin');
        $referer = $request->headers->get('referer');

        $isValid = false;

        foreach ($allowedOrigins as $allowedOrigin) {
            if (
                (!empty($origin) && str_starts_with($origin, $allowedOrigin)) ||
                (!empty($referer) && str_starts_with($referer, $allowedOrigin))
            ) {
                $isValid = true;
                break;
            }
        }

        if (!$isValid) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        return $next($request);
    }
}
