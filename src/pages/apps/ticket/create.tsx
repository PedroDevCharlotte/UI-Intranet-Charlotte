import React, { useState } from 'react';
import { Box, Button, Step, StepLabel, Stepper, Typography, Paper } from '@mui/material';
import AddTicketModal from 'sections/apps/ticket/AddTicketModal';

const steps = [
  'Información Básica',
  'Detalles del Problema',
  'Adjuntar Archivos',
  'Asignar Responsable',
  'Confirmación',
];

const StepContent = ({ step }: { step: number }) => {
  switch (step) {
    case 0:
      return <div>Formulario de Información Básica</div>;
    case 1:
      return <div>Formulario de Detalles del Problema</div>;
    case 2:
      return <div>Formulario para Adjuntar Archivos</div>;
    case 3:
      return <div>Formulario para Asignar Responsable</div>;
    case 4:
      return <div>Resumen y Confirmación</div>;
    default:
      return null;
  }
};

const TicketCreatePage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(true);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Crear Ticket
      </Typography>
      <AddTicketModal open={openModal} onClose={() => {
        setOpenModal(false);
        window.history.back();
      }} />
    </Paper>
  );
};

export default TicketCreatePage;