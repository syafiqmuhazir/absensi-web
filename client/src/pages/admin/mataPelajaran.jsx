import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Search, X, BookOpen, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const MataPelajaran = () => {
    const [mapel, setMapel] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, kode_mapel: '', nama_mapel: '' });
    const [error, setError] = useState('');

    const fetchMapel = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/mata-pelajaran'); 
            setMapel(response.data);
        } catch (err) {
            Swal.fire('Gagal', 'Gagal memuat data mapel.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchMapel(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        Swal.showLoading();
        try {
            if (isEditMode) {
                await api.put(`/mata-pelajaran/${formData.id}`, formData);
                Swal.fire('Berhasil!', 'Mapel diperbarui.', 'success');
            } else {
                await api.post('/mata-pelajaran', formData);
                Swal.fire('Berhasil!', 'Mapel ditambahkan.', 'success');
            }
            setIsModalOpen(false);
            fetchMapel();
        } catch (err) {
            Swal.close();
            if (err.response?.status === 422) setError(Object.values(err.response.data).flat().join('\n'));
            else Swal.fire('Gagal', 'Terjadi kesalahan.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Mapel?',
            text: "Data ini akan dihapus permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`/mata-pelajaran/${id}`);
                Swal.fire('Terhapus!', 'Mapel dihapus.', 'success');
                fetchMapel();
            } catch (err) {
                Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus.', 'error');
            }
        }
    };

    const openModalAdd = () => {
        setIsEditMode(false);
        setFormData({ id: null, kode_mapel: '', nama_mapel: '' });
        setIsModalOpen(true);
    };

    const openModalEdit = (item) => {
        setIsEditMode(true);
        setFormData({ id: item.id, kode_mapel: item.kode_mapel, nama_mapel: item.nama_mapel });
        setIsModalOpen(true);
    };

    const filteredMapel = mapel.filter(m => 
        m.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.kode_mapel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Mata Pelajaran</h1>
                        <nav className="text-sm text-gray-500 mt-1">
                            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> / Data Mapel
                        </nav>
                    </div>
                    <button onClick={openModalAdd} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition">
                        <Plus className="w-4 h-4" /> Tambah Mapel
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari Kode atau Nama Mapel..." 
                        className="w-full outline-none text-gray-600 placeholder-gray-400" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>

                {/* Tabel Data - VERSI RAPI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-16">No</th>
                                <th className="px-6 py-4 w-48">Kode Mapel</th>
                                <th className="px-6 py-4">Nama Mata Pelajaran</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
                            ) : filteredMapel.length > 0 ? (
                                filteredMapel.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Badge Kode Mapel */}
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                                                <Hash className="w-3 h-3 mr-1" />
                                                {item.kode_mapel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Icon Box */}
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <span className="text-gray-700 font-medium text-sm">
                                                    {item.nama_mapel}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openModalEdit(item)} 
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)} 
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Tidak ada data mapel.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-down">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Mapel' : 'Tambah Mapel'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kode Mapel</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Contoh: MTK" 
                                        className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none uppercase font-mono" 
                                        value={formData.kode_mapel} 
                                        onChange={e => setFormData({...formData, kode_mapel: e.target.value.toUpperCase()})} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Mapel</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <BookOpen className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Contoh: Matematika Wajib" 
                                        className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                                        value={formData.nama_mapel} 
                                        onChange={e => setFormData({...formData, nama_mapel: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md transition">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MataPelajaran;