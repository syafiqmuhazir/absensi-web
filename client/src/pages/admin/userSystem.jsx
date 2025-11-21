import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Search, X, Shield, User, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserSystem = () => {
    const [users, setUsers] = useState([]);
    const [gurus, setGurus] = useState([]); // Data untuk dropdown guru
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [formData, setFormData] = useState({
        id: null,
        username: '',
        password: '',
        role: 'guru', // Default role
        guru_id: ''
    });

    const [error, setError] = useState('');

    // 1. FETCH DATA (Users & Gurus)
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resUsers, resGurus] = await Promise.all([
                api.get('/user'), // Mengambil semua user
                api.get('/guru')   // Mengambil semua guru untuk dropdown
            ]);
            
            // Handle format pagination jika ada
            const userData = resUsers.data.data ? resUsers.data.data : resUsers.data;
            const guruData = resGurus.data.data ? resGurus.data.data : resGurus.data;

            setUsers(userData);
            setGurus(guruData);

        } catch (err) {
            Swal.fire('Gagal', 'Gagal memuat data user.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. HANDLE SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        Swal.showLoading();
        
        try {
            if (isEditMode) {
                // Update (Password dikirim kosong jika tidak diubah)
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password; // Hapus key password jika kosong

                await api.put(`/user/${formData.id}`, dataToSend);
                Swal.fire('Berhasil!', 'Data user diperbarui.', 'success');
            } else {
                // Create
                await api.post('/user', formData);
                Swal.fire('Berhasil!', 'User baru ditambahkan.', 'success');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            Swal.close();
            
            if (err.response && err.response.status === 422) {
                // PERBAIKAN DI SINI:
                // Laravel mengirim error dalam format { message: "...", errors: { ... } }
                // Kita harus mengambil bagian 'errors' nya saja
                const errorData = err.response.data.errors; 
                
                if (errorData) {
                    // Gabungkan semua pesan error menjadi satu string
                    const errorMessages = Object.values(errorData).flat().join('\n');
                    setError(errorMessages);
                } else {
                    // Fallback jika format beda
                    setError(err.response.data.message || "Terjadi kesalahan validasi");
                }
            } else {
                Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan.', 'error');
            }
        }
    };

    // 3. HANDLE DELETE
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus User?',
            text: "Akses login ini akan dihapus permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/user/${id}`);
                Swal.fire('Terhapus!', 'User telah dihapus.', 'success');
                fetchData();
            } catch (err) {
                Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus.', 'error');
            }
        }
    };

    const openModalAdd = () => {
        setIsEditMode(false);
        setFormData({ id: null, username: '', password: '', role: 'guru', guru_id: '' });
        setError('');
        setIsModalOpen(true);
    };

    const openModalEdit = (item) => {
        setIsEditMode(true);
        setFormData({ 
            id: item.id, 
            username: item.username, 
            password: '', // Kosongkan password saat edit
            role: item.role, 
            guru_id: item.guru_id 
        });
        setError('');
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.guru && u.guru.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">User System</h1>
                        <nav className="text-sm text-gray-500 mt-1">
                            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> / Manajemen Akun
                        </nav>
                    </div>
                    <button onClick={openModalAdd} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition">
                        <Plus className="w-4 h-4" /> Tambah User
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Cari Username atau Nama Guru..." className="w-full outline-none text-gray-600 placeholder-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4 w-12">No</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Pemilik Akun (Guru)</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center">Memuat data...</td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-500">{index + 1}</td>
                                        <td className="p-4 font-mono font-bold text-gray-700">{item.username}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 uppercase ${item.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {item.role === 'admin' ? <Shield className="w-3 h-3"/> : <User className="w-3 h-3"/>}
                                                {item.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {item.guru ? item.guru.nama_guru : <span className="text-red-400 italic">Data guru tidak ditemukan</span>}
                                        </td>
                                        <td className="p-4 flex justify-end gap-2">
                                            <button onClick={() => openModalEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit/Ganti Password"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus Akun"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Tidak ada user.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-down">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit User' : 'Tambah User Baru'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">{error}</div>}
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                                <input type="text" required className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-500 outline-none" 
                                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Password {isEditMode && <span className="text-gray-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <div className="relative">
                                    <input type="text" className="w-full p-2 pl-9 border rounded focus:ring-2 focus:ring-gray-500 outline-none" 
                                        placeholder={isEditMode ? "******" : "Minimal 6 karakter"}
                                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                                        required={!isEditMode} // Wajib jika mode tambah
                                    />
                                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                    <select className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-gray-500 outline-none"
                                        value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="guru">Guru</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link Data Guru</label>
                                    <select className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-gray-500 outline-none"
                                        value={formData.guru_id} onChange={e => setFormData({...formData, guru_id: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Pilih Guru --</option>
                                        {gurus.map(g => (
                                            <option key={g.id} value={g.id}>{g.nama_guru} {g.nip ? `(${g.nip})` : ''}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">*Wajib dipilih (Admin juga butuh data guru)</p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded shadow-md">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSystem;