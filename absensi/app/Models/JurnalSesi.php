<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JurnalSesi extends Model
{
    use HasFactory;

    protected $fillable = [
        'guru_id',
        'kelas_id',
        'mata_pelajaran_id',
        'tanggal',
        'sesi',
        'topik_pembelajaran',
    ];

    public function guru()
    {
        return $this->belongsTo(Guru::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class);
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class);
    }
}
