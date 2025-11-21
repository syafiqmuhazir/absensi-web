import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, UserCheck, AlertCircle, BookOpen, Clock, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const InputAbsensi = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // Data Master untuk Dropdown
    const [kelasList, setKelasList] = useState([]);
    const [mapelList, setMapelList] = useState([]);
    
    // Data Form Jurnal
    const [formData, setFormData] = useState({
        kelas_id: '',
        mata_pelajaran_id: '',
        sesi: '1-2', // Default jam ke 1-2
        tanggal: new Date().toISOString().split('T')[0], // Default hari ini
        topik_pembelajaran: ''
    });

    // Data Siswa & Absensi
    const [students, setStudents] = useState([]);
    // State untuk menyimpan status absensi per siswa
    // Format: { 1: {status: 'Hadir', keterangan: ''}, 2: {status: 'Sakit', ...} }
    const [attendance, setAttendance] = useState({}); 

    // 1. Fetch Data Master (Kelas & Mapel) saat halaman dibuka
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [resKelas, resMapel] = await Promise.all([
                    api.get('/kelas'),
                    api.get('/mata-pelajaran')
                ]);
                
                // Handle format data (apakah paginate atau array biasa)
                const dataKelas = resKelas.data.data ? resKelas.data.data : resKelas.data;
                const dataMapel = resMapel.data.data ? resMapel.data.data : resMapel.data;

                setKelasList(dataKelas);
                setMapelList(dataMapel);
            } catch (err) {
                Swal.fire('Error', 'Gagal memuat data master. Pastikan Anda Login.', 'error');
            }
        };
        fetchMasterData();
    }, []);

    // 2. Fetch Siswa otomatis saat Kelas Dipilih
    useEffect(() => {
        if (formData.kelas_id) {
            const fetchStudents = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get(`/siswa/kelas/${formData.kelas_id}`);
                    setStudents(response.data);
                    
                    // Set Default Absensi ke 'Hadir' untuk semua siswa
                    const defaultAttendance = {};
                    response.data.forEach(s => {
                        defaultAttendance[s.id] = { status: 'Hadir', keterangan: '' };
                    });
                    setAttendance(defaultAttendance);
                    
                } catch (err) {
                    Swal.fire('Error', 'Gagal memuat data siswa di kelas ini.', 'error');
                    setStudents([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [formData.kelas_id]);

    // Helper: Update Status Absensi per Siswa
    const handleStatusChange = (siswaId, status) => {
        setAttendance(prev => ({
            ...prev,
            [siswaId]: { ...prev[siswaId], status: status }
        }));
    };

    // Helper: Update Keterangan per Siswa
    const handleKeteranganChange = (siswaId, text) => {
        setAttendance(prev => ({
            ...prev,
            [siswaId]: { ...prev[siswaId], keterangan: text }
        }));
    };

    // 3. PROSES SIMPAN (SUBMIT)
    const handleSubmit = async () => {
        // Validasi Form Jurnal
        if (!formData.kelas_id || !formData.mata_pelajaran_id || !formData.topik_pembelajaran) {
            Swal.fire('Peringatan', 'Mohon lengkapi data jurnal (Kelas, Mapel, Topik) terlebih dahulu.', 'warning');
            return;
        }

        // Konfirmasi sebelum simpan
        const result = await Swal.fire({
            title: 'Simpan Absensi?',
            text: `Anda akan menyimpan data untuk ${students.length} siswa.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Simpan',
            confirmButtonColor: '#3085d6',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                // TAHAP A: Simpan Jurnal Sesi dulu (Header)
                // Kita akan mendapatkan ID Jurnal baru dari sini
                const resJurnal = await api.post('/jurnal-sesi', formData);
                const jurnalId = resJurnal.data.jurnal_sesi_id;

                // TAHAP B: Siapkan Data Absensi (Detail)
                const absensiPayload = students.map(s => ({
                    siswa_id: s.id,
                    status: attendance[s.id].status,
                    keterangan: attendance[s.id].keterangan
                }));

                // TAHAP C: Kirim Data Absensi Batch
                await api.post('/absensi/batch', {
                    jurnal_sesi_id: jurnalId,
                    absensi_data: absensiPayload
                });

                // Sukses!
                await Swal.fire('Berhasil!', 'Data absensi dan jurnal telah tersimpan.', 'success');
                navigate('/dashboard'); // Kembali ke dashboard atau riwayat

            } catch (err) {
                console.error(err);
                Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan data.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans pb-24">
            <div className="max-w-5xl mx-auto">
                {/* Header & Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Input Absensi</h1>
                        <p className="text-sm text-gray-500">Isi jurnal mengajar dan kehadiran siswa</p>
                    </div>
                </div>

                {/* FORM JURNAL (BAGIAN ATAS) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-fade-in-down">
                    <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <BookOpen className="w-5 h-5" /> Data Jurnal Mengajar
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Baris 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input type="date" className="w-full pl-9 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Ke-</label>
                            <div className="relative">
                                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input type="text" placeholder="Contoh: 1-2" className="w-full pl-9 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.sesi} onChange={e => setFormData({...formData, sesi: e.target.value})} 
                                />
                            </div>
                        </div>

                        {/* Baris 2: Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                            <select className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={formData.kelas_id} onChange={e => setFormData({...formData, kelas_id: e.target.value})}
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                            <select className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={formData.mata_pelajaran_id} onChange={e => setFormData({...formData, mata_pelajaran_id: e.target.value})}
                            >
                                <option value="">-- Pilih Mapel --</option>
                                {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama_mapel} ({m.kode_mapel})</option>)}
                            </select>
                        </div>

                        {/* Baris 3: Textarea */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topik / Materi Pembelajaran</label>
                            <textarea rows="2" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="Materi apa yang Anda ajarkan hari ini?"
                                value={formData.topik_pembelajaran} onChange={e => setFormData({...formData, topik_pembelajaran: e.target.value})}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* LIST SISWA (BAGIAN BAWAH) */}
                {students.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-600" /> Daftar Hadir Siswa
                            </h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                                Total: {students.length} Siswa
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 w-10 text-center">No</th>
                                        <th className="p-4">Nama Siswa</th>
                                        <th className="p-4 text-center w-64">Status Kehadiran</th>
                                        <th className="p-4 w-48">Keterangan (Opsional)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((siswa, index) => (
                                        <tr key={siswa.id} className={`hover:bg-gray-50 transition duration-150 ${attendance[siswa.id]?.status !== 'Hadir' ? 'bg-orange-50' : ''}`}>
                                            <td className="p-4 text-center text-gray-500 font-medium">{index + 1}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{siswa.nama_siswa}</div>
                                                <div className="text-xs text-gray-400 font-mono">{siswa.nis}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-1 bg-gray-100 p-1 rounded-lg">
                                                    {['Hadir', 'Sakit', 'Izin', 'Alpa'].map(status => (
                                                        <label key={status} className={`
                                                            cursor-pointer px-3 py-1.5 rounded-md text-xs font-bold transition-all flex-1 text-center select-none
                                                            ${attendance[siswa.id]?.status === status 
                                                                ? (status === 'Hadir' ? 'bg-emerald-500 text-white shadow-sm' : 
                                                                   status === 'Alpa' ? 'bg-red-500 text-white shadow-sm' : 
                                                                   'bg-amber-500 text-white shadow-sm')
                                                                : 'text-gray-500 hover:bg-gray-200'
                                                            }
                                                        `}>
                                                            <input 
                                                                type="radio" 
                                                                name={`status-${siswa.id}`} 
                                                                className="hidden"
                                                                checked={attendance[siswa.id]?.status === status}
                                                                onChange={() => handleStatusChange(siswa.id, status)}
                                                            />
                                                            {status === 'Alpa' ? 'A' : status.charAt(0)}
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="text-[10px] text-center text-gray-400 mt-1">
                                                    H=Hadir, S=Sakit, I=Izin, A=Alpha
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="Catatan..."
                                                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400 bg-transparent"
                                                    value={attendance[siswa.id]?.keterangan || ''}
                                                    onChange={(e) => handleKeteranganChange(siswa.id, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Silakan pilih Kelas terlebih dahulu untuk menampilkan siswa.</p>
                    </div>
                )}
            </div>

            {/* FLOATING ACTION BUTTON (FAB) - TOMBOL SIMPAN */}
            {students.length > 0 && (
                <div className="fixed bottom-8 right-8 z-30 animate-bounce-in">
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg transition transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
                    >
                        {isLoading ? (
                            'Menyimpan...'
                        ) : (
                            <>
                                <Save className="w-6 h-6" /> 
                                <span>SIMPAN ABSENSI</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default InputAbsensi;