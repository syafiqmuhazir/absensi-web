<?php

namespace App\Http\Controllers\Api;

use App\Exports\RekapAbsensiAdminExport;
use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class LaporanController extends Controller
{
    /**
     * 1. REKAP HARIAN (Daftar siswa tidak masuk pada tanggal tertentu)
     */
    public function rekapHarian(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
        ]);

        $tanggal = $request->tanggal;

        // Ambil data absensi pada tanggal tersebut yang statusnya BUKAN 'Hadir'
        $absensi = Absensi::whereHas('jurnalSesi', function($q) use ($tanggal) {
                $q->whereDate('tanggal', $tanggal);
            })
            ->where('status', '!=', 'Hadir') // Hanya cari yang Sakit, Izin, Alpha
            ->with(['siswa.kelas', 'jurnalSesi.mataPelajaran']) // Load relasi
            ->get()
            ->map(function($item) {
                return [
                    'nama_siswa' => $item->siswa->nama_siswa,
                    'kelas'      => $item->siswa->kelas->nama_kelas,
                    'mapel'      => $item->jurnalSesi->mataPelajaran->nama_mapel,
                    'jam_ke'     => $item->jurnalSesi->sesi, // atau jam_ke
                    'status'     => $item->status,
                    'keterangan' => $item->keterangan
                ];
            });

        return response()->json($absensi);
    }

    /**
     * 2. REKAP MATRIX BULANAN (Tabel Tanggal 1-31)
     */
    public function rekapMatrix(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'bulan'    => 'required|numeric',
            'tahun'    => 'required|numeric'
        ]);

        $kelasId = $request->kelas_id;
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        // A. Ambil semua siswa di kelas ini
        $siswas = Siswa::where('kelas_id', $kelasId)->orderBy('nama_siswa')->get();

        // B. Ambil semua data absensi kelas ini di bulan tersebut
        $absensiRecords = Absensi::whereHas('jurnalSesi', function($q) use ($kelasId, $bulan, $tahun) {
            $q->where('kelas_id', $kelasId)
              ->whereMonth('tanggal', $bulan)
              ->whereYear('tanggal', $tahun);
        })->with('jurnalSesi')->get();

        // C. Format Data untuk Matrix
        // Kita butuh struktur: data[siswa_id][tanggal] = 'S';
        $matrixData = [];
        foreach ($absensiRecords as $record) {
            $tgl = (int) date('d', strtotime($record->jurnalSesi->tanggal));
            $sid = $record->siswa_id;
            
            // Ambil huruf depan status (H, S, I, A)
            $kode = substr($record->status, 0, 1); 
            
            // Simpan ke array matrix
            // Jika dalam 1 hari ada 2 mapel dan status beda, kita ambil yang terburuk (Alpha > Izin > Sakit > Hadir) 
            // (Sederhananya kita ambil record terakhir saja untuk tutorial ini)
            $matrixData[$sid][$tgl] = $kode;
        }

        return response()->json([
            'siswas' => $siswas,
            'matrix' => $matrixData
        ]);
    }

    /**
     * 3. REKAP INDIVIDU (Detail per siswa)
     */
    public function rekapSiswa(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'bulan'    => 'required|numeric',
            'tahun'    => 'required|numeric'
        ]);

        $siswaId = $request->siswa_id;
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $siswa = Siswa::with('kelas')->find($siswaId);

        // Ambil detail absensi (Join ke Jurnal untuk dapat Mapel & Tanggal)
        $detail = Absensi::where('siswa_id', $siswaId)
            ->whereHas('jurnalSesi', function($q) use ($bulan, $tahun) {
                $q->whereMonth('tanggal', $bulan)
                  ->whereYear('tanggal', $tahun);
            })
            ->with(['jurnalSesi.mataPelajaran', 'jurnalSesi.guru'])
            ->latest()
            ->get()
            ->map(function($item) {
                return [
                    'tanggal' => $item->jurnalSesi->tanggal,
                    'mapel'   => $item->jurnalSesi->mataPelajaran->nama_mapel,
                    'guru'    => $item->jurnalSesi->guru->nama_guru,
                    'jam'     => $item->jurnalSesi->sesi,
                    'status'  => $item->status,
                    'ket'     => $item->keterangan
                ];
            });

        // Hitung Statistik
        $stats = [
            'Hadir' => $detail->where('status', 'Hadir')->count(),
            'Sakit' => $detail->where('status', 'Sakit')->count(),
            'Izin'  => $detail->where('status', 'Izin')->count(),
            'Alpa'  => $detail->where('status', 'Alpa')->count(),
        ];

        return response()->json([
            'siswa'  => $siswa,
            'stats'  => $stats,
            'detail' => $detail
        ]);
    }

    public function exportExcel(Request $request)
{
    $request->validate([
        'kelas_id' => 'required',
        'bulan'    => 'required',
        'tahun'    => 'required'
    ]);

    return Excel::download(new RekapAbsensiAdminExport(
        $request->kelas_id,
        $request->bulan,
        $request->tahun
    ), 'rekap_admin.xlsx');
}
}
