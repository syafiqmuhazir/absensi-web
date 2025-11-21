import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users,          // Guru
    GraduationCap,  // Siswa
    Building2,      // Kelas
    BookOpen,       // Mapel
    ShieldCheck,    // User Admin
    LogOut,         // Logout
    PenSquare,      // Mulai Mengajar
    History,        // Riwayat Pribadi
    School,         // Logo Sekolah
    Lock,           // Ganti Password
    ClipboardCheck, // Icon Rekap Absensi (Baru)
    FileText,       // Icon Jurnal (Baru)
    BarChart3       // Icon Header Laporan (Baru)
} from "lucide-react";
import ChangePasswordModal from '../components/ChangePasswordModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
                        <School className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 leading-tight">SINAU</h1>
                        <p className="text-[10px] text-gray-500 font-medium tracking-wide">Sistem Monitoring Siswa Terpadu</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-700">{user.username}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.role}
                        </span>
                    </div>
                    
                    <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        title="Ganti Password"
                    >
                        <Lock className="w-4 h-4" />
                        <span className="hidden md:inline">Password</span>
                    </button>

                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group"
                    >
                        <span>Keluar</span>
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </nav>

            {/* Konten Utama */}
            <main className="p-6 max-w-7xl mx-auto mt-4 space-y-10">
                
                {/* BAGIAN 1: MENU UTAMA (DATA MASTER) - HANYA ADMIN */}
                {user.role === 'admin' && (
                    <>
                        <section>
                            <div className="mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-purple-600" />
                                <h2 className="text-xl font-bold text-gray-800">Menu Data Master</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                <MenuCard 
                                    title="Data Guru" 
                                    desc="Kelola pengajar" 
                                    icon={<Users className="w-7 h-7 text-blue-600" />}
                                    bgIcon="bg-blue-50"
                                    onClick={() => navigate('/dashboard/guru')} 
                                />
                                <MenuCard 
                                    title="Data Siswa" 
                                    desc="Kelola siswa" 
                                    icon={<GraduationCap className="w-7 h-7 text-emerald-600" />}
                                    bgIcon="bg-emerald-50"
                                    onClick={() => navigate('/dashboard/siswa')} 
                                />
                                <MenuCard 
                                    title="Data Kelas" 
                                    desc="Kelola rombel" 
                                    icon={<Building2 className="w-7 h-7 text-violet-600" />}
                                    bgIcon="bg-violet-50"
                                    onClick={() => navigate('/dashboard/kelas')} 
                                />
                                <MenuCard 
                                    title="Mata Pelajaran" 
                                    desc="Kelola mapel" 
                                    icon={<BookOpen className="w-7 h-7 text-amber-600" />}
                                    bgIcon="bg-amber-50"
                                    onClick={() => navigate('/dashboard/mapel')} 
                                />
                                <MenuCard 
                                    title="User System" 
                                    desc="Akun Login" 
                                    icon={<ShieldCheck className="w-7 h-7 text-gray-600" />}
                                    bgIcon="bg-gray-100"
                                    onClick={() => navigate('/dashboard/users')} 
                                />
                            </div>
                        </section>

                        {/* BAGIAN BARU: SUPERVISI & LAPORAN - HANYA ADMIN */}
                        <section>
                            <div className="mb-6 flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-orange-600" />
                                <h2 className="text-xl font-bold text-gray-800">Supervisi & Laporan</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MenuCard 
                                    title="Rekap Absensi" 
                                    desc="Laporan kehadiran siswa global" 
                                    icon={<ClipboardCheck className="w-7 h-7 text-orange-600" />}
                                    bgIcon="bg-orange-50"
                                    onClick={() => navigate('/dashboard/rekap-absensi')} 
                                />
                                <MenuCard 
                                    title="Monitoring Jurnal" 
                                    desc="Cek aktivitas mengajar guru" 
                                    icon={<FileText className="w-7 h-7 text-pink-600" />}
                                    bgIcon="bg-pink-50"
                                    onClick={() => navigate('/dashboard/monitoring-jurnal')} 
                                />
                            </div>
                        </section>
                    </>
                )}

                {/* BAGIAN 3: MENU AKADEMIK (ABSENSI) - ADMIN & GURU BISA AKSES */}
                <section>
                    <div className="mb-6 flex items-center gap-2">
                        <PenSquare className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Aktivitas Akademik</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* KARTU MULAI MENGAJAR */}
                        <div 
                            onClick={() => navigate('/guru/absensi')}
                            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-center gap-6 relative overflow-hidden"
                        >
                            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            
                            <div className="bg-blue-100 p-4 rounded-xl text-blue-600 relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <PenSquare className="w-8 h-8" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Mulai Mengajar</h3>
                                <p className="text-sm text-gray-500 mt-1">Isi jurnal harian & absensi siswa di kelas</p>
                            </div>
                        </div>

                        {/* KARTU RIWAYAT PRIBADI */}
                        <div 
                            onClick={() => navigate('/guru/riwayat')}
                            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex items-center gap-6 relative overflow-hidden"
                        >
                            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                            <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600 relative z-10 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <History className="w-8 h-8" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Riwayat Saya</h3>
                                <p className="text-sm text-gray-500 mt-1">Lihat jurnal mengajar saya sebelumnya</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Modal Ganti Password */}
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};

// Komponen Card Kecil (Untuk Menu Admin)
const MenuCard = ({ title, desc, icon, bgIcon, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col items-center text-center sm:items-start sm:text-left"
    >
        <div className={`w-12 h-12 ${bgIcon} rounded-lg flex items-center justify-center mb-4`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
);

export default Dashboard;