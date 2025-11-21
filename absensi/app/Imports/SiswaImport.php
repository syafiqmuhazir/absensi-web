<?php

namespace App\Imports;

use App\Models\Siswa;
use App\Models\Kelas;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SiswaImport implements ToModel, WithHeadingRow
{
    /**
    * Fungsi ini akan dijalankan untuk SETIAP baris di Excel
    */
    public function model(array $row)
    {
        // 1. Cari ID Kelas berdasarkan Nama Kelas di Excel (misal "XI TKJ 1")
        $kelas = Kelas::where('nama_kelas', $row['kelas'])->first();

        // Jika kelas tidak ditemukan di database, lewati baris ini (return null)
        if (!$kelas) {
            return null;
        }

        // 2. Buat Data Siswa
        return new Siswa([
            'nama_siswa'      => $row['nama_siswa'],      // Sesuai header Excel
            'nis'             => $row['nis'],             // Sesuai header Excel
            'kelas_id'        => $kelas->id,              // Pakai ID dari hasil pencarian
            'no_hp'           => $row['no_hp'] ?? null,
        ]);
    }
}