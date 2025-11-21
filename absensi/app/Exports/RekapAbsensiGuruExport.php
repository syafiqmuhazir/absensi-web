<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use App\Models\Siswa;
use App\Models\Absensi;

class RekapAbsensiGuruExport implements FromView, ShouldAutoSize
{
    protected $guruId, $kelasId, $mapelId, $bulan, $tahun;

    public function __construct($guruId, $kelasId, $mapelId, $bulan, $tahun)
    {
        $this->guruId = $guruId;
        $this->kelasId = $kelasId;
        $this->mapelId = $mapelId;
        $this->bulan = $bulan;
        $this->tahun = $tahun;
    }

    public function view(): View
    {
        // 1. Ambil Data Detail Guru & Mapel
        $guru  = \App\Models\Guru::find($this->guruId);
        $mapel = \App\Models\MataPelajaran::find($this->mapelId);
        
        // Ambil Siswa
        $siswas = Siswa::where('kelas_id', $this->kelasId)->orderBy('nama_siswa')->get();

        // Ambil Data Absensi
        $absensiRecords = Absensi::whereHas('jurnalSesi', function($q) {
            $q->where('guru_id', $this->guruId)
              ->where('kelas_id', $this->kelasId)
              ->where('mata_pelajaran_id', $this->mapelId)
              ->whereMonth('tanggal', $this->bulan)
              ->whereYear('tanggal', $this->tahun);
        })->with('jurnalSesi')->get();

        // Format Matrix
        $matrixData = [];
        foreach ($absensiRecords as $record) {
            $tgl = (int) date('d', strtotime($record->jurnalSesi->tanggal));
            $matrixData[$record->siswa_id][$tgl] = substr($record->status, 0, 1);
        }

        // Konversi Angka Bulan ke Nama Indonesia
        $namaBulan = \Carbon\Carbon::create()->month($this->bulan)->locale('id')->monthName;

        return view('exports.rekap_bulanan', [
            'siswas' => $siswas,
            'matrix' => $matrixData,
            'days'   => cal_days_in_month(CAL_GREGORIAN, $this->bulan, $this->tahun),
            'bulan'  => $namaBulan, // Kirim nama bulan (contoh: November)
            'tahun'  => $this->tahun,
            'nama_guru'  => $guru->nama_guru,   // <-- Kirim Nama Guru
            'nama_mapel' => $mapel->nama_mapel, // <-- Kirim Nama Mapel
        ]);
    }
}