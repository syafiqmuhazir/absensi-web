<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>API SINAU</title>
</head>
<body>
    <h1>Selamat Datang di API SINAU</h1>
    <p>API ini digunakan untuk mengelola data absensi siswa, kelas, dan mata pelajaran.</p>
    <h2>Dokumentasi API</h2>
    <ul>
        <li><a href="/api/kelas">GET /api/kelas</a>
            <p>Ambil daftar semua kelas.</p>
        </li>
        <li><a href="/api/kelas/{kelas}">GET /api/kelas/{kelas}</a>
            <p>Ambil detail kelas berdasarkan ID kelas.</p>
        </li>
        <li><a href="/api/mata-pelajaran">GET /api/mata-pelajaran</a>
            <p>Ambil daftar semua mata pelajaran.</p>
        </li>
        <li><a href="/api/mata-pelajaran/{mataPelajaran}">GET /api/mata-pelajaran/{mataPelajaran}</a>
            <p>Ambil detail mata pelajaran berdasarkan ID mata pelajaran.</p>
        </li>
        <li><a href="/api/siswa">GET /api/siswa</a> 
            <p>Ambil daftar semua siswa.</p>
        </li>
        <li><a href="/api/siswa/{siswa}">GET /api/siswa/{siswa}</a> 
            <p>Ambil detail siswa berdasarkan ID siswa.</p>
        </li>
    </ul>
    
</body>
</html>