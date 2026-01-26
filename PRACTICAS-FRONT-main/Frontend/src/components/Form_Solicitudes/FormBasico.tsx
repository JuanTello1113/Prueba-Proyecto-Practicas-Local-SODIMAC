import axios from 'axios';
import apiClient from '../../api/client';
import React, { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo_home from '../../assets/logos/Logo_home.png';
import { useAuth } from '../../context/useAuth';
import ErroresArchivoAlert from '../Alerts/ErroresArchivoAlert';
import ExitoArchivoAlert from '../Alerts/ExitoArchivoAlert';

interface FormularioBasicoProps {
  titulo?: string;
  onAddToQueue?: (formData: { cedula: number; nombre: string; detalle: string }) => void;
}

const FormularioBasico: React.FC<FormularioBasicoProps> = ({ titulo: propsTitulo, onAddToQueue }) => {
  const { user } = useAuth();
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const titulo = propsTitulo || location.state?.titulo || 'No disponible';

  const [isFormValid, setIsFormValid] = useState(false);

  const [erroresArchivo, setErroresArchivo] = useState<string[] | null>(null);
  const [archivoSubido, setArchivoSubido] = useState<{
    nombreArchivo: string;
    tituloNovedad: string;
    idCaso: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isValid =
      /^\d{6,}$/.test(cedula) &&
      /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'.-]+$/.test(nombre) &&
      detalle.trim().length > 0 &&
      detalle.trim().length <= 250;

    setIsFormValid(isValid);
  }, [cedula, nombre, detalle]);

  const handleSubmit = async () => {
    // Si viene la prop onAddToQueue, usamos esa lógica en vez de enviar al backend
    if (onAddToQueue) {
      onAddToQueue({
        cedula: Number(cedula),
        nombre,
        detalle,
      });
      // Limpiamos el form o damos feedback visual
      setCedula('');
      setNombre('');
      setDetalle('');
      return;
    }

    try {
      setIsLoading(true);
      setErroresArchivo(null);
      setArchivoSubido(null);

      const payload = {
        cedula: Number(cedula),
        nombre,
        detalle,
        titulo,
        categoria: titulo, // 👈 obligatorio para que no quede como '-'
        tienda: user?.nombreTienda ?? '',
        jefe: user?.nombre ?? '',
        fecha: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          5,
          0,
          0,
          0,
        ).toISOString(), // 👈 igual que los masivos
      };

      if (import.meta.env.DEV) {
        console.log('📤 Enviando payload:', payload);
      }

      const response = await apiClient.post(
        '/archivo-adjunto/formulario-novedad',
        payload, // Assuming formData was a typo and payload should be used here based on the surrounding code.
        { withCredentials: true }
      );

      if (import.meta.env.DEV) {
        console.log('✅ Respuesta del backend:', response.data);
      }

      if (response.data?.valido) {
        setArchivoSubido({
          nombreArchivo: 'Formulario Individual',
          tituloNovedad: titulo,
          idCaso: response.data.novedadId,
        });

        // Podés esperar unos segundos o navegar directo
        setTimeout(() => navigate('/dashboard-jefe'), 2500);
      } else {
        setErroresArchivo(
          response.data.errores || [
            response.data.message || 'No se pudo crear la novedad',
          ],
        );
      }
    } catch (error: unknown) {
      console.error('❌ Error al enviar el formulario:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('📥 Error Response Data:', error.response.data);
          setErroresArchivo([
            error.response.data?.message || 'Error del servidor inesperado',
          ]);
        } else if (error.request) {
          setErroresArchivo(['No se pudo conectar con el servidor.']);
        } else {
          setErroresArchivo([`Error inesperado de Axios: ${error.message}`]);
        }
      } else {
        setErroresArchivo(['Error desconocido al enviar el formulario.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-gray-800 block font-semibold mb-2">
            Cédula del Empleado <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ej: 1000380380"
            className="w-full bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#4669AF] focus:border-transparent outline-none transition-all"
            value={cedula}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) setCedula(value);
            }}
          />
        </div>
        <div>
          <label className="text-gray-800 block font-semibold mb-2">
            Nombres Completos <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Camilo Andrés Gómez Bernal"
            className="w-full bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#4669AF] focus:border-transparent outline-none transition-all"
            value={nombre}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'.-]*$/.test(value)) {
                setNombre(value);
              }
            }}
          />
        </div>
      </div>

      {/* DETALLE + BOTONES */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6 items-start">
        {/* DETALLE */}
        <div>
          <label className="text-gray-800 block font-semibold mb-2">
            Escribe el detalle de la novedad{' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Escribe detalladamente la situación que amerita el auxilio de transporte…"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#4669AF] focus:border-transparent outline-none transition-all resize-none"
            rows={5}
            maxLength={250}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
          />
          <div className="text-sm text-right text-gray-500 mt-1">
            {detalle.length}/250
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex flex-col-reverse sm:flex-row lg:flex-col gap-3 pt-0 lg:pt-8 w-full">
          <button
            className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            onClick={() => navigate('/dashboard-jefe')}
          >
            Cancelar
          </button>
          <button
            className={`w-full px-4 py-3 rounded-lg text-white font-medium shadow-md transition-all transform active:scale-95 ${isFormValid
              ? 'bg-[#4669AF] hover:bg-[#36528A] hover:shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
              }`}
            disabled={!isFormValid}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FiClock className="animate-spin" />
                Procesando...
              </span>
            ) : onAddToQueue ? (
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold">+</span>
                Agregar solicitud a la cola
              </span>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>

      {erroresArchivo && (
        <ErroresArchivoAlert
          errores={erroresArchivo}
          onClose={() => setErroresArchivo(null)}
        />
      )}

      {archivoSubido && (
        <ExitoArchivoAlert
          nombreArchivo={archivoSubido.nombreArchivo}
          tituloNovedad={archivoSubido.tituloNovedad}
          idCaso={archivoSubido.idCaso}
          onClose={() => setArchivoSubido(null)}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex flex-col items-center justify-center transition-opacity duration-300">
          <img
            src={Logo_home}
            alt="Validando archivo"
            className="h-20 w-auto animate-bounce mb-4"
          />
          <p className="text-xl text-[#4669AF] font-semibold text-center flex items-center justify-center gap-2">
            Validando formulario
            <br />
            <FiClock className="animate-spin-slow text-2xl" />
          </p>
        </div>
      )}
    </div>
  );
};

export default FormularioBasico;
