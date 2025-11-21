// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // Logika Satpam Admin:
    // 1. Jika user tidak ada (belum login) -> Ke Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Jika user ADA, tapi rolenya BUKAN admin -> Tendang ke Dashboard
    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Jika Admin -> Silakan masuk
    return <Outlet />;
};

export default AdminRoute;