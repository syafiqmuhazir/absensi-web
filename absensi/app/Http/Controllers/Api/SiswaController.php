<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

use Maatwebsite\Excel\Facades\Excel;
use App\Imports\SiswaImport;

class SiswaController extends Controller
{
    //
    public function import(Request $request)
    {
        // 1. Validasi File
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        try {
            // 2. Jalankan Proses Import
            Excel::import(new SiswaImport, $request->file('file'));

            return response()->json([
                'message' => 'Data siswa berhasil diimport!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal import data. Pastikan format Excel benar.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function index(Request $request)
    {
        // Mulai Query
        $query = Siswa::with('kelas')->latest();

        // 1. Filter Search (Nama/NIS)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_siswa', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        // 2. Filter Kelas (BARU)
        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Ambil data (paginate)
        return response()->json($query->paginate(10));
    }

    public function getSiswaByKelasId(Kelas $kelas)
    {
        //
        if (!$kelas) {
            return response()->json(['message' => 'Kelas not found'], 404);
        }
        return response()->json($kelas->siswas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_siswa' => 'required|string|max:255',
            'nis'        => 'required|string|unique:siswas,nis',
            'kelas_id'   => 'required|exists:kelas,id',
            'no_hp' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $siswa = Siswa::create($validator->validated());

        return response()->json([
            'message' => 'Siswa berhasil ditambahkan',
            'data' => $siswa->load('kelas')
        ], 201);
    }

    public function show(Siswa $siswa)
    {
        return response()->json($siswa);
    }

    public function update(Request $request, Siswa $siswa)
    {
        $validator = Validator::make($request->all(), [
            'nama_siswa' => 'sometimes|required|string|max:255',
            'nis'        => [
                'required',
                'string',
                Rule::unique('siswas')->ignore($siswa->id), // Unik, kecuali untuk dirinya sendiri
            ],
            'kelas_id'   => 'sometimes|required|exists:kelas,id',
            'no_hp' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $siswa->update($validator->validated());

        return response()->json([
            'message' => 'Siswa berhasil diperbarui',
            'data' => $siswa->load('kelas')
        ]);
    }

    public function destroy(Siswa $siswa)
    {
        try {

            // 1. HAPUS DATA TERKAIT DULU (PENTING!)
            // Hapus semua absensi milik siswa ini agar tidak error Foreign Key
            $siswa->absensis()->delete(); 

            // 2. BARU HAPUS SISWANYA
            $siswa->delete();

            return response()->json(['message' => 'Siswa berhasil dihapus'], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus siswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
