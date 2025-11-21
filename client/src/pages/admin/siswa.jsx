import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Filter, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Siswa = () => {
    const [siswas, setSiswas] = useState([]);
    const [kelasList, setKelasList] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    
    // State Filter & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKelas, setFilterKelas] = useState(''); // <--- STATE BARU

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [formData, setFormData] = useState({ id: null, nama_siswa: '', nis: '', kelas_id: '', no_hp: '' });
    const [error, setError] = useState('');

    // STATE IMPORT EXCEL
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    // --- FETCH DATA (Updated) ---
    const fetchData = async (page = 1) => {
        setIsLoading(true);
        try {
            // Bangun URL dengan parameter search & filter
            let url = `/siswa?page=${page}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (filterKelas) url += `&kelas_id=${filterKelas}`;

            // Request Paralel
            const [resSiswa, resKelas] = await Promise.all([
                api.get(url),
                api.get('/kelas') // Untuk isi dropdown filter & modal
            ]);

            const daftarKelas = resKelas.data.data ? resKelas.data.data : resKelas.data;

            setKelasList(daftarKelas);
            setSiswas(resSiswa.data.data);
            setCurrentPage(resSiswa.data.current_page);
            setLastPage(resSiswa.data.last_page);
            setTotalData(resSiswa.data.total);

        } catch (err) {
            console.error(err);
            Swal.fire('Gagal', 'Gagal memuat data.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Efek: Fetch saat Page / Filter / Search berubah
    // (Debounce search bisa ditambahkan jika data sangat banyak)
    useEffect(() => {
        fetchData(1); // Reset ke halaman 1 setiap kali filter berubah
    }, [filterKelas, searchTerm]); 
    
    // Handler Pagination (Hanya ganti page, jangan reset filter)
    const handlePageChange = (newPage) => {
        const fetchPage = async () => {
            setIsLoading(true);
            try {
                let url = `/siswa?page=${newPage}`;
                if (searchTerm) url += `&search=${searchTerm}`;
                if (filterKelas) url += `&kelas_id=${filterKelas}`;
                
                const res = await api.get(url);
                setSiswas(res.data.data);
                setCurrentPage(res.data.current_page);
            } catch (err) { console.error(err); } 
            finally { setIsLoading(false); }
        };
        fetchPage();
    };

    // ... (Logika Handle Submit & Delete SAMA SEPERTI SEBELUMNYA - Copy Paste yg lama) ...
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.kelas_id) { setError('Wajib memilih kelas!'); return; }
        Swal.showLoading();
        try {
            if (isEditMode) {
                await api.put(`/siswa/${formData.id}`, formData);
                Swal.fire('Berhasil!', 'Update sukses.', 'success');
            } else {
                await api.post('/siswa', formData);
                Swal.fire('Berhasil!', 'Siswa baru ditambahkan.', 'success');
            }
            setIsModalOpen(false);
            fetchData(currentPage);
        } catch (err) {
            Swal.close();
            if (err.response?.status === 422) setError(Object.values(err.response.data).flat().join('\n'));
            else Swal.fire('Gagal', 'Error sistem.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!' });
        if (result.isConfirmed) {
            try {
                await api.delete(`/siswa/${id}`);
                Swal.fire('Terhapus!', '', 'success');
                fetchData(currentPage);
            } catch (err) { Swal.fire('Gagal', 'Gagal hapus.', 'error'); }
        }
    };

    const openModalAdd = () => { setIsEditMode(false); setFormData({ id: null, nama_siswa: '', nis: '', kelas_id: '', no_hp: '' }); setError(''); setIsModalOpen(true); };
    const openModalEdit = (siswa) => { setIsEditMode(true); setFormData({ id: siswa.id, nama_siswa: siswa.nama_siswa, nis: siswa.nis, kelas_id: siswa.kelas_id, no_hp: siswa.no_hp || '' }); setError(''); setIsModalOpen(true); };

    // --- HANDLER IMPORT EXCEL ---
    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            Swal.fire('Gagal', 'Silakan pilih file Excel (.xlsx) terlebih dahulu', 'warning');
            return;
        }

        setIsImporting(true); // Loading state khusus import
        
        // Kita pakai FormData untuk upload file
        const formData = new FormData();
        formData.append('file', importFile);

        try {
            // Header 'Content-Type': 'multipart/form-data' biasanya otomatis diset oleh Axios saat ada FormData
            await api.post('/siswa/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Swal.fire('Berhasil!', 'Data siswa berhasil diimport!', 'success');
            setIsImportModalOpen(false);
            setImportFile(null);
            fetchData(1); // Refresh data ke halaman 1
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Gagal mengimport data.';
            const detail = err.response?.data?.error || 'Pastikan format Excel sesuai.';
            Swal.fire('Gagal', `${msg}\n${detail}`, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h1>
                        <nav className="text-sm text-gray-500 mt-1"><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> / Data Siswa</nav>
                    </div>
                    <div className="flex gap-2">
                         {/* Tombol Import*/}
                        <button onClick={()=>setIsImportModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition">
                            <FileSpreadsheet className="w-4 h-4" /> Import Excel
                        </button>
                        <button onClick={openModalAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition">
                            <Plus className="w-4 h-4" /> Tambah Siswa
                        </button>
                    </div>
                </div>

                {/* FILTER BAR (BARU) */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full sm:w-1/2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari Nama atau NIS..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Kelas Dropdown */}
                    <div className="relative w-full sm:w-1/3">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                            value={filterKelas}
                            onChange={(e) => setFilterKelas(e.target.value)}
                        >
                            <option value="">-- Semua Kelas --</option>
                            {kelasList?.map(kelas => (
                                <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabel Data */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-4 w-12">No</th>
                                    <th className="p-4">NIS</th>
                                    <th className="p-4">Nama Siswa</th>
                                    <th className="p-4">Kelas</th>
                                    <th className="p-4">No HP</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="p-8 text-center">Memuat data...</td></tr>
                                ) : siswas.length > 0 ? (
                                    siswas.map((siswa, index) => (
                                        <tr key={siswa.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-gray-500">{(currentPage - 1) * 10 + index + 1}</td>
                                            <td className="p-4 font-mono text-sm text-gray-600">{siswa.nis}</td>
                                            <td className="p-4 font-medium text-gray-800">{siswa.nama_siswa}</td>
                                            <td className="p-4">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                                    {siswa.kelas ? siswa.kelas.nama_kelas : '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">{siswa.no_hp || '-'}</td>
                                            <td className="p-4 flex justify-end gap-2">
                                                <button onClick={() => openModalEdit(siswa)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(siswa.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-400 py-12">Tidak ada siswa ditemukan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-500">Hal. {currentPage} dari {lastPage} (Total {totalData})</span>
                        <div className="flex gap-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-white border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === lastPage} className="px-3 py-1.5 bg-white border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* MODAL FORM (SAMA SEPERTI SEBELUMNYA - PASTE DI SINI) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-down">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">{error}</div>}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">NIS</label>
                                <input type="text" required className="w-full p-2 border border-gray-300 rounded mt-1" value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                                <input type="text" required className="w-full p-2 border border-gray-300 rounded mt-1" value={formData.nama_siswa} onChange={e => setFormData({...formData, nama_siswa: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Kelas</label>
                                <select required className="w-full p-2 border border-gray-300 rounded mt-1 bg-white" value={formData.kelas_id} onChange={e => setFormData({...formData, kelas_id: e.target.value})}>
                                    <option value="">-- Pilih Kelas --</option>
                                    {kelasList.map(kelas => (<option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">No. HP</label>
                                <input type="text" className="w-full p-2 border border-gray-300 rounded mt-1" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-md">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL IMPORT EXCEL */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-down">
                        <div className="flex justify-between items-center p-6 border-b bg-green-50 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <FileSpreadsheet className="w-6 h-6 text-green-700" />
                                </div>
                                <h3 className="text-lg font-bold text-green-800">Import Data Siswa</h3>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-gray-700" /></button>
                        </div>
                        
                        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                                <p className="font-bold mb-1">⚠ Aturan Format Excel:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Header baris pertama wajib kecil semua: <br/><code className="bg-white px-1 rounded border">nama_siswa</code>, <code className="bg-white px-1 rounded border">nis</code>, <code className="bg-white px-1 rounded border">kelas</code>, <code className="bg-white px-1 rounded border">no_hp</code></li>
                                    <li>Kolom <b>kelas</b> harus sama persis dengan data di aplikasi (contoh: "XI TKJ 1").</li>
                                </ul>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FileSpreadsheet className="w-10 h-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">
                                    {importFile ? importFile.name : "Klik untuk pilih file Excel"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Format .xlsx atau .xls</p>
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                                <button 
                                    type="submit" 
                                    disabled={isImporting}
                                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow-md flex items-center gap-2 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isImporting ? 'Mengunggah...' : 'Upload & Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Siswa;