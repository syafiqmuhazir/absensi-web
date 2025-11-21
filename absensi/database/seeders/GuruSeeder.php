<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Guru;

class GuruSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        Guru::create([
            'nama_guru' => 'Ahmad Fauzi',
            'nip' => '1987654321',
            'no_hp' => '081234567890',
        ]);
        Guru::create([
            'nama_guru' => 'Siti Aminah',
            'nip' => '1987654322',
            'no_hp' => '081234567891',
        ]);
        Guru::create([
            'nama_guru' => 'Budi Santoso',
            'nip' => '1987654323',
            'no_hp' => '081234567892',
        ]);
        Guru::create([
            'nama_guru' => 'Syafiq Muhazir',
            'nip' => '1987654324',
            'no_hp' => '081234567893',
        ]);
    }
}
