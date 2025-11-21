<?php

namespace App\Http\Controllers\Api;

use App\Exports\RekapAbsensiGuruExport;
use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\JurnalSesi;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class JurnalSesiController extends Controller
{
    //

   public function index(Request $request)
    {
        $user = $request->user();
        $query = JurnalSesi::with(['guru', 'kelas', 'mataPelajaran'])->latest();

        if ($user->role !== 'admin') {
            $query->where('guru_id', $user->guru_id);
        }

        // GUNAKAN INI (Pagination):
        $jurnals = $query->paginate(10); 

        return response()->json($jurnals);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'sesi' => 'required|string',
            'tanggal' => 'required|date',
            'topik_pembelajaran' => 'required|string',
        ]);

        //ambil id guru dari user yang sedang login
        $guru_id = Auth::user()->guru_id;

        $jurnalsesi = JurnalSesi::create([
            'guru_id' => $guru_id,
            'kelas_id' => $data['kelas_id'],
            'mata_pelajaran_id' => $data['mata_pelajaran_id'],
            'tanggal' => $data['tanggal'],
            'sesi' => $data['sesi'],
            'topik_pembelajaran' => $data['topik_pembelajaran'],
        ]);

        return response()->json(['message' => 'Jurnal sesi disimpan', 
        'jurnal_sesi_id' => $jurnalsesi->id], 201);

    }

    /**
     * Rekap Detail Matrix (Tanggal 1-31) per Kelas & Mapel untuk Guru
     */
    public function rekapDetailGuru(Request $request)
    {
        $request->validate([
            'bulan'    => 'required|numeric',
            'tahun'    => 'required|numeric',
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
        ]);

        $user = $request->user();
        $guruId = $user->guru_id;

        // 1. Ambil semua siswa di kelas yang dipilih
        $siswas = Siswa::where('kelas_id', $request->kelas_id)
                    ->orderBy('nama_siswa')
                    ->get();

        // 2. Ambil data absensi yang:
        // - Dimiliki oleh Guru ini
        // - Di Kelas ini
        // - Di Mapel ini
        // - Di Bulan/Tahun ini
        $absensiRecords = Absensi::whereHas('jurnalSesi', function($q) use ($guruId, $request) {
            $q->where('guru_id', $guruId)
              ->where('kelas_id', $request->kelas_id)
              ->where('mata_pelajaran_id', $request->mata_pelajaran_id)
              ->whereMonth('tanggal', $request->bulan)
              ->whereYear('tanggal', $request->tahun);
        })->with('jurnalSesi')->get();

        // 3. Format Data Matrix: data[siswa_id][tanggal] = 'H/S/I/A'
        $matrixData = [];
        foreach ($absensiRecords as $record) {
            $tgl = (int) date('d', strtotime($record->jurnalSesi->tanggal));
            $sid = $record->siswa_id;
            // Ambil huruf depan (H, S, I, A)
            $matrixData[$sid][$tgl] = substr($record->status, 0, 1);
        }

        return response()->json([
            'siswas' => $siswas,
            'matrix' => $matrixData
        ]);
    }

    public function exportExcel(Request $request)
{
    $user = $request->user();
    
    return Excel::download(new RekapAbsensiGuruExport(
        $user->guru_id,
        $request->kelas_id,
        $request->mata_pelajaran_id,
        $request->bulan,
        $request->tahun
    ), 'rekap_absensi.xlsx');
}
}
