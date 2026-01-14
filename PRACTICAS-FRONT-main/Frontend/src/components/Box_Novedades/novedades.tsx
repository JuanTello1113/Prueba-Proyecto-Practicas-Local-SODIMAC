import axios from 'axios';
import apiClient from '../../api/client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  getColorPorEstado,
  getIconNamePorEstado,
  getIconoPorEstado,
} from '../../utils/iconosPorEstado';
import { getMensajePorEstado } from '../../utils/mensajesPorEstado';

type Estado =
  | 'CREADA'
  | 'GESTIONADA'
  | 'EN GESTIÓN'
  | 'RECHAZADA'
  | 'PENDIENTE';

interface Novedad {
  id_novedad: number;
  descripcion: string;
  fecha_creacion: string;
  estado_novedad: {
    nombre_estado: Estado;
  };
  tipo_novedad?: {
    nombre_tipo: string;
  };
  usuario: {
    usuario_tienda: {
      tienda: {
        nombre_tienda: string;
      };
    }[];
  };
  es_masiva?: boolean;
  cantidad_solicitudes?: number;
}

function getIconNameByTipoNovedad(tipo: string = ''): string {
  const tipoLower = tipo.toLowerCase();

  if (tipoLower.includes('transporte')) return 'FaBus';
  if (tipoLower.includes('descuento')) return 'FaMoneyBillAlt';
  if (tipoLower.includes('hora') || tipoLower.includes('extra'))
    return 'FaClock';
  if (tipoLower.includes('definitivo')) return 'FaFileSignature';
  if (tipoLower.includes('temporal')) return 'FaFileAlt';
  if (tipoLower.includes('vacaciones')) return 'FaUmbrellaBeach';

  return 'FaList';
}

const NovedadesRecientes: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [novedades, setNovedades] = useState<Novedad[]>([]);

  const fetchNovedades = async () => {
    try {
      const response = await axios.get<Novedad[]>(
        'http://localhost:3000/novedad',
        { withCredentials: true },
      );
      setNovedades(
        response.data.sort(
          (a, b) =>
            new Date(b.fecha_creacion).getTime() -
            new Date(a.fecha_creacion).getTime(),
        ),
      );
    } catch (error) {
      console.error('Error al obtener novedades: ', error);
    }
  };

  useEffect(() => {
    fetchNovedades();
    const interval = setInterval(fetchNovedades, 10000);
    return () => clearInterval(interval);
  }, []);

  const mostrarEstado = (novedad: Novedad): Estado => {
    const estadoReal = novedad.estado_novedad.nombre_estado;
    if (user?.esNomina && estadoReal === 'CREADA') return 'PENDIENTE';
    return estadoReal;
  };

  return (
    <div className="text-sm font-bold w-full max-w-md bg-gray-100 rounded-2xl shadow-inner flex flex-col space-y-3 p-3">
      <div className="flex flex-col space-y-3 max-h-[200px] overflow-y-auto pr-1">
        {[...novedades]
          .sort((a, b) => b.id_novedad - a.id_novedad)
          .map((novedad) => {
            const tiendaNombre =
              novedad.usuario?.usuario_tienda?.[0]?.tienda?.nombre_tienda ??
              'Sin tienda asociada';

            const estadoVisual = mostrarEstado(novedad);
            const icono = getIconoPorEstado(estadoVisual, user?.esNomina);
            const mensajeTexto = getMensajePorEstado(
              mostrarEstado(novedad), // ← eso te devuelve 'CREADA', 'GESTIONADA', etc.
              user?.esNomina ?? false,
              !novedad.es_masiva,
            );

            return (
              <div
                key={novedad.id_novedad}
                className="flex items-start bg-white rounded-xl shadow-sm p-3 relative cursor-pointer transform transition-transform duration-150 hover:scale-[1.01] border border-gray-100"
                onClick={() =>
                  navigate(
                    novedad.es_masiva
                      ? user?.esNomina
                        ? `/vista-previa-masiva-novedad-nomina/${novedad.id_novedad}`
                        : `/vista-previa-masiva-tienda/${novedad.id_novedad}`
                      : user?.esNomina
                        ? `/vista-previa-individual-nomina/${novedad.id_novedad}`
                        : `/vista-previa-individual-tienda/${novedad.id_novedad}`,
                    {
                      state: {
                        id_novedad: novedad.id_novedad,
                        descripcion: novedad.descripcion,
                        tipo: novedad.tipo_novedad?.nombre_tipo ?? 'Sin tipo',
                        estado: estadoVisual,
                        tienda: tiendaNombre,
                        fecha: novedad.fecha_creacion,
                        cantidad: novedad.cantidad_solicitudes ?? 'N/A',
                        iconName: getIconNameByTipoNovedad(
                          novedad.tipo_novedad?.nombre_tipo,
                        ),
                        iconoEstado: getIconNamePorEstado(
                          estadoVisual,
                          user?.esNomina,
                        ),
                        mensajeTexto: mensajeTexto,
                      },
                    },
                  )
                }
              >
                {/* Color Strip */}
                <div
                  className={`w-1.5 h-full rounded-l-md absolute left-0 top-0 bottom-0 ${getColorPorEstado(estadoVisual)}`}
                />

                <div className="pl-3 pr-1 flex-1 flex flex-col gap-1.5">
                  {/* Header: Title + Date */}
                  <div className="flex justify-between items-start w-full">
                    <p className="text-sm font-bold text-gray-800 leading-tight mr-2">
                      SOLICITUD #{novedad.id_novedad}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {novedad.fecha_creacion ? new Date(novedad.fecha_creacion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : ''}
                    </span>
                  </div>

                  {/* Subtitle / Type */}
                  <p className="text-xs font-semibold text-gray-600 -mt-1">
                    {estadoVisual} - {novedad.tipo_novedad?.nombre_tipo ?? 'Sin tipo'}
                  </p>

                  {/* Message */}
                  {mensajeTexto && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 p-1.5 rounded-md">
                      <span className="flex-shrink-0">{icono}</span>
                      <span className="leading-snug">{mensajeTexto}</span>
                    </div>
                  )}

                  {/* Footer Details */}
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    <span className="font-medium text-gray-600">{tiendaNombre}</span>
                    {novedad.es_masiva && (
                      <>
                        <span className="mx-1">•</span>
                        {novedad.cantidad_solicitudes ?? 0} sol.
                        <span className="mx-1">•</span>
                        📎 Adjunto
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default NovedadesRecientes;
