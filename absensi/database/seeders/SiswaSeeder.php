<?php

namespace Database\Seeders;

use App\Models\Kelas;
use Illuminate\Database\Seeder;
use App\Models\Siswa;

class SiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Cari dulu data kelas "XI TKJ 1"
        $kelas_tkj_1 = Kelas::where('nama_kelas', '10-TKJ')->first();

        // 2. Jika kelas itu DITEMUKAN...
        if ($kelas_tkj_1) {
            // 3. ...baru kita buat siswa menggunakan ID-nya
            Siswa::create([
                'kelas_id' => $kelas_tkj_1->id, // <-- Gunakan ID yang pasti benar
                'nis' => '12345',
                'nama_siswa' => 'Anton Wijaya',
                'no_hp' => '6281200001111'
            ]);
            Siswa::create([
                'kelas_id' => $kelas_tkj_1->id, // <-- Gunakan ID yang pasti benar
                'nis' => '12346',
                'nama_siswa' => 'Budi Prasetiyo',
                'no_hp' => '6281200002222'
            ]);
        }

        // 4. Ulangi untuk kelas "XI TKJ 2"
        $kelas_tkr = Kelas::where('nama_kelas', '10-TKR')->first();
        if ($kelas_tkr) {
            Siswa::create([
                'kelas_id' => $kelas_tkr->id,
                'nis' => '12347',
                'nama_siswa' => 'Citra Lestari',
                'no_hp' => '6281200003333'
            ]);
            Siswa::create([
                'kelas_id' => $kelas_tkr->id,
                'nis' => '12348',
                'nama_siswa' => 'Dewi Anggraini',
                'no_hp' => '6281200004444'
            ]);
        }
        
        // (Tambahkan kelas lain jika perlu)
    }
    
}
