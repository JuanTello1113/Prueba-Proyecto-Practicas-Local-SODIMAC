import React from 'react';
import FormularioBasico from './FormBasico';

interface FormularioAuxTranspProps {
  titulo?: string;
  onAddToQueue?: (formData: { cedula: number; nombre: string; detalle: string }) => void;
}

const FormularioAuxTransp: React.FC<FormularioAuxTranspProps> = ({ titulo, onAddToQueue }) => {
  return <FormularioBasico titulo={titulo} onAddToQueue={onAddToQueue} />;
};

export default FormularioAuxTransp;
