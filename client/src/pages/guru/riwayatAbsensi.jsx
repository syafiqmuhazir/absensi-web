import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Search,
  Calendar,
  BookOpen,
  Clock,
  List,
  Table,
  ChevronRight,
  Filter,
  Users,
  FileDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const RiwayatAbsensi = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("timeline");

  // STATE TIMELINE
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterTanggal, setFilterTanggal] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // STATE REKAP DETAIL
  const dateNow = new Date();
  const [filterRekap, setFilterRekap] = useState({
    bulan: dateNow.getMonth() + 1,
    tahun: dateNow.getFullYear(),
    kelas_id: "",
    mata_pelajaran_id: "",
  });

  // Data Master untuk Dropdown Filter
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  // Hasil Data Matrix
  const [matrixData, setMatrixData] = useState({ siswas: [], matrix: {} });

  // --- 1. FETCH DATA MASTER (KELAS & MAPEL) ---
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [resKelas, resMapel] = await Promise.all([
          api.get("/kelas"),
          api.get("/mata-pelajaran"),
        ]);
        setKelasList(resKelas.data.data ? resKelas.data.data : resKelas.data);
        setMapelList(resMapel.data.data ? resMapel.data.data : resMapel.data);
      } catch (e) {
        console.error("Gagal load master data");
      }
    };
    loadMaster();
    fetchRiwayat(1); // Load timeline awal
  }, []);

  // --- 2. FETCH TIMELINE ---
  const fetchRiwayat = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/jurnal-sesi?page=${page}`);
      const dataValid = response.data.data ? response.data.data : [];
      setRiwayat(dataValid);
      if (response.data.current_page) {
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. FETCH REKAP DETAIL (MATRIX) ---
  const fetchRekapDetail = async (e) => {
    if (e) e.preventDefault();

    if (!filterRekap.kelas_id || !filterRekap.mata_pelajaran_id) {
      Swal.fire(
        "Filter Kurang",
        "Mohon pilih Kelas dan Mata Pelajaran terlebih dahulu.",
        "warning"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get("/jurnal-sesi/rekap-detail", {
        params: filterRekap,
      });
      setMatrixData(response.data);
    } catch (err) {
      Swal.fire("Gagal", "Gagal memuat rekap.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Array Tanggal 1-31
  const daysInMonth = new Date(
    filterRekap.tahun,
    filterRekap.bulan,
    0
  ).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter Timeline Client Side
  const filteredRiwayat = riwayat.filter((item) =>
    filterTanggal ? item.tanggal === filterTanggal : true
  );

  const handleDownload = async () => {
    setIsDownloading(true); // 1. Mulai Loading
    try {
      const response = await api.get("/jurnal-sesi/export", {
        params: filterRekap,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Nama file lebih lengkap
      link.setAttribute(
        "download",
        `Rekap_${filterRekap.bulan}_${filterRekap.tahun}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Opsional: Notifikasi kecil selesai
      Swal.fire({
        icon: "success",
        title: "Download Selesai",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      // ... error handling yang tadi ...
      console.error("Download Error", err);
      Swal.fire("Gagal", "Gagal mendownload file.", "error");
    } finally {
      setIsDownloading(false); // 2. Selesai Loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Riwayat Mengajar
            </h1>
            <nav className="text-sm text-gray-500 mt-1">
              <Link to="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>{" "}
              / Riwayat
            </nav>
          </div>
          <button
            onClick={() => navigate("/guru/absensi")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition"
          >
            + Input Baru
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 px-2 flex items-center gap-2 font-medium transition ${
              activeTab === "timeline"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-5 h-5" /> Timeline Jurnal
          </button>
          <button
            onClick={() => setActiveTab("rekap")}
            className={`pb-3 px-2 flex items-center gap-2 font-medium transition ${
              activeTab === "rekap"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Table className="w-5 h-5" /> Rekap Absensi Kelas
          </button>
        </div>

        {/* === TAB 1: TIMELINE (Jurnal Harian) === */}
        {activeTab === "timeline" && (
          <div className="animate-fade-in-down">
            {/* Filter Tanggal */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center gap-3 max-w-md">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase">
                  Filter Tanggal
                </p>
                <input
                  type="date"
                  className="outline-none text-gray-700 w-full font-medium bg-transparent cursor-pointer"
                  value={filterTanggal}
                  onChange={(e) => setFilterTanggal(e.target.value)}
                />
              </div>
              {filterTanggal && (
                <button
                  onClick={() => setFilterTanggal("")}
                  className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-100 transition"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-400 text-sm">
                    Memuat riwayat mengajar...
                  </p>
                </div>
              ) : filteredRiwayat.length > 0 ? (
                filteredRiwayat.map((item) => {
                  const dateObj = new Date(item.tanggal);
                  const dayName = dateObj.toLocaleDateString("id-ID", {
                    weekday: "long",
                  });
                  const dayDate = dateObj.getDate();
                  const monthName = dateObj.toLocaleDateString("id-ID", {
                    month: "short",
                  });
                  const year = dateObj.getFullYear();

                  return (
                    <div
                      key={item.id}
                      className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden"
                    >
                      {/* Garis Aksen Kiri */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>

                      <div className="flex flex-col sm:flex-row">
                        {/* BAGIAN KIRI: TANGGAL BADGE */}
                        <div className="sm:w-32 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100 p-4 flex flex-col items-center justify-center text-center group-hover:bg-blue-50 transition-colors">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            {monthName} {year}
                          </span>
                          <span className="text-4xl font-extrabold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {dayDate}
                          </span>
                          <span className="text-sm font-medium text-gray-600 mt-1">
                            {dayName}
                          </span>
                        </div>

                        {/* BAGIAN KANAN: KONTEN */}
                        <div className="flex-1 p-5">
                          <div className="flex justify-between items-start mb-3">
                            {/* Mapel & Kelas */}
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                {item.mata_pelajaran?.nama_mapel || "Mapel ?"}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  <Users className="w-3 h-3" />
                                  {item.kelas?.nama_kelas || "Kelas ?"}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                  <Clock className="w-3 h-3" />
                                  Jam ke: {item.sesi}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Kotak Materi */}
                          <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                            {/* Ikon Kutip Hiasan */}
                            <div className="absolute top-2 left-2 opacity-10 text-blue-500 pointer-events-none">
                              <svg
                                width="20"
                                height="20"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                              </svg>
                            </div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1 pl-1">
                              Topik Pembelajaran
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed pl-1">
                              {item.topik_pembelajaran ||
                                "Tidak ada catatan materi."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Belum Ada Riwayat
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Anda belum mengisi jurnal mengajar bulan ini.
                  </p>
                  <button
                    onClick={() => navigate("/guru/absensi")}
                    className="text-blue-600 font-bold hover:underline text-sm"
                  >
                    Mulai Mengajar Sekarang
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Timeline */}
            {lastPage > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchRiwayat(currentPage - 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Sebelumnya
                </button>
                <span className="px-4 py-2 text-sm text-gray-500 font-medium self-center">
                  Halaman {currentPage} dari {lastPage}
                </span>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => fetchRiwayat(currentPage + 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        )}
        {/* === TAB 2: REKAP ABSENSI PER KELAS (MATRIX) === */}
        {activeTab === "rekap" && (
          <div className="animate-fade-in-down">
            {/* CARD FILTER (Desain Baru) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" /> Filter Data Rekap
              </h3>

              <form onSubmit={fetchRekapDetail}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Input Bulan */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      Bulan
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        value={filterRekap.bulan}
                        onChange={(e) =>
                          setFilterRekap({
                            ...filterRekap,
                            bulan: e.target.value,
                          })
                        }
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("id-ID", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Input Tahun */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      Tahun
                    </label>
                    <input
                      type="number"
                      className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={filterRekap.tahun}
                      onChange={(e) =>
                        setFilterRekap({
                          ...filterRekap,
                          tahun: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Input Kelas */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      Kelas
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        value={filterRekap.kelas_id}
                        onChange={(e) =>
                          setFilterRekap({
                            ...filterRekap,
                            kelas_id: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.nama_kelas}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Input Mapel */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      Mata Pelajaran
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        value={filterRekap.mata_pelajaran_id}
                        onChange={(e) =>
                          setFilterRekap({
                            ...filterRekap,
                            mata_pelajaran_id: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Mapel --</option>
                        {mapelList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nama_mapel}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi (Dipisah ke bawah agar rapi) */}
                <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                  {/* Tombol Download (Hanya muncul jika data sudah ada) */}
                  {/* Tombol Download */}
                  {matrixData.siswas.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={isDownloading} // Matikan tombol saat loading
                      className={`flex items-center gap-2 border border-green-200 px-5 py-2.5 rounded-lg font-medium transition-all 
            ${
              isDownloading
                ? "bg-green-100 text-green-800 cursor-not-allowed"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
                    >
                      {isDownloading ? (
                        <>
                          {/* Ikon Loading Putar */}
                          <svg
                            className="animate-spin h-4 w-4 text-green-700"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4" />
                          <span>Download Excel</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-lg font-medium shadow-md transition-all hover:shadow-lg"
                  >
                    <Search className="w-4 h-4" />
                    Tampilkan Data
                  </button>
                </div>
              </form>
            </div>

            {/* Tabel Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-100 text-gray-700 border-b">
                    <tr>
                      <th className="p-3 sticky left-0 bg-gray-100 z-10 border-r w-10 font-bold text-center">
                        No
                      </th>
                      <th className="p-3 sticky left-10 bg-gray-100 z-10 border-r w-48 font-bold">
                        Nama Siswa
                      </th>
                      {daysArray.map((d) => (
                        <th
                          key={d}
                          className="p-1 text-center min-w-[32px] border-r text-xs font-semibold text-gray-500"
                        >
                          {d}
                        </th>
                      ))}
                      {/* Kolom Total */}
                      <th className="p-1 text-center w-10 bg-green-50 text-green-700 font-bold border-l text-xs">
                        H
                      </th>
                      <th className="p-1 text-center w-10 bg-blue-50 text-blue-700 font-bold text-xs">
                        S
                      </th>
                      <th className="p-1 text-center w-10 bg-yellow-50 text-yellow-700 font-bold text-xs">
                        I
                      </th>
                      <th className="p-1 text-center w-10 bg-red-50 text-red-700 font-bold text-xs border-r">
                        A
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {matrixData.siswas.length > 0 ? (
                      matrixData.siswas.map((siswa, idx) => {
                        // Hitung total
                        let h = 0,
                          s = 0,
                          i = 0,
                          a = 0;
                        daysArray.forEach((d) => {
                          const stat = matrixData.matrix[siswa.id]?.[d];
                          if (stat === "H") h++;
                          else if (stat === "S") s++;
                          else if (stat === "I") i++;
                          else if (stat === "A") a++;
                        });

                        return (
                          <tr
                            key={siswa.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 sticky left-0 bg-white z-10 border-r text-center text-gray-500 font-mono text-xs">
                              {idx + 1}
                            </td>
                            <td className="p-3 sticky left-10 bg-white z-10 border-r font-medium text-gray-800 truncate max-w-[150px] text-xs sm:text-sm">
                              {siswa.nama_siswa}
                            </td>
                            {daysArray.map((d) => {
                              const status = matrixData.matrix[siswa.id]?.[d];
                              let bgClass = "";
                              // Warna sel tabel
                              if (status === "H")
                                bgClass = "bg-green-100 text-green-700";
                              else if (status === "S")
                                bgClass = "bg-blue-100 text-blue-700";
                              else if (status === "I")
                                bgClass = "bg-yellow-100 text-yellow-700";
                              else if (status === "A")
                                bgClass = "bg-red-100 text-red-700 font-bold";

                              return (
                                <td
                                  key={d}
                                  className="p-0 border-r text-center align-middle h-10"
                                >
                                  {status && (
                                    <div
                                      className={`w-full h-full flex items-center justify-center font-bold text-[10px] ${bgClass}`}
                                    >
                                      {status}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            {/* Kolom Total */}
                            <td className="text-center font-bold bg-green-50 text-green-700 border-l text-xs">
                              {h}
                            </td>
                            <td className="text-center font-bold bg-blue-50 text-blue-700 text-xs">
                              {s}
                            </td>
                            <td className="text-center font-bold bg-yellow-50 text-yellow-700 text-xs">
                              {i}
                            </td>
                            <td className="text-center font-bold bg-red-50 text-red-700 border-r text-xs">
                              {a}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={daysInMonth + 7}
                          className="p-12 text-center text-gray-400 bg-gray-50"
                        >
                          <div className="flex flex-col items-center">
                            <Search className="w-10 h-10 mb-2 opacity-20" />
                            <p>
                              Silakan pilih filter kelas & mapel, lalu klik{" "}
                              <b>Tampilkan Data</b>.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatAbsensi;
