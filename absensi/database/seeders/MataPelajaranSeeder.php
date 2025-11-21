<?php

namespace Database\Seeders;

use App\Models\MataPelajaran;
use Illuminate\Database\Seeder;

class MataPelajaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        MataPelajaran::create([
            'kode_mapel' => 'MAT101',
            'nama_mapel' => 'Matematika Dasar',
        ]);
        MataPelajaran::create([
            'kode_mapel' => 'BIO101',
            'nama_mapel' => 'Biologi Umum',
        ]);
        MataPelajaran::create([
            'kode_mapel' => 'FIS101',
            'nama_mapel' => 'Fisika Dasar',
        ]);
    }
}
