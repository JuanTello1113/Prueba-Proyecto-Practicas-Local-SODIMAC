import React, { useState } from 'react';
import BackToDashboard from '../../../components/BackToDashboard/BackToDashboard';
import Footer from '../../../components/Footer/Footer';
import FiltroExportConsTienda from '../../../components/Form_Filtros/Filtro_Tiendas/FiltrosExportConsTienda';
import Navbar from '../../../components/Navbar/Navbar';
import VistaArchConsTienda from '../../../components/Vista_ArchivosExport/VistaArchivoExportTienda';

interface FiltroExportacion {
  tipo: string;
  desde: string;
  hasta: string;
  cedula: string;
}

const ExportConsTienda: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltroExportacion | undefined>(
    undefined,
  );

  const aplicarFiltros = async (filtros: FiltroExportacion) => {
    setFiltros(filtros);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />
      <BackToDashboard />
      <main className="flex-grow pt-24 pb-32 w-full max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 w-full px-4 sm:px-8">
          {/* FILTROS */}
          <div className="w-full lg:w-1/4 flex justify-center lg:justify-start">
            <FiltroExportConsTienda onApply={aplicarFiltros} />
          </div>
          {/* TABLA */}
          <div className="w-full lg:w-3/4">
            <VistaArchConsTienda filtros={filtros} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExportConsTienda;
