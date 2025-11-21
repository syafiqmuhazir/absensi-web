<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GuruController extends Controller
{
    //
    public function index()
    {
        $gurus = Guru::with('users')->latest()->paginate(10);

        if (count($gurus) === 0) {
            return response()->json(['message' => 'Data guru tidak ditemukan'], 404);
        }
        return response()->json($gurus);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_guru' => 'required|string',
            'nip' => 'nullable|string|unique:gurus,nip',
            'no_hp' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guru = Guru::create($validator->validated());

        return response()->json(['message' => 'Guru berhasil ditambahkan', 
        'data' => $guru], 201);
    }

    public function show(Guru $guru)
    {
        return response()->json($guru);
    }

    public function update(Request $request, Guru $guru)
    {
        $validator = Validator::make($request->all(), [
            'nama_guru' => 'sometimes|required|string',
            'nip' => 'sometimes|nullable|string|unique:gurus,nip,' . $guru->id,
            'no_hp' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guru->update($validator->validated());

        return response()->json(['message' => 'Guru berhasil diperbarui', 
        'data' => $guru]);
    }

    public function destroy(Guru $guru)
    {
        // Hapus user yang terhubung (jika ada)
        if ($guru->user) {
            $guru->user->delete();
        }
        
        $guru->delete();

        return response()->json([
            'message' => 'Guru berhasil dihapus'
        ], 200);
    }
}
