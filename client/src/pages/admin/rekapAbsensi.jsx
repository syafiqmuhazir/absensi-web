import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Search, List, Grid3X3, User, Calendar, FileDown, Table } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const RekapAbsensi = () => {
    const [activeTab, setActiveTab] = useState('bulanan'); // Default ke Bulanan biar langsung kelihatan
    const [kelasList, setKelasList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false); // State untuk loading download

    // --- STATE HARIAN ---
    const [filterHarian, setFilterHarian] = useState(new Date().toISOString().split('T')[0]);
    const [dataHarian, setDataHarian] = useState([]);

    // --- STATE BULANAN ---
    const dateNow = new Date();
    const [filterBulan, setFilterBulan] = useState({
        kelas_id: '', bulan: dateNow.getMonth() + 1, tahun: dateNow.getFullYear()
    });
    const [matrixData, setMatrixData] = useState({ siswas: [], matrix: {} });

    // --- STATE INDIVIDU ---
    const [siswaList, setSiswaList] = useState([]); 
    const [filterIndividu, setFilterIndividu] = useState({
        kelas_id: '', siswa_id: '', bulan: dateNow.getMonth() + 1, tahun: dateNow.getFullYear()
    });
    const [dataIndividu, setDataIndividu] = useState(null);

    // Load Kelas Awal
    useEffect(() => {
        api.get('/kelas').then(res => {
            setKelasList(res.data.data ? res.data.data : res.data);
        });
    }, []);

    // Load Siswa saat Kelas Individu dipilih
    useEffect(() => {
        if (filterIndividu.kelas_id) {
            api.get(`/siswa/kelas/${filterIndividu.kelas_id}`).then(res => {
                setSiswaList(res.data);
            });
        } else {
            setSiswaList([]);
        }
    }, [filterIndividu.kelas_id]);

    // --- FETCH FUNCTIONS ---
    const fetchHarian = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/laporan/rekap-harian', { params: { tanggal: filterHarian } });
            setDataHarian(res.data);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const fetchBulanan = async (e) => {
        if(e) e.preventDefault();
        if (!filterBulan.kelas_id) return Swal.fire('Pilih Kelas', '', 'warning');
        setIsLoading(true);
        try {
            const res = await api.get('/laporan/rekap-matrix', { params: filterBulan });
            setMatrixData(res.data);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const fetchIndividu = async (e) => {
        if(e) e.preventDefault();
        if (!filterIndividu.siswa_id) return Swal.fire('Pilih Siswa', '', 'warning');
        setIsLoading(true);
        try {
            const res = await api.get('/laporan/rekap-siswa', { params: filterIndividu });
            setDataIndividu(res.data);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    // --- FUNGSI DOWNLOAD EXCEL (BARU) ---
    const handleDownload = async () => {
        if (!filterBulan.kelas_id) return Swal.fire('Pilih Kelas', '', 'warning');
        
        setIsDownloading(true);
        try {
            const response = await api.get('/laporan/export-matrix', {
                params: filterBulan,
                responseType: 'blob', // PENTING
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rekap_Kelas_${filterBulan.kelas_id}_${filterBulan.bulan}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            Swal.fire({icon: 'success', title: 'Download Selesai', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
        } catch (err) {
            console.error(err);
            Swal.fire('Gagal', 'Gagal mendownload file.', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    const daysInMonth = new Date(filterBulan.tahun, filterBulan.bulan, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Absensi</h1>
                    <nav className="text-sm text-gray-500 mt-1"><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> / Laporan</nav>
                </div>

                {/* TABS */}
                <div className="flex gap-6 mb-6 border-b border-gray-200 overflow-x-auto">
                    {['harian', 'bulanan', 'individu'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-2 flex items-center gap-2 font-medium transition whitespace-nowrap capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'harian' && <List className="w-5 h-5" />}
                            {tab === 'bulanan' && <Grid3X3 className="w-5 h-5" />}
                            {tab === 'individu' && <User className="w-5 h-5" />}
                            Rekap {tab}
                        </button>
                    ))}
                </div>

                {/* === TAB HARIAN === */}
                {activeTab === 'harian' && (
                    <div className="animate-fade-in-down space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-end">
                            <div className="w-full max-w-xs">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pilih Tanggal</label>
                                <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={filterHarian} onChange={(e) => setFilterHarian(e.target.value)} />
                            </div>
                            <button onClick={fetchHarian} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Tampilkan</button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-red-50 text-red-800 text-xs font-bold uppercase">
                                    <tr><th className="p-4">Nama Siswa</th><th className="p-4">Kelas</th><th className="p-4">Mapel</th><th className="p-4 text-center">Status</th><th className="p-4">Ket</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {dataHarian.length > 0 ? dataHarian.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="p-4 font-bold">{row.nama_siswa}</td>
                                            <td className="p-4 text-gray-600">{row.kelas}</td>
                                            <td className="p-4 text-sm">{row.mapel} <br/><span className="text-xs text-gray-400">Jam: {row.jam_ke}</span></td>
                                            <td className="p-4 text-center"><span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">{row.status}</span></td>
                                            <td className="p-4 text-sm italic text-gray-500">{row.keterangan || '-'}</td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="p-8 text-center text-gray-400">Tidak ada siswa absen.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* === TAB BULANAN (UPDATED) === */}
                {activeTab === 'bulanan' && (
                    <div className="animate-fade-in-down">
                        {/* Filter Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                            <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                                <Table className="w-5 h-5 text-blue-600" /> Filter Rekap Bulanan
                            </h3>
                            <form onSubmit={fetchBulanan}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kelas</label>
                                        <select className="w-full p-2.5 border rounded-lg bg-gray-50" value={filterBulan.kelas_id} onChange={e => setFilterBulan({...filterBulan, kelas_id: e.target.value})}>
                                            <option value="">-- Pilih Kelas --</option>
                                            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Bulan</label>
                                        <select className="w-full p-2.5 border rounded-lg bg-gray-50" value={filterBulan.bulan} onChange={e => setFilterBulan({...filterBulan, bulan: e.target.value})}>
                                            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', {month:'long'})}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tahun</label>
                                        <input type="number" className="w-full p-2.5 border rounded-lg bg-gray-50" value={filterBulan.tahun} onChange={e => setFilterBulan({...filterBulan, tahun: e.target.value})} />
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Tombol Tampilkan */}
                                        <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition">
                                            Lihat
                                        </button>
                                        
                                        {/* Tombol Download Excel */}
                                        {matrixData.siswas.length > 0 && (
                                            <button 
                                                type="button"
                                                onClick={handleDownload}
                                                disabled={isDownloading}
                                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition border ${isDownloading ? 'bg-green-100 text-green-800 border-green-200 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 border-green-600 shadow-sm'}`}
                                            >
                                                {isDownloading ? (
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                ) : (
                                                    <FileDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Tabel Matrix Scrollable */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                             <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="p-3 sticky left-0 bg-gray-100 border-r w-10 z-10 font-bold text-center text-gray-600">No</th>
                                            <th className="p-3 sticky left-10 bg-gray-100 border-r w-48 z-10 font-bold text-gray-600">Nama Siswa</th>
                                            {daysArray.map(d => <th key={d} className="p-1 text-center min-w-[32px] border-r text-xs font-semibold text-gray-500">{d}</th>)}
                                            
                                            {/* Kolom Summary */}
                                            <th className="p-1 text-center w-10 bg-green-50 text-green-700 font-bold text-xs border-l border-r">H</th>
                                            <th className="p-1 text-center w-10 bg-blue-50 text-blue-700 font-bold text-xs border-r">S</th>
                                            <th className="p-1 text-center w-10 bg-yellow-50 text-yellow-700 font-bold text-xs border-r">I</th>
                                            <th className="p-1 text-center w-10 bg-red-50 text-red-700 font-bold text-xs">A</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {matrixData.siswas.length > 0 ? matrixData.siswas.map((siswa, idx) => {
                                            // Hitung Total
                                            let h=0, s=0, i=0, a=0;
                                            daysArray.forEach(d => {
                                                const stat = matrixData.matrix[siswa.id]?.[d];
                                                if(stat==='H') h++; else if(stat==='S') s++; else if(stat==='I') i++; else if(stat==='A') a++;
                                            });

                                            return (
                                                <tr key={siswa.id} className="hover:bg-gray-50">
                                                    <td className="p-3 sticky left-0 bg-white border-r text-center text-gray-500 font-mono text-xs z-10">{idx + 1}</td>
                                                    <td className="p-3 sticky left-10 bg-white border-r font-medium text-gray-800 truncate max-w-[150px] text-xs sm:text-sm z-10">{siswa.nama_siswa}</td>
                                                    {daysArray.map(d => {
                                                        const status = matrixData.matrix[siswa.id]?.[d];
                                                        const color = status === 'H' ? 'bg-green-100 text-green-700' : status === 'A' ? 'bg-red-100 text-red-700 font-bold' : status ? 'bg-yellow-100 text-yellow-700' : '';
                                                        return <td key={d} className="p-0 border-r text-center"><div className={`w-full h-8 flex items-center justify-center font-bold text-[10px] ${color}`}>{status}</div></td>
                                                    })}
                                                    <td className="text-center font-bold bg-green-50 text-green-700 border-l text-xs">{h}</td>
                                                    <td className="text-center font-bold bg-blue-50 text-blue-700 border-l text-xs">{s}</td>
                                                    <td className="text-center font-bold bg-yellow-50 text-yellow-700 border-l text-xs">{i}</td>
                                                    <td className="text-center font-bold bg-red-50 text-red-700 border-l text-xs">{a}</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={daysInMonth + 6} className="p-12 text-center text-gray-400">Silakan pilih filter dan klik Lihat Data.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB INDIVIDU === */}
                {activeTab === 'individu' && (
                    <div className="animate-fade-in-down space-y-6">
                        <form onSubmit={fetchIndividu} className="bg-white p-4 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kelas</label>
                                <select className="w-full p-2 border rounded" value={filterIndividu.kelas_id} onChange={e => setFilterIndividu({...filterIndividu, kelas_id: e.target.value, siswa_id: ''})}>
                                    <option value="">-- Pilih Kelas --</option>
                                    {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Siswa</label>
                                <select className="w-full p-2 border rounded" value={filterIndividu.siswa_id} onChange={e => setFilterIndividu({...filterIndividu, siswa_id: e.target.value})} disabled={!filterIndividu.kelas_id}>
                                    <option value="">-- Pilih Siswa --</option>
                                    {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama_siswa}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bulan</label>
                                <select className="w-full p-2 border rounded" value={filterIndividu.bulan} onChange={e => setFilterIndividu({...filterIndividu, bulan: e.target.value})}>
                                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', {month:'long'})}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tahun</label>
                                <input type="number" className="w-full p-2 border rounded" value={filterIndividu.tahun} onChange={e => setFilterIndividu({...filterIndividu, tahun: e.target.value})} />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Cari</button>
                        </form>

                        {/* HASIL INDIVIDU */}
                        {dataIndividu && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* KARTU STATISTIK */}
                                <div className="space-y-4">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600"><User className="w-8 h-8" /></div>
                                        <h3 className="text-xl font-bold text-gray-800">{dataIndividu.siswa.nama_siswa}</h3>
                                        <p className="text-gray-500 text-sm">{dataIndividu.siswa.nis} - {dataIndividu.siswa.kelas.nama_kelas}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-100 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-green-700">{dataIndividu.stats.Hadir}</div><div className="text-xs text-green-600 uppercase font-bold">Hadir</div></div>
                                        <div className="bg-blue-100 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-blue-700">{dataIndividu.stats.Sakit}</div><div className="text-xs text-blue-600 uppercase font-bold">Sakit</div></div>
                                        <div className="bg-yellow-100 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-yellow-700">{dataIndividu.stats.Izin}</div><div className="text-xs text-yellow-600 uppercase font-bold">Izin</div></div>
                                        <div className="bg-red-100 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-red-700">{dataIndividu.stats.Alpa}</div><div className="text-xs text-red-600 uppercase font-bold">Alpha</div></div>
                                    </div>
                                </div>

                                {/* TABEL RIWAYAT */}
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Riwayat Kehadiran</div>
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr><th className="p-3">Tanggal</th><th className="p-3">Mapel</th><th className="p-3">Status</th><th className="p-3">Ket</th></tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {dataIndividu.detail.length > 0 ? dataIndividu.detail.map((d, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-mono text-xs">{d.tanggal}</td>
                                                    <td className="p-3">
                                                        <div className="font-medium text-gray-800">{d.mapel}</div>
                                                        <div className="text-xs text-gray-500">{d.guru}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${d.status==='Hadir'?'bg-green-100 text-green-700':d.status==='Alpa'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
                                                    </td>
                                                    <td className="p-3 text-gray-500 italic">{d.ket || '-'}</td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="p-8 text-center text-gray-400">Belum ada data absensi bulan ini.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RekapAbsensi;