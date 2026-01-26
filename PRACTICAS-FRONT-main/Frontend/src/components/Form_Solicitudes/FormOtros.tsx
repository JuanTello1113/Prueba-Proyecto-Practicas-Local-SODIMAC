import React from 'react';
import FormularioBasico from './FormBasico';

interface FormularioOtrosProps {
  titulo?: string;
  onAddToQueue?: (formData: { cedula: number; nombre: string; detalle: string }) => void;
}

const FormularioOtros: React.FC<FormularioOtrosProps> = ({ titulo, onAddToQueue }) => {
  return <FormularioBasico titulo={titulo} onAddToQueue={onAddToQueue} />;
};

export default FormularioOtros;
