import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

/**
 * BackToDashboard Component
 * Botón para volver al dashboard principal según el rol del usuario
 * Posición: Esquina superior izquierda debajo del Navbar
 */
const BackToDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Determinar la ruta del dashboard según el rol
    const getDashboardRoute = () => {
        if (!user || !user.rol) return '/';

        const rolLimpio = user.rol.trim().toLowerCase();

        if (rolLimpio === 'administrador' || rolLimpio === 'admin') {
            return '/dashboard-administrador';
        } else if (rolLimpio === 'gestor de nomina' || rolLimpio === 'nomina') {
            return '/dashboard-nomina';
        } else if (rolLimpio === 'jefe de tienda' || rolLimpio === 'jefe') {
            return '/dashboard-jefe';
        }

        return '/';
    };

    const handleBackClick = () => {
        const dashboardRoute = getDashboardRoute();
        navigate(dashboardRoute);
    };

    return (
        <button
            onClick={handleBackClick}
            className="
        fixed top-[75px] left-6 z-40
        flex items-center gap-2
        px-4 py-2
        bg-blue-600 hover:bg-blue-700
        text-white font-medium text-sm
        rounded-lg shadow-lg
        transition-all duration-200
        hover:shadow-xl hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
            title="Volver al dashboard principal"
        >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al Panel</span>
        </button>
    );
};

export default BackToDashboard;
