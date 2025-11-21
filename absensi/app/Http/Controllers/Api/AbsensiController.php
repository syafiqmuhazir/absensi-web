<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AbsensiController extends Controller
{
    //

    public function storeBatch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jurnal_sesi_id' => 'required|exists:jurnal_sesis,id',
            'absensi_data' => 'required|array',
            'absensi_data.*.siswa_id' => 'required|exists:siswas,id',
            'absensi_data.*.status' => 'required|in:Hadir,Izin,Sakit,Alpa',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $absensisData = $request->input('absensi_data');
        $jurnalSesiId = $request->input('jurnal_sesi_id');

        // 2. Mulai Database Transaction
        DB::beginTransaction();
        try {
            
            // 3. Loop sebanyak data siswa yang dikirim
            foreach ($absensisData as $data) {
                Absensi::create([
                    'jurnal_sesi_id' => $jurnalSesiId,
                    'siswa_id' => $data['siswa_id'],
                    'status' => $data['status'],
                    'keterangan' => $data['keterangan'] ?? null // Ambil keterangan jika ada
                ]);
            }

            // 4. Jika semua berhasil, simpan permanen
            DB::commit();

            return response()->json([
                'message' => 'Absensi berhasil disimpan'
            ], 201);
        }catch (\Exception $e) {
            // 5. Jika ada 1 saja error, batalkan semua
            DB::rollBack();
            
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage()
            ], 500); // 500 = Server Error
        };
    }
}
