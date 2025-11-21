<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        User::create([
            'guru_id' => 1,
            'username' => 'ahmadfauzi',
            'password' => 'password123',
            'role' => 'guru',
        ]);
        User::create([
            'guru_id' => 2,
            'username' => 'sitiaminah',
            'password' => 'password123',
            'role' => 'guru',
        ]);
        User::create([
            'guru_id' => 3,
            'username' => 'budisantoso',
            'password' => 'password123',
            'role' => 'guru',
        ]);
        User::create([
            'guru_id' => 4,
            'username' => 'admin',
            'password' => 'adminpass',
            'role' => 'admin',
        ]);
    }
}
