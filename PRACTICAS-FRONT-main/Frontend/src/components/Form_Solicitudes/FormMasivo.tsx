import React, { useContext, useRef, useState } from 'react';
import apiClient from '../../api/client';
import { FiClock } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo_home from '../../assets/logos/Logo_home.png';
import { AuthContext } from '../../context/AuthContext';
import ErroresArchivoAlert from '../Alerts/ErroresArchivoAlert';
import ExitoArchivoAlert from '../Alerts/ExitoArchivoAlert';
import NumeroSolicitudesAlert from '../Alerts/NumeroSolicitudes';

interface MasivoProps {
  titulo?: string;
  onAddToQueue?: (data: any) => void;
}

const Masivo: React.FC<MasivoProps> = ({ titulo: propsTitulo, onAddToQueue }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext debe estar dentro de un AuthProvider');
  }

  const { user } = authContext;

  const [isLoading, setIsLoading] = useState(false);

  const [archivoSubido, setArchivoSubido] = useState<{
    nombreArchivo: string;
    tituloNovedad: string;
    idCaso: number;
  } | null>(null);

  const [erroresArchivo, setErroresArchivo] = useState<string[] | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const titulo = propsTitulo || state?.titulo || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
    } else {
      alert('Por favor sube un archivo .xlsx válido.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      // Reseteamos el input para que permita subir el mismo archivo si se quiere volver a seleccionar
      e.target.value = '';
    } else {
      alert('Por favor sube un archivo .xlsx válido.');
    }
  };

  console.log('Título que llega desde el estado:', titulo);

  const descargarPlantilla = () => {
    setMostrarAlerta(true);
  };

  const ConfirmarCantidad = async (cantidad: number) => {
    setMostrarAlerta(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/archivo-adjunto/descargar-plantilla?titulo=${encodeURIComponent(titulo)}&cantidad=${cantidad}`,
        {
          method: 'GET',
          credentials: 'include', //IMPORTANTE
        },
      );

      if (!response.ok) throw new Error('No se pudo descargar la plantilla');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Plantilla_${titulo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al descargar la plantilla; ', err);
      alert('Hubo un problema al descargar la plantilla');
    }
  };

  const subirArchivo = async () => {
    if (!selectedFile) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile!);
    formData.append('titulo', titulo); //Para Backend
    formData.append('tipo', titulo); //Para Microservicio

    if (user) {
      formData.append('nombreUsuario', user.nombre);
      formData.append('nombreTienda', user.nombreTienda);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/archivo-adjunto/subir-archivo`,
        {
          method: 'POST',
          credentials: 'include', //cookies
          body: formData,
        },
      );

      const data = await response.json();

      //VALIDACIÓN FALLIDA DESDE EL BACKEND
      if (!response.ok || data.errores) {
        const errores =
          data.errores ||
          (data.message ? [data.message] : ['Error al subir archivo.']);

        if (data.error && typeof data.error === 'string') {
          errores.push(`Detalle: ${data.error}`);
        }

        setErroresArchivo(errores);
        return;
      }

      //VALIDACIÓN EXITOSA
      console.log('Respuesta del servidor:', data);

      setArchivoSubido({
        nombreArchivo: selectedFile.name,
        tituloNovedad: titulo,
        idCaso: data.novedadId, // <- del backend
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      alert('Hubo un problema al subir el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* ENCABEZADO */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Gestione las novedades de <span className="text-[#4669AF]">{titulo || 'Novedad'}</span> para los empleados
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Siga los pasos a continuación para procesar múltiples solicitudes de manera eficiente.
        </p>
      </div>

      {/* Pasos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Paso 1 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-50 rounded-xl transform transition-transform group-hover:scale-105 duration-300"></div>
          <div className="relative bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-full flex flex-col items-center text-center transition-all group-hover:border-blue-200">
            <div className="w-12 h-12 bg-blue-100 text-[#4669AF] rounded-full flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-[#4669AF] group-hover:text-white transition-colors">
              1
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Descargar Plantilla</h3>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
              Obtenga el formato Excel requerido para este tipo de novedad.
            </p>
            <button
              onClick={descargarPlantilla}
              className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-all font-medium text-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg">⬇</span> Descargar
            </button>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-50 rounded-xl transform transition-transform group-hover:scale-105 duration-300"></div>
          <div className="relative bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-full flex flex-col items-center text-center transition-all group-hover:border-blue-200">
            <div className="w-12 h-12 bg-blue-100 text-[#4669AF] rounded-full flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-[#4669AF] group-hover:text-white transition-colors">
              2
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Diligenciar</h3>
            <p className="text-sm text-gray-500 mb-4 flex-grow">
              Completa la información requerida en la plantilla descargada.
            </p>
            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-100 w-full text-left">
              <strong>Tips:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>No modifique los encabezados</li>
                <li>Use los códigos o nombres exactos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-50 rounded-xl transform transition-transform group-hover:scale-105 duration-300"></div>
          <div className="relative bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-full flex flex-col items-center text-center transition-all group-hover:border-blue-200">
            <div className="w-12 h-12 bg-blue-100 text-[#4669AF] rounded-full flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-[#4669AF] group-hover:text-white transition-colors">
              3
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Subir Archivo</h3>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
              Cargue el archivo Excel completado para su validación.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="file-upload"
              ref={fileInputRef} // Ensure ref is attached
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className={`w-full px-4 py-2.5 rounded-lg cursor-pointer transition-all font-medium text-sm flex items-center justify-center gap-2 ${selectedFile
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-[#4669AF] text-white hover:bg-[#36528A]'
                }`}
            >
              {selectedFile ? '✅ Archivo Cargado' : '☁ Subir Excel'}
            </label>
            {selectedFile && (
              <span className="text-xs text-gray-500 mt-2 truncate w-full px-2 block">
                {selectedFile.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zona de Drag & Drop (Opcional, la ocultamos si ya hay botones grandes, o la dejamos como alternativa visual) 
          Vamos a dejarla pero estilizada mejor si se desea, o quitarla para simplificar. 
          El diseño de 3 tarjetas con botón de subir en la 3ra reemplaza la necesidad de la zona grande inferior.
      */}

      {/* Boton Accion Principal y Regresar */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
        <button
          className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
          onClick={() => navigate('/dashboard-jefe')}
        >
          Cancelar
        </button>
        <button
          onClick={
            // Si hay archivo seleccionado pero no subido, validamos. Si ya subió (archivoSubido), solo mostramos exito?
            // La logica original usa un boton "Subir Archivo" dentro de la tarjeta 3 que dispara handleFileChange,
            // y un boton final que dispara subirArchivo (o handleUpload si existiera, aqui se llama subirArchivo).
            onAddToQueue && selectedFile
              ? () => {
                onAddToQueue({
                  archivo: selectedFile,
                  nombreArchivo: selectedFile.name
                });
                setSelectedFile(null);
                setArchivoSubido({
                  nombreArchivo: selectedFile.name,
                  tituloNovedad: titulo,
                  idCaso: 0 // No real ID yet
                });
                // Auto-clear success message after delay? Or let the parent handle it.
                // For now, let's just clear the file so user can add another.
              }
              : subirArchivo
          }
          disabled={!selectedFile || isLoading}
          className={`px-8 py-2.5 rounded-lg text-white font-bold shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 ${!selectedFile || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#4669AF] hover:bg-[#36528A] hover:shadow-lg'
            }`}
        >
          {isLoading ? (
            <>
              <FiClock className="animate-spin" /> Procesando...
            </>
          ) : onAddToQueue ? (
            <>
              <span className="text-xl font-bold">+</span>
              Agregar solicitud a la cola
            </>
          ) : (
            'Procesar Solicitudes'
          )}
        </button>
      </div>

      {mostrarAlerta && (
        <NumeroSolicitudesAlert
          onSubmit={ConfirmarCantidad}
          onClose={() => setMostrarAlerta(false)}
        />
      )}

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
            Validando archivo
            <br />
            <FiClock className="animate-spin-slow text-2xl" />
          </p>
        </div>
      )}

    </div>
  );
};

export default Masivo;
