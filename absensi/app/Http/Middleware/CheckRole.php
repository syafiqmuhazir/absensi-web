<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     * @param string $role
     */
    public function handle(Request $request, Closure $next, $role)
    {
        if(!Auth::check() || $request->user()->role !== $role){
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
