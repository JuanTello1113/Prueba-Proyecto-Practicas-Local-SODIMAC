import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (import.meta.env.DEV) {
    console.log('🔍 Usuario recibido en ProtectedRoute:', user);
  }

  let userRole = "";
  if (user.esAdmin) userRole = "admin";
  else if (user.esNomina) userRole = "nomina";
  else if (user.esJefe) userRole = "jefe";

  if (import.meta.env.DEV) {
    console.log('Rol normalizado del usuario:', userRole);
    console.log('Roles permitidos:', allowedRoles);
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;