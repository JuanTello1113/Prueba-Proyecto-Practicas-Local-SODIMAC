import React from 'react';
import { useLocation } from 'react-router-dom';
import FormularioAuxTransp from './FormAuxTransp';
import FormularioDesc from './FormDescuentos';
import FormularioHorasExtra from './FormHorasExt';
import FormularioOtros from './FormOtros';
import FormularioOtroSiTemporal from './FormOtroSiTemp';
import FormularioVacaciones from './FormVacaciones';
import FormularioOtroSiDef from './FromOtrSDef';

interface IndividualProps {
  titulo?: string;
  onAddToQueue?: (formData: { cedula: number; nombre: string; detalle: string }) => void;
}

const Individual: React.FC<IndividualProps> = ({ titulo: propsTitulo, onAddToQueue }) => {
  const { state } = useLocation();
  const titulo = propsTitulo || state?.titulo || '';

  const RenderForm = () => {
    switch (titulo) {
      case 'Auxilio de transporte':
        return <FormularioAuxTransp titulo={titulo} onAddToQueue={onAddToQueue} />;
      case 'Descuento':
        return <FormularioDesc titulo={titulo} onAddToQueue={onAddToQueue} />;
      case 'Otro Si Definitivo':
        return <FormularioOtroSiDef titulo={titulo} onAddToQueue={onAddToQueue} />;
      case 'Otros':
        return <FormularioOtros titulo={titulo} onAddToQueue={onAddToQueue} />;
      case 'Vacaciones':
        return <FormularioVacaciones titulo={titulo} onAddToQueue={onAddToQueue} />;
      case 'Otro Si Temporal':
        return <FormularioOtroSiTemporal titulo={titulo} onAddToQueue={onAddToQueue} />;
      case 'Horas Extra':
        return <FormularioHorasExtra titulo={titulo} onAddToQueue={onAddToQueue} />;
    }
  };

  return <div>{RenderForm()}</div>;
};

export default Individual;
