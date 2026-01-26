import React from 'react';
import FormularioBasico from './FormBasico';

interface FormularioDescProps {
  titulo?: string;
  onAddToQueue?: (formData: { cedula: number; nombre: string; detalle: string }) => void;
}

const FormularioDesc: React.FC<FormularioDescProps> = ({ titulo, onAddToQueue }) => {
  return <FormularioBasico titulo={titulo} onAddToQueue={onAddToQueue} />;
};

export default FormularioDesc;
