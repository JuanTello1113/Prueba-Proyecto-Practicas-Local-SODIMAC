import React from 'react';
import { Bell } from 'lucide-react';
import {
  FaBus,
  FaClock,
  FaFileAlt,
  FaFileSignature,
  FaList,
  FaMoneyBillAlt,
  FaUmbrellaBeach,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Franco from '../../../assets/images/Franco_Pensando_1-removebg-preview.png';
import AlertDiasNovedades from '../../../components/Alerts/AlertDiasNovedades';
import NovedadesRecientes from '../../../components/Box_Novedades/novedades';
import ExportacionesConsolidadas from '../../../components/Card_Consolidado/AccesoConsExport';
import CardsTitle from '../../../components/Cards/cardsTitle';
import Footer from '../../../components/Footer/Footer';
import Navbar from '../../../components/Navbar/Navbar';
import { useAuth } from '../../../context/useAuth';

const DashboardJefe: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 overflow-x-hidden">
      <Navbar />

      <main className="flex-grow px-4 sm:px-8 pt-4 sm:pt-6 pb-32 flex flex-col max-w-[1920px] mx-auto w-full">
        {/* ENCABEZADO */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8 flex-shrink-0 gap-6">
          {/* Bienvenida */}
          <div className="flex flex-col justify-center text-center lg:text-left w-full lg:w-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              ¡Bienvenido, {user?.nombre || 'Jefe'}!
            </h2>
            <p className="text-sm sm:text-base mt-2 text-gray-600">
              Gestione aquí todas sus solicitudes{' '}
              <span className="text-[#4669AF] font-bold">Post - Nómina</span>
            </p>
          </div>

          {/* Alerta */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:block transform hover:scale-[1.01] transition-transform duration-300">
            <AlertDiasNovedades />
          </div>

          {/* Novedades recientes (Título desktop) */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-end hidden lg:flex">
            <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Novedades Recientes
              </h2>
            </div>
          </div>
        </div>

        {/* Contenedor Principal */}
        <div className="flex flex-col lg:flex-row justify-between pl-0 gap-8 lg:h-full">

          {/* Columna Izquierda: Grid de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-4 w-full lg:w-7/12">
            <CardsTitle
              title="Auxilio de transporte"
              icon={<FaBus size={35} />}
              headerLabel="SOLICITUD"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() =>
                navigate('/solicitud-AuxTrans', {
                  state: {
                    titulo: 'Auxilio de transporte',
                    iconName: 'FaBus',
                  },
                })
              }
            />
            <CardsTitle
              title="Descuento"
              icon={<FaMoneyBillAlt size={35} />}
              headerLabel="SOLICITUD"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() =>
                navigate('/solicitud-descuentos', {
                  state: {
                    titulo: 'Descuento',
                    iconName: 'FaMoneyBillAlt',
                  },
                })
              }
            />
            <CardsTitle
              title="Horas Extra/Recargos"
              icon={<FaClock size={35} />}
              headerLabel="SOLICITUD"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() =>
                navigate('/solicitud-horaExt', {
                  state: {
                    titulo: 'Horas Extra',
                    iconName: 'FaClock',
                  },
                })
              }
            />
            <CardsTitle
              title="Otro Si Definitivo"
              icon={<FaFileSignature size={35} />}
              headerLabel="SOLICITUD"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() =>
                navigate('/solicitud-OtroSiDef', {
                  state: {
                    titulo: 'Otro Si Definitivo',
                    iconName: 'FaFileSignature',
                  },
                })
              }
            />
            <CardsTitle
              title="Otro Si Temporal"
              icon={<FaFileAlt size={35} />}
              headerLabel="SOLICITUD"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() =>
                navigate('/solicitud-OtroSiTemp', {
                  state: {
                    titulo: 'Otro Si Temporal',
                    iconName: 'FaFileAlt',
                  },
                })
              }
            />
            <CardsTitle
              title="Vacaciones"
              icon={<FaUmbrellaBeach size={35} />}
              headerLabel="SOLICITUD"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() =>
                navigate('/solicitud-vacaciones', {
                  state: {
                    titulo: 'Vacaciones',
                    iconName: 'FaUmbrellaBeach',
                  },
                })
              }
            />
            <CardsTitle
              title="Otros"
              icon={<FaList size={35} />}
              headerLabel="SOLICITUD"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() =>
                navigate('/solicitud-otros', {
                  state: {
                    titulo: 'Otros',
                    iconName: 'FaList',
                  },
                })
              }
            />
            <CardsTitle
              title="Notificaciones"
              icon={<Bell size={35} />}
              headerLabel="MENSAJES"
              color="bg-[#2C3333]"
              className="h-[100px] w-full rounded-xl"
              onClick={() => navigate('/notificaciones')}
            />
          </div>

          {/* Columna Central: Franco */}
          <div className="hidden lg:flex flex-col justify-end items-center flex-grow">
            <img
              src={Franco}
              alt="Franco"
              className="object-contain max-w-[300px]"
            />
          </div>

          {/* Columna Derecha: Novedades */}
          <div className="w-full lg:w-[350px] flex-shrink-0 pl-0 lg:pl-5 flex flex-col items-center space-y-8 mt-8 lg:mt-0">
            {/* Novedades Recientes */}
            <NovedadesRecientes />
            {/* HISTÓRICO DE SOLICITUDES */}
            <ExportacionesConsolidadas />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardJefe;
