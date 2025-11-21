<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MataPelajaranController extends Controller
{
    //
    public function index()
    {
        //ambil data mata pelajaran
        $mataPelajaran = MataPelajaran::all();
        
        return response()->json($mataPelajaran);
    }

    public function show(MataPelajaran $mataPelajaran)
    {
        return response()->json($mataPelajaran);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_mapel' => 'required|string',
            'kode_mapel' => 'required|string|unique:mata_pelajarans,kode_mapel',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mataPelajaran = MataPelajaran::create($validator->validated());

        return response()->json([
            'message' => 'Mata pelajaran berhasil ditambahkan',
            'data' => $mataPelajaran
        ], 201);
    }

    public function update(Request $request, MataPelajaran $mataPelajaran)
    {
        $validator = Validator::make($request->all(), [
            'nama_mapel' => 'sometimes|required|string',
            'kode_mapel' => 'sometimes|required|string|unique:mata_pelajarans,kode_mapel,' . $mataPelajaran->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mataPelajaran->update($validator->validated());

        return response()->json([
            'message' => 'Mata pelajaran berhasil diperbarui',
            'data' => $mataPelajaran
        ]);
    }

    public function destroy(MataPelajaran $mataPelajaran)
    {
        if ($mataPelajaran->jurnalSesis()->count() > 0) {
            return response()->json([
                'message' => 'Gagal menghapus. Mata pelajaran ini sudah pernah digunakan dalam absensi.'
            ], 422);
        }
        
        $mataPelajaran->delete();

        return response()->json(['message' => 'Mata pelajaran berhasil dihapus']);
    }
}
