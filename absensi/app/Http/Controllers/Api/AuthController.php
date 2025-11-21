<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    //

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'role' => $user->role,
                ],
            ]);
        }

        return response()->json(['message' => 'Username atau Password salah'], 401);
    }

    public function changePassword(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|string|min:6|confirmed', // butuh field 'new_password_confirmation'
        ]);

        $user = Auth::user();

        // 2. Cek apakah password lama benar
        if (!\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai.'
            ], 400);
        }

        // 3. Update Password (otomatis di-hash oleh Mutator di User model)
        $user->update([
            'password' => $request->new_password
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui.'
        ]);
    }
}
