import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Search, X, UserPlus, UserMinus, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Guru = () => {
    const [gurus, setGurus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // STATE PAGINATION BARU
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, nama_guru: '', nip: '', no_hp: '' });
    
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userFormData, setUserFormData] = useState({ guru_id: null, username: '', password: '' });
    const [error, setError] = useState('');

    // --- FETCH DATA DENGAN PAGE ---
    const fetchGurus = async (page = 1) => {
        setIsLoading(true);
        try {
            // Panggil API dengan parameter page
            const response = await api.get(`/guru?page=${page}`);
            
            // Laravel paginate membungkus data dalam properti 'data'
            setGurus(response.data.data);
            
            // Set info pagination
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
            setTotalData(response.data.total);

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal mengambil data guru.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGurus(1); // Load halaman 1 saat pertama buka
    }, []);

    // --- LOGIKA SEARCH (Manual Filter di Client Side vs Server Side) ---
    // Catatan: Idealnya search dilakukan di Backend (Server Side). 
    // Tapi untuk tutorial ini kita filter data yang SUDAH diambil (Client Side)
    // agar tidak mengubah terlalu banyak kode backend.
    const filteredGurus = gurus.filter(guru => 
        guru.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guru.nip && guru.nip.includes(searchTerm))
    );

    // --- LOGIKA CRUD (Sama seperti sebelumnya) ---
    const handleSubmitGuru = async (e) => {
        e.preventDefault();
        setError('');
        Swal.showLoading();
        try {
            if (isEditMode) {
                await api.put(`/guru/${formData.id}`, formData);
                Swal.fire('Berhasil!', 'Data guru diperbarui.', 'success');
            } else {
                await api.post('/guru', formData);
                Swal.fire('Berhasil!', 'Guru baru ditambahkan.', 'success');
            }
            setIsModalOpen(false);
            fetchGurus(currentPage); // Refresh di halaman yang sama
        } catch (err) {
            Swal.close();
            if (err.response?.status === 422) setError(Object.values(err.response.data).flat().join('\n'));
            else Swal.fire('Gagal', 'Terjadi kesalahan.', 'error');
        }
    };

    const handleDeleteGuru = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Guru?',
            text: "Data guru dan akun loginnya akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/guru/${id}`);
                Swal.fire('Terhapus!', 'Data guru dihapus.', 'success');
                fetchGurus(currentPage);
            } catch (err) {
                Swal.fire('Gagal', 'Gagal menghapus data.', 'error');
            }
        }
    };

    // User Management logic (sama)
    const openUserModal = (guruId, guruName) => {
        const suggestedUsername = guruName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        setUserFormData({ guru_id: guruId, username: suggestedUsername, password: '' });
        setError('');
        setIsUserModalOpen(true);
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();
        setError('');
        Swal.showLoading();
        try {
            await api.post('/user', { ...userFormData, role: 'guru' });
            Swal.fire('Berhasil!', 'Akun login berhasil dibuat.', 'success');
            setIsUserModalOpen(false);
            fetchGurus(currentPage);
        } catch (err) {
            Swal.close();
            if (err.response?.status === 422) setError(Object.values(err.response.data).flat().join('\n'));
            else Swal.fire('Gagal', 'Gagal membuat user.', 'error');
        }
    };

    const handleDeleteUser = async (userId, guruName) => {
        const result = await Swal.fire({
            title: 'Nonaktifkan Login?',
            text: `Akses login untuk ${guruName} akan dicabut.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Cabut Akses!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/user/${userId}`);
                Swal.fire('Berhasil!', 'Akun login dihapus.', 'success');
                fetchGurus(currentPage);
            } catch (err) {
                const msg = err.response?.data?.message || 'Gagal menghapus user.';
                Swal.fire('Gagal', msg, 'error');
            }
        }
    };

    const openModalAdd = () => {
        setIsEditMode(false);
        setFormData({ id: null, nama_guru: '', nip: '', no_hp: '' });
        setError('');
        setIsModalOpen(true);
    };

    const openModalEdit = (guru) => {
        setIsEditMode(true);
        setFormData({ id: guru.id, nama_guru: guru.nama_guru, nip: guru.nip || '', no_hp: guru.no_hp || '' });
        setError('');
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Guru</h1>
                        <nav className="text-sm text-gray-500 mt-1">
                            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> / Data Guru
                        </nav>
                    </div>
                    <button onClick={openModalAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition">
                        <Plus className="w-4 h-4" /> Tambah Guru
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau NIP di halaman ini..." 
                        className="w-full outline-none text-gray-600 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-4 w-12">No</th>
                                    <th className="p-4">Nama Guru</th>
                                    <th className="p-4">NIP & Kontak</th>
                                    <th className="p-4">Status Akun</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="p-8 text-center">Memuat data...</td></tr>
                                ) : filteredGurus.length > 0 ? (
                                    filteredGurus.map((guru, index) => (
                                        <tr key={guru.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 text-gray-500">
                                                {/* Hitung Nomor Urut berdasarkan Page: (Page-1) * 10 + index + 1 */}
                                                {(currentPage - 1) * 10 + index + 1}
                                            </td>
                                            <td className="p-4 font-bold text-gray-800">{guru.nama_guru}</td>
                                            <td className="p-4 text-sm">
                                                <div className="text-gray-600">NIP: {guru.nip || '-'}</div>
                                                <div className="text-gray-500">HP: {guru.no_hp || '-'}</div>
                                            </td>
                                            <td className="p-4">
                                                {guru.users ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                            <Key className="w-3 h-3" /> {guru.users.username}
                                                        </div>
                                                        <button onClick={() => handleDeleteUser(guru.users.id, guru.nama_guru)} className="group relative p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Hapus Akun">
                                                            <UserMinus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => openUserModal(guru.id, guru.nama_guru)} className="inline-flex items-center gap-1.5 bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-300 px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm">
                                                        <UserPlus className="w-3.5 h-3.5" /> Buat Akun
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-4 flex justify-end gap-2">
                                                <button onClick={() => openModalEdit(guru)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteGuru(guru.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">Tidak ada data.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            Hal. <span className="font-bold text-gray-800">{currentPage}</span> dari {lastPage} (Total {totalData} Data)
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => fetchGurus(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <button 
                                onClick={() => fetchGurus(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${currentPage === lastPage ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM GURU & USER (Sama seperti sebelumnya, disembunyikan agar tidak terlalu panjang) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold">{isEditMode ? 'Edit Guru' : 'Tambah Guru'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmitGuru} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
                            <input type="text" placeholder="Nama Lengkap" required className="w-full p-2 border rounded" value={formData.nama_guru} onChange={e => setFormData({...formData, nama_guru: e.target.value})} />
                            <input type="text" placeholder="NIP" className="w-full p-2 border rounded" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} />
                            <input type="text" placeholder="No HP" className="w-full p-2 border rounded" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} />
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                        <div className="bg-blue-50 p-6 border-b border-blue-100">
                            <h3 className="text-lg font-bold text-blue-800">Buat Akun Login</h3>
                        </div>
                        <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">{error}</div>}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                                <input type="text" required className="w-full p-2 border border-gray-300 rounded mt-1" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                <input type="text" required placeholder="Minimal 6 karakter" className="w-full p-2 border border-gray-300 rounded mt-1" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-600">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Buat Akun</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Guru;