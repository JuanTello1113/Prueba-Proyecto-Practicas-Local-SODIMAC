import React from 'react';
import AlertDiasNovedades from '../../components/Alerts/AlertDiasNovedades';
import BackToDashboard from '../../components/BackToDashboard/BackToDashboard';
import Footer from '../../components/Footer/Footer';
import FormSolicitudes from '../../components/Form_Solicitudes/Form';
import Navbar from '../../components/Navbar/Navbar';

const Otros: React.FC = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />
      <BackToDashboard />
      {/* ALERT DIAS */}

      <div className="absolute top-20 right-2 z-50">
        <AlertDiasNovedades mostrarSoloCorto />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-32">
        <FormSolicitudes />
      </main>

      <Footer />
    </div>
  );
};

export default Otros;
