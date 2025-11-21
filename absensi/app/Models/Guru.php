<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_guru',
        'nip',
        'no_hp',
    ];

    public function jurnalSesis()
    {
        return $this->hasMany(JurnalSesi::class);
    }

    public function users()
    {
        return $this->hasOne(User::class);
    }
}


