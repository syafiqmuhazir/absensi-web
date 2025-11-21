<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_kelas',
        'tingkat',
    ];

    public function jurnalSesis()
    {
        return $this->hasMany(JurnalSesi::class);
    }

    public function siswas()
    {
        return $this->hasMany(Siswa::class);
    }
}
