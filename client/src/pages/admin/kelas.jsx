import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Kelas = () => {
    const [kelas, setKelas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, nama_kelas: '', tingkat: '' });
    const [error, setError] = useState('');

    const fetchKelas = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/kelas?page=${page}`);
            const data = response.data.data ? response.data.data : response.data;
            setKelas(data);
            
            if(response.data.meta || response.data.current_page) {
                 setCurrentPage(response.data.current_page);
                 setLastPage(response.data.last_page);
                 setTotalData(response.data.total);
            }
        } catch (err) {
            Swal.fire('Gagal', 'Gagal memuat data kelas.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKelas(1);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        Swal.showLoading();
        try {
            if (isEditMode) {
                await api.put(`/kelas/${formData.id}`, formData);
                Swal.fire('Berhasil!', 'Data kelas diperbarui.', 'success');
            } else {
                await api.post('/kelas', formData);
                Swal.fire('Berhasil!', 'Kelas baru ditambahkan.', 'success');
            }
            setIsModalOpen(false);
            fetchKelas(currentPage);
        } catch (err) {
            Swal.close();
            if (err.response?.status === 422) setError(Object.values(err.response.data).flat().join('\n'));
            else Swal.fire('Gagal', 'Terjadi kesalahan.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Kelas?',
            text: "Data siswa di dalam kelas ini mungkin akan error jika kelas dihapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/kelas/${id}`);
                Swal.fire('Terhapus!', 'Data kelas dihapus.', 'success');
                fetchKelas(currentPage);
            } catch (err) {
                Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus data.', 'error');
            }
        }
    };

    const openModalAdd = () => {
        setIsEditMode(false);
        setFormData({ id: null, nama_kelas: '', tingkat: '' });
        setIsModalOpen(true);
    };

    const openModalEdit = (item) => {
        setIsEditMode(true);
        setFormData({ id: item.id, nama_kelas: item.nama_kelas, tingkat: item.tingkat });
        setIsModalOpen(true);
    };

    const filteredKelas = kelas.filter(k => 
        k.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
                        <nav className="text-sm text-gray-500 mt-1"><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> / Data Kelas</nav>
                    </div>
                    <button onClick={openModalAdd} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition">
                        <Plus className="w-4 h-4" /> Tambah Kelas
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Cari Nama Kelas..." className="w-full outline-none text-gray-600 placeholder-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b text-gray-600 text-xs font-semibold uppercase">
                            <tr>
                                <th className="p-4 w-12">No</th>
                                <th className="p-4">Nama Kelas</th>
                                <th className="p-4">Tingkat</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? <tr><td colSpan="4" className="p-8 text-center">Memuat...</td></tr> : filteredKelas.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-500">{(currentPage - 1) * 10 + index + 1}</td>
                                    <td className="p-4 font-bold text-gray-800">{item.nama_kelas}</td>
                                    <td className="p-4"><span className="bg-violet-50 text-violet-700 px-2 py-1 rounded text-xs font-bold">{item.tingkat}</span></td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button onClick={() => openModalEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination Controls (Sederhana) */}
                    {lastPage > 1 && (
                        <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
                             <span className="text-sm text-gray-500">Hal. {currentPage} dari {lastPage}</span>
                             <div className="flex gap-2">
                                <button onClick={() => fetchKelas(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
                                <button onClick={() => fetchKelas(currentPage + 1)} disabled={currentPage === lastPage} className="px-3 py-1 bg-white border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-down">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold">{isEditMode ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Kelas</label>
                                <input type="text" required placeholder="Contoh: XI TKJ 1" className="w-full p-2 border rounded focus:ring-2 focus:ring-violet-500 outline-none" value={formData.nama_kelas} onChange={e => setFormData({...formData, nama_kelas: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tingkat</label>
                                <select required className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-violet-500 outline-none" value={formData.tingkat} onChange={e => setFormData({...formData, tingkat: e.target.value})}>
                                    <option value="">-- Pilih --</option>
                                    <option value="X">X (Sepuluh)</option>
                                    <option value="XI">XI (Sebelas)</option>
                                    <option value="XII">XII (Dua Belas)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded shadow">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kelas;