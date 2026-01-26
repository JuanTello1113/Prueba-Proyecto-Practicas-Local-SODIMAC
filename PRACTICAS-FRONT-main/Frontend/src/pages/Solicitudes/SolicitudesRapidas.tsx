import React, { useState } from 'react';
import {
    FaBus,
    FaClock,
    FaFileAlt,
    FaFileSignature,
    FaList,
    FaMoneyBillAlt,
    FaUmbrellaBeach,
    FaTrash,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AlertDiasNovedades from '../../components/Alerts/AlertDiasNovedades';
import BackToDashboard from '../../components/BackToDashboard/BackToDashboard';
import Footer from '../../components/Footer/Footer';
import FormSolicitudes from '../../components/Form_Solicitudes/Form';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/useAuth';
import apiClient from '../../api/client';

// TODOS los tipos de solicitud del dashboard
const TIPOS_SOLICITUD = [
    {
        id: 'auxTransport',
        titulo: 'Auxilio de transporte',
        iconName: 'FaBus',
        icon: <FaBus size={20} />,
    },
    {
        id: 'descuento',
        titulo: 'Descuento',
        iconName: 'FaMoneyBillAlt',
        icon: <FaMoneyBillAlt size={20} />,
    },
    {
        id: 'horasExtra',
        titulo: 'Horas Extra',
        iconName: 'FaClock',
        icon: <FaClock size={20} />,
    },
    {
        id: 'otroSiDef',
        titulo: 'Otro Si Definitivo',
        iconName: 'FaFileSignature',
        icon: <FaFileSignature size={20} />,
    },
    {
        id: 'otroSiTemp',
        titulo: 'Otro Si Temporal',
        iconName: 'FaFileAlt',
        icon: <FaFileAlt size={20} />,
    },
    {
        id: 'vacaciones',
        titulo: 'Vacaciones',
        iconName: 'FaUmbrellaBeach',
        icon: <FaUmbrellaBeach size={20} />,
    },
    {
        id: 'otros',
        titulo: 'Otros',
        iconName: 'FaList',
        icon: <FaList size={20} />,
    },
];

interface SolicitudEnCola {
    id: string;
    tipo: string;
    tipoTitulo: string;
    iconName: string;
    // Datos de Formularios Individuales
    cedula?: number;
    nombre?: string;
    detalle?: string;
    // Datos de Archivos Masivos
    archivo?: File;
    nombreArchivo?: string;
    // Estado de la solicitud
    status?: 'pending' | 'success' | 'error';
    errorMessage?: string;
}

const SolicitudesRapidas: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [solicitudesEnCola, setSolicitudesEnCola] = useState<
        SolicitudEnCola[]
    >([]);
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSelectType = (id: string) => {
        setSelectedType(id);
    };

    const handleAgregarACola = (data: {
        cedula?: number;
        nombre?: string;
        detalle?: string;
        archivo?: File;
        nombreArchivo?: string;
    }) => {
        if (!selectedType) return;

        const tipoSeleccionado = TIPOS_SOLICITUD.find((t) => t.id === selectedType);
        if (!tipoSeleccionado) return;

        const nuevaSolicitud: SolicitudEnCola = {
            id: `${Date.now()}-${Math.random()}`,
            tipo: selectedType,
            tipoTitulo: tipoSeleccionado.titulo,
            iconName: tipoSeleccionado.iconName,
            cedula: data.cedula,
            nombre: data.nombre,
            detalle: data.detalle,
            archivo: data.archivo,
            nombreArchivo: data.nombreArchivo,
        };

        setSolicitudesEnCola((prev) => [...prev, nuevaSolicitud]);
        setShowAddedMessage(true);
        setSelectedType(null); // Reset selection after adding
        setTimeout(() => setShowAddedMessage(false), 2000);
    };

    const handleEliminarDeCola = (id: string) => {
        setSolicitudesEnCola((prev) => prev.filter((s) => s.id !== id));
    };

    const handleEnviarTodas = async () => {
        if (solicitudesEnCola.length === 0) {
            alert('No hay solicitudes en la cola para enviar');
            return;
        }

        if (!window.confirm(`¿Deseas enviar ${solicitudesEnCola.length} solicitud(es)?`)) {
            return;
        }

        setIsSubmitting(true);
        const updatedQueue = [...solicitudesEnCola];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < updatedQueue.length; i++) {
            const solicitud = updatedQueue[i];

            // Don't retry already successful ones if user clicks send again?
            // Actually user might want to retry errors, so we process anything not 'success'
            if (solicitud.status === 'success') {
                successCount++;
                continue;
            }

            try {
                let response: any;
                let isSuccess = false;
                let errorMsg = '';

                // Caso 1: Archivo Masivo
                if (solicitud.archivo) {
                    const formData = new FormData();
                    formData.append('file', solicitud.archivo);
                    formData.append('titulo', solicitud.tipoTitulo);
                    formData.append('tipo', solicitud.tipoTitulo);
                    if (user) {
                        formData.append('nombreUsuario', user.nombre);
                        formData.append('nombreTienda', user.nombreTienda);
                    }

                    response = await apiClient.post(
                        '/archivo-adjunto/subir-archivo',
                        formData,
                        {
                            withCredentials: true,
                            headers: { 'Content-Type': 'multipart/form-data' },
                        }
                    );
                }
                // Caso 2: Formulario Individual
                else {
                    const payload = {
                        cedula: solicitud.cedula,
                        nombre: solicitud.nombre,
                        detalle: solicitud.detalle,
                        titulo: solicitud.tipoTitulo,
                        categoria: solicitud.tipoTitulo,
                        tienda: user?.nombreTienda ?? '',
                        jefe: user?.nombre ?? '',
                        fecha: new Date().toISOString(),
                    };

                    response = await apiClient.post(
                        '/archivo-adjunto/formulario-novedad',
                        payload,
                        { withCredentials: true }
                    );
                }

                // Check validation from backend
                if (response.data && response.data.valido === false) {
                    isSuccess = false;
                    // Extract error message
                    if (Array.isArray(response.data.errores)) {
                        errorMsg = response.data.errores.join('. ');
                    } else if (response.data.message) {
                        errorMsg = response.data.message;
                    } else {
                        errorMsg = 'Error desconocido al procesar la solicitud.';
                    }
                } else {
                    isSuccess = true;
                }

                if (isSuccess) {
                    updatedQueue[i] = { ...solicitud, status: 'success', errorMessage: undefined };
                    successCount++;
                } else {
                    updatedQueue[i] = { ...solicitud, status: 'error', errorMessage: errorMsg };
                    failCount++;
                }

            } catch (error: any) {
                console.error(`Error enviando solicitud ${i + 1}:`, error);
                const msg = error.response?.data?.message || error.message || 'Error de red o servidor';
                updatedQueue[i] = { ...solicitud, status: 'error', errorMessage: msg };
                failCount++;
            }

            // Update state progressively or just at the end?
            // Reporting progress is nice but let's do it at the end to avoid too many re-renders
        }

        setSolicitudesEnCola(updatedQueue);
        setIsSubmitting(false);

        // Remove successful ones? Or keep them marked as success?
        // User request implied they want to see what failed.
        // Let's filter out successes to clean up the view, ONLY IF user matches expectations.
        // But plan said "Failed requests will remain". Converting success to disappear is standard.
        // Let's remove successful ones after a short delay or immediately?
        // "Que se agregue la opción de decir que archivo en específico falló"
        // Better UX: Keep failed ones. Remove success ones.

        const retryQueue = updatedQueue.filter(s => s.status !== 'success');
        setSolicitudesEnCola(retryQueue);

        let message = `✅ Procesado terminado.\nEnviadas: ${successCount}\nFallidas: ${failCount}`;
        if (failCount > 0) {
            message += `\n\n⚠️ Las solicitudes fallidas permanecen en la lista con el detalle del error.`;
        } else if (successCount > 0 && failCount === 0) {
            setTimeout(() => navigate('/dashboard-jefe'), 1500);
        }

        alert(message);
    };

    const selectedTipo = TIPOS_SOLICITUD.find((t) => t.id === selectedType);

    return (
        <div className="min-h-screen w-screen flex flex-col bg-white">
            <Navbar />
            <BackToDashboard />

            <div className="absolute top-20 right-2 z-50">
                <AlertDiasNovedades mostrarSoloCorto />
            </div>

            <main className="flex-grow pt-24 pb-32 px-4 sm:px-8 w-full max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        📦 Solicitudes Rápidas - Creación por Lotes
                    </h1>
                    <p className="text-gray-600">
                        Crea múltiples solicitudes de diferentes tipos y envíalas todas de
                        una vez. Agrega solicitudes a la cola y procésalas en bloque.
                    </p>
                </div>

                {/* Added Message */}
                {showAddedMessage && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md animate-fade-in">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-green-500 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-green-700 font-medium">
                                ¡Solicitud agregada a la cola!
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel: Request Queue */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        {/* Type Selector */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                1️⃣ Selecciona el Tipo
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                {TIPOS_SOLICITUD.map((tipo) => (
                                    <button
                                        key={tipo.id}
                                        onClick={() => handleSelectType(tipo.id)}
                                        className={`p-3 rounded-lg border-2 transition-all text-left ${selectedType === tipo.id
                                            ? 'border-[#4669AF] bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div
                                                className={`text-xl ${selectedType === tipo.id ? 'text-[#4669AF]' : 'text-gray-400'}`}
                                            >
                                                {tipo.icon}
                                            </div>
                                            <p
                                                className={`text-xs font-semibold text-center ${selectedType === tipo.id ? 'text-[#4669AF]' : 'text-gray-700'}`}
                                            >
                                                {tipo.titulo}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Queue Display */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800">
                                    📋 Cola de Solicitudes
                                </h2>
                                <span className="px-3 py-1 bg-[#4669AF] text-white text-sm font-bold rounded-full">
                                    {solicitudesEnCola.length}
                                </span>
                            </div>

                            {solicitudesEnCola.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg
                                        className="w-16 h-16 mx-auto mb-3 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <p className="text-sm text-gray-500">
                                        No hay solicitudes en cola
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {solicitudesEnCola.map((solicitud, index) => (
                                        <div
                                            key={solicitud.id}
                                            className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${solicitud.status === 'error'
                                                ? 'bg-red-50 border-red-300'
                                                : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4669AF] text-white flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm text-gray-800 truncate">
                                                        {solicitud.tipoTitulo}
                                                    </p>
                                                    {solicitud.archivo ? (
                                                        <p className="text-xs text-blue-600 truncate flex items-center gap-1">
                                                            📂 {solicitud.nombreArchivo}
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs text-gray-600 truncate">
                                                                👤 {solicitud.nombre}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                🆔 CC: {solicitud.cedula}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleEliminarDeCola(solicitud.id)}
                                                    className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>

                                            {/* Error Message Section */}
                                            {solicitud.status === 'error' && (
                                                <div className="mt-1 p-2 bg-white border border-red-100 rounded text-xs text-red-600 flex items-start gap-2 shadow-sm animate-fade-in">
                                                    <span className="font-bold text-lg leading-none">⚠️</span>
                                                    <span>{solicitud.errorMessage || 'Error desconocido'}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {solicitudesEnCola.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleEnviarTodas}
                                        disabled={isSubmitting}
                                        className={`w-full font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Enviar Todas ({solicitudesEnCola.length})
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="w-full lg:w-2/3">
                        {!selectedType ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center h-full flex items-center justify-center">
                                <div className="max-w-md">
                                    <svg
                                        className="w-24 h-24 mx-auto mb-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                        />
                                    </svg>
                                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                                        2️⃣ Crea tu solicitud
                                    </h3>
                                    <p className="text-gray-500">
                                        Selecciona un tipo de solicitud del panel izquierdo para
                                        comenzar a completar el formulario.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        {selectedTipo?.icon}
                                        <span>{selectedTipo?.titulo}</span>
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Completa los datos y haz clic en "Agregar a Cola" para
                                        incluir esta solicitud en el lote.
                                    </p>
                                </div>

                                <FormSolicitudes
                                    titulo={selectedTipo?.titulo}
                                    iconName={selectedTipo?.iconName}
                                    onAddToQueue={handleAgregarACola}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SolicitudesRapidas;
