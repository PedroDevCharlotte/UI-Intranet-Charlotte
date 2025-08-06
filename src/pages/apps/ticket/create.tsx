import React, { useState } from 'react';
import { Box, Button, Step, StepLabel, Stepper, Typography, Paper } from '@mui/material';

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
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box>
        {activeStep === steps.length ? (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              ¡Ticket creado exitosamente!
            </Typography>
            <Button onClick={handleReset} variant="contained">
              Crear otro ticket
            </Button>
          </Box>
        ) : (
          <>
            <StepContent step={activeStep} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 2 }}
              >
                Atrás
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default TicketCreatePage;