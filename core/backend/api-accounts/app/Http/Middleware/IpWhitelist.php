<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IpWhitelist
{
    // List of allowed IPs (add as needed)
    private $whitelistedIps = [
        '127.0.0.1',      // localhost
        '192.168.1.100',  // example internal IP
        '203.0.113.45',   // your real external IP
    ];
    
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $clientIp = $request->ip();

        if (!in_array($clientIp, $this->whitelistedIps)) {
            return response()->json([
                'message' => 'Access denied for IP: ' . $clientIp,
            ], 403);
        }

        return $next($request);
    }
}
