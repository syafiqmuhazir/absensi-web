// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // Cek apakah ada token di LocalStorage
    const token = localStorage.getItem('token');

    // Logika Satpam:
    // Jika token ADA -> Boleh masuk (Outlet akan merender halaman tujuan)
    // Jika token TIDAK ADA -> Tendang ke /login
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;