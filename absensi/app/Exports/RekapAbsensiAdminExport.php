<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use App\Models\Siswa;
use App\Models\Absensi;
use App\Models\Kelas;

class RekapAbsensiAdminExport implements FromView, ShouldAutoSize
{
    protected $kelasId, $bulan, $tahun;

    public function __construct($kelasId, $bulan, $tahun)
    {
        $this->kelasId = $kelasId;
        $this->bulan = $bulan;
        $this->tahun = $tahun;
    }

    public function view(): View
    {
        // 1. Ambil Data Kelas
        $kelas = Kelas::find($this->kelasId);

        // 2. Ambil Siswa
        $siswas = Siswa::where('kelas_id', $this->kelasId)->orderBy('nama_siswa')->get();

        // 3. Ambil Data Absensi (Logic Matrix Bulanan)
        $absensiRecords = Absensi::whereHas('jurnalSesi', function($q) {
            $q->where('kelas_id', $this->kelasId)
              ->whereMonth('tanggal', $this->bulan)
              ->whereYear('tanggal', $this->tahun);
        })->with('jurnalSesi')->get();

        // 4. Format Matrix
        $matrixData = [];
        foreach ($absensiRecords as $record) {
            $tgl = (int) date('d', strtotime($record->jurnalSesi->tanggal));
            // Ambil kode status terakhir (jika ada tumpang tindih, ambil yang terakhir input)
            $matrixData[$record->siswa_id][$tgl] = substr($record->status, 0, 1);
        }

        // Nama Bulan Indonesia
        $namaBulan = \Carbon\Carbon::create()->month($this->bulan)->locale('id')->monthName;

        // Kita gunakan View yang SAMA dengan Guru, tapi field Guru/Mapel kita strip (-)
        return view('exports.rekap_bulanan', [
            'siswas' => $siswas,
            'matrix' => $matrixData,
            'days'   => cal_days_in_month(CAL_GREGORIAN, $this->bulan, $this->tahun),
            'bulan'  => $namaBulan,
            'tahun'  => $this->tahun,
            'nama_guru'  => 'Wali Kelas / Admin', // Placeholder
            'nama_mapel' => 'Rekapitulasi Kelas ' . $kelas->nama_kelas, // Info Kelas
        ]);
    }
}