import React from 'react';
import FormularioBasico from './FormBasico';

interface FormularioOtroSiDefProps {
  titulo?: string;
  onAddToQueue?: (formData: { cedula: number; nombre: string; detalle: string }) => void;
}

const FormularioOtroSiDef: React.FC<FormularioOtroSiDefProps> = ({ titulo, onAddToQueue }) => {
  return <FormularioBasico titulo={titulo} onAddToQueue={onAddToQueue} />;
};

export default FormularioOtroSiDef;
