import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, adminOnly = false }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
        return <Navigate to="/login" />;
    }
    
    if (adminOnly && userRole !== 'admin') {
        return <Navigate to="/dashboard" />;
    }
    
    return children;
}

export default PrivateRoute;