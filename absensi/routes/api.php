<?php

use App\Http\Controllers\Api\AbsensiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GuruController;
use App\Http\Controllers\Api\JurnalSesiController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\MataPelajaranController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\UserController;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/login', function () {
    return response()->json([
        'status' => 'error',
        'message' => 'Anda belum login (Unauthorized). Silakan login untuk mendapatkan token.'
    ], 401);
})->name('login'); // <--- PENTING: Harus ada name('login')

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // current authenticated user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // get kelas
    Route::get('/kelas', [KelasController::class, 'index']);
    Route::get('/kelas/{kelas}', [KelasController::class, 'show']);
    Route::get('/kelas/tingkat/{tingkat}', [KelasController::class, 'getKelasByTingkat']);

    // get mata pelajaran
    Route::get('/mata-pelajaran', [MataPelajaranController::class, 'index']);
    Route::get('/mata-pelajaran/{mataPelajaran}', [MataPelajaranController::class, 'show']);

    //get siswa
    Route::get('/siswa', [SiswaController::class, 'index']);
    Route::get('/siswa/{siswa}', [SiswaController::class, 'show']);
    Route::get('/siswa/kelas/{kelas}',[SiswaController::class, 'getSiswaByKelasId']);

    //jurnal sesi
    Route::get('/jurnal-sesi/export', [JurnalSesiController::class, 'exportExcel']);
    Route::get('/jurnal-sesi/rekap-detail', [JurnalSesiController::class, 'rekapDetailGuru']);
    Route::get('/jurnal-sesi', [JurnalSesiController::class, 'index']);
    Route::post('/jurnal-sesi', [JurnalSesiController::class, 'store']);

    // Absensi
    Route::post('/absensi/batch', [AbsensiController::class, 'storeBatch']);

    // get guru
    Route::get('/guru', [GuruController::class, 'index']);

    //  --- RUTE LAPORAN ---
    Route::get('/laporan/rekap-harian', [LaporanController::class, 'rekapHarian']);
    Route::get('/laporan/rekap-matrix', [LaporanController::class, 'rekapMatrix']);
    Route::get('/laporan/rekap-siswa', [LaporanController::class, 'rekapSiswa']);
    Route::get('/laporan/export-matrix', [LaporanController::class, 'exportExcel']);

});

Route::middleware('auth:sanctum', 'role:admin')->group(function () {
    // --- RUTE GURU ---
    Route::post('/guru', [GuruController::class, 'store']); // Membuat guru baru
    Route::get('/guru/{guru}', [GuruController::class, 'show']); // Lihat 1 guru
    Route::put('/guru/{guru}', [GuruController::class, 'update']); // Update 1 guru
    Route::delete('/guru/{guru}', [GuruController::class, 'destroy']); // Hapus 1 guru

    // --- RUTE USER ---
    Route::apiResource('/user', UserController::class);

    // --- RUTE SISWA ---
    Route::post('/siswa', [SiswaController::class, 'store']);
    Route::put('/siswa/{siswa}', [SiswaController::class, 'update']);
    Route::delete('/siswa/{siswa}', [SiswaController::class, 'destroy']);
    Route::post('/siswa/import', [SiswaController::class, 'import']);

    // --- RUTE KELAS ---
    Route::post('/kelas', [KelasController::class, 'store']);
    Route::put('/kelas/{kelas}', [KelasController::class, 'update']);
    Route::delete('/kelas/{kelas}', [KelasController::class, 'destroy']);

    // --- RUTE MATA PELAJARAN ---
    Route::post('/mata-pelajaran', [MataPelajaranController::class, 'store']);
    Route::put('/mata-pelajaran/{mataPelajaran}', [MataPelajaranController::class, 'update']);
    Route::delete('/mata-pelajaran/{mataPelajaran}', [MataPelajaranController::class, 'destroy']);
});