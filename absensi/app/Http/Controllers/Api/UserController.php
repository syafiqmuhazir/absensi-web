<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    //
    public function index()
    {
        $users = User::with('guru')->get();
        return response()->json($users);
    }

    public function show(User $user)
    {
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:6',
            'guru_id' => 'required|exists:gurus,id|unique:users,guru_id',
            'role'     => 'required|in:admin,guru',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create($validator->validated());

        return response()->json(['message' => 'User berhasil dibuat', 'data' => $user->load('guru')], 201);
    }

    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'guru_id' => ['required',
                           'exists:gurus,id',
                           Rule::unique('users')->ignore($user->id),],
            'username' => [
                'required',
                'string',
                // Unik, tapi boleh sama dengan username user ini sendiri
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:6', // Password boleh kosong
            'role'     => 'required|in:admin,guru',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if(empty($data['password'])) {
            // Jika password kosong, jangan diupdate
            unset($data['password']);
        }

        $user->update($data);

        return response()->json(['message' => 'User berhasil diperbarui', 'data' => $user->load('guru')]);
    }

    /**
     * Menghapus data user.
     */
    public function destroy(User $user)
    {
        try {
            $user->tokens()->delete(); 

            // 2. Baru hapus user-nya
            $user->delete();

            return response()->json([
                'message' => 'User berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus user',
                'error' => $e->getMessage() // Kirim pesan error asli ke frontend
            ], 500);
        }
    }
}
