<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class KelasController extends Controller
{
    //
    public function index()
    {
        //ambil data kelas
        $kelas = Kelas::latest()->paginate(10);

        if (count($kelas) === 0) {
            return response()->json(['message' => 'Data kelas tidak ditemukan'], 404);
        }
        return response()->json($kelas);
    }

    public function getKelasByTingkat($tingkat)
    {
        $kelas = Kelas::where('tingkat', $tingkat)->get();

        if ($kelas->isEmpty()) {
            return response()->json(['message' => 'Kelas dengan tingkat tersebut tidak ditemukan'], 404);
        }

        return response()->json($kelas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'nama_kelas' => 'required|string|unique:kelas,nama_kelas',
            'tingkat' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $kelas = Kelas::create($validator->validate());

        return response()->json(['message' => 'Kelas berhasil ditambahkan', 
        'data' => $kelas], 201);
    }

    public function show(Kelas $kelas)
    {
        return response()->json($kelas);
    }

    public function update(Request $request, Kelas $kelas)
    {
        $validator = Validator::make($request->all(), [
            'nama_kelas' => [
                'required',
                'string',
                'max:255',
                Rule::unique('kelas')->ignore($kelas->id), // Unik, kecuali untuk dirinya sendiri
            ],
            'tingkat' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $kelas->update($validator->validated());

        return response()->json(['message' => 'Kelas berhasil diperbarui', 
        'data' => $kelas]);
    }

    public function destroy(Kelas $kelas)
    {
        if ($kelas->siswas()->count() > 0) {
            return response()->json(['message' => 'Gagal menghapus kelas, masih terdapat siswa di kelas ini'], 500);
        }
        $kelas->delete();
        return response()->json([
            'message' => 'Kelas berhasil dihapus'
        ]);
    }
}
