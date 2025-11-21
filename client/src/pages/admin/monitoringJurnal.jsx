import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Search, Calendar, FileText, User, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const MonitoringJurnal = () => {
    const [jurnals, setJurnals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    // Filter
    const [filterTanggal, setFilterTanggal] = useState(''); // Kosong = Semua
    const [searchTerm, setSearchTerm] = useState('');

    const fetchJurnal = async (page = 1) => {
        setIsLoading(true);
        try {
            let url = `/jurnal-sesi?page=${page}`;
            const response = await api.get(url);
            
            // --- PERBAIKAN: Deteksi Format Data Otomatis ---
            // Cek apakah data dibungkus pagination (.data.data) atau array langsung (.data)
            const dataValid = response.data.data ? response.data.data : response.data;

            // Pastikan hasilnya adalah Array, jika bukan (misal null), paksa jadi []
            setJurnals(Array.isArray(dataValid) ? dataValid : []);
            
            // Set pagination jika ada
            if (response.data.current_page) {
                setCurrentPage(response.data.current_page);
                setLastPage(response.data.last_page);
                setTotalData(response.data.total);
            }

        } catch (err) {
            console.error(err); // Lihat error di console agar lebih jelas
            Swal.fire('Error', 'Gagal memuat data jurnal.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJurnal(1);
    }, []);

    const filteredJurnals = (jurnals || []).filter(item => {
        // Pastikan properti guru dan mapel ada sebelum diakses (Optional Chaining ?.)
        const guruName = item.guru?.nama_guru || '';
        const mapelName = item.mata_pelajaran?.nama_mapel || '';

        const matchSearch = guruName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            mapelName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchDate = filterTanggal ? item.tanggal === filterTanggal : true;
        
        return matchSearch && matchDate;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Monitoring Jurnal Guru</h1>
                    <nav className="text-sm text-gray-500 mt-1">
                        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> / Supervisi
                    </nav>
                </div>

                {/* FILTER BAR */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari Nama Guru atau Mapel..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-1/4">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="date" 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-gray-600"
                            value={filterTanggal}
                            onChange={(e) => setFilterTanggal(e.target.value)}
                        />
                    </div>
                    {filterTanggal && (
                        <button onClick={() => setFilterTanggal('')} className="text-sm text-red-500 hover:underline">
                            Reset Tanggal
                        </button>
                    )}
                </div>

                {/* TIMELINE / LIST JURNAL */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center p-8 text-gray-500">Memuat data jurnal...</div>
                    ) : filteredJurnals.length > 0 ? (
                        filteredJurnals.map((jurnal) => (
                            <div key={jurnal.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-6">
                                {/* Bagian Kiri: Waktu & Guru */}
                                <div className="md:w-1/4 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(jurnal.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="font-bold text-lg text-gray-800">{jurnal.sesi}</div>
                                    
                                    <div className="mt-auto flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{jurnal.guru.nama_guru}</p>
                                            <p className="text-xs text-gray-400">NIP: {jurnal.guru.nip || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian Kanan: Detail Pembelajaran */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs font-bold border border-pink-100">
                                            {jurnal.kelas.nama_kelas}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm font-semibold text-gray-600">
                                            <BookOpen className="w-4 h-4" /> {jurnal.mata_pelajaran.nama_mapel}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Materi / Topik:</h4>
                                        <p className="text-gray-800 leading-relaxed">{jurnal.topik_pembelajaran}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Belum ada data jurnal mengajar yang sesuai.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Sederhana */}
                <div className="mt-6 flex justify-center gap-2">
                    <button disabled={currentPage===1} onClick={()=>fetchJurnal(currentPage-1)} className="px-4 py-2 bg-white border rounded disabled:opacity-50">Prev</button>
                    <span className="px-4 py-2 text-gray-500">Halaman {currentPage}</span>
                    <button disabled={currentPage===lastPage} onClick={()=>fetchJurnal(currentPage+1)} className="px-4 py-2 bg-white border rounded disabled:opacity-50">Next</button>
                </div>

            </div>
        </div>
    );
};

export default MonitoringJurnal;