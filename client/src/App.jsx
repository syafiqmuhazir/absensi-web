// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import PrivateRoute from "./components/privateRoute";
import Guru from "./pages/admin/guru";
import AdminRoute from "./components/adminRoute";
import Siswa from "./pages/admin/siswa";
import Kelas from "./pages/admin/kelas";
import MataPelajaran from "./pages/admin/mataPelajaran";
import UserSystem from "./pages/admin/userSystem";
import RekapAbsensi from "./pages/admin/rekapAbsensi";
import MonitoringJurnal from "./pages/admin/monitoringJurnal";
import RiwayatAbsensi from "./pages/guru/riwayatAbsensi";
import InputAbsensi from "./pages/guru/inputAbsensi";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute "/" (root)
          Jika user buka alamat awal, langsung lempar ke /login 
        */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rute Login */}
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          {/* Rute Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/guru/riwayat" element={<RiwayatAbsensi />} />
          <Route path="/guru/absensi" element={<InputAbsensi />} />
          <Route element={<AdminRoute />}>
            {/* Rute Guru (Admin Only) */}
            <Route path="/dashboard/guru" element={<Guru />} />
            <Route path="/dashboard/siswa" element={<Siswa />} />
            <Route path="/dashboard/kelas" element={<Kelas />} />
            <Route path="/dashboard/mapel" element={<MataPelajaran />} />
            <Route path="/dashboard/users" element={<UserSystem />} />
            <Route path="/dashboard/rekap-absensi" element={<RekapAbsensi />} />
            <Route path="/dashboard/monitoring-jurnal" element={<MonitoringJurnal />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
