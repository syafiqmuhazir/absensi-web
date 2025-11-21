<table>
    <thead>
        <tr>
            <th colspan="{{ $days + 2 }}" style="font-weight: bold; text-align: center; font-size: 16px; height: 30px;">
                REKAP ABSENSI SISWA
            </th>
        </tr>
        
        {{-- TAMBAHAN INFORMASI HEADER --}}
        <tr>
            <td colspan="5" style="font-weight: bold;">Guru Pengampu</td>
            <td colspan="{{ $days - 3 }}">: {{ $nama_guru }}</td>
        </tr>
        <tr>
            <td colspan="5" style="font-weight: bold;">Mata Pelajaran</td>
            <td colspan="{{ $days - 3 }}">: {{ $nama_mapel }}</td>
        </tr>
        <tr>
            <td colspan="5" style="font-weight: bold;">Periode</td>
            <td colspan="{{ $days - 3 }}">: {{ $bulan }} {{ $tahun }}</td>
        </tr>
        <tr></tr> {{-- Baris kosong sebagai pemisah --}}

        {{-- HEADER TABEL ASLI --}}
        <tr>
            <th style="font-weight: bold; border: 1px solid #000000; width: 30; text-align: center; background-color: #cccccc;">Nama Siswa</th>
            @for($i=1; $i<=$days; $i++)
                <th style="font-weight: bold; border: 1px solid #000000; text-align: center; width: 4; background-color: #cccccc;">{{ $i }}</th>
            @endfor
            <th style="font-weight: bold; border: 1px solid #000000; text-align: center; width: 12; background-color: #cccccc;">Total Hadir</th>
        </tr>
    </thead>
    <tbody>
        {{-- ... (bagian tbody tetap sama) ... --}}
        @foreach($siswas as $siswa)
        <tr>
            <td style="border: 1px solid #000000;">{{ $siswa->nama_siswa }}</td>
            @php $totalHadir = 0; @endphp
            @for($i=1; $i<=$days; $i++)
                <td style="border: 1px solid #000000; text-align: center;">
                    @php
                        $status = $matrix[$siswa->id][$i] ?? '';
                        if($status == 'H') $totalHadir++;
                    @endphp
                    {{ $status }}
                </td>
            @endfor
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold;">{{ $totalHadir }}</td>
        </tr>
        @endforeach
    </tbody>
</table>