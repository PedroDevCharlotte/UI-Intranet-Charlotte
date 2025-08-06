import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertDisable2FA from './AlertDisable2FA';

// ==============================|| DEMO - DISABLE 2FA ||============================== //

export default function Demo2FADisable() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Typography variant="h5">Demo: Deshabilitar 2FA con Código de Autenticación</Typography>
      
      <Typography variant="body1">
        Este componente ahora requiere un código de 6 dígitos del autenticador antes de permitir
        la deshabilitación del 2FA, agregando una capa adicional de seguridad.
      </Typography>

      <Button variant="contained" onClick={handleOpen} sx={{ width: 'fit-content' }}>
        Abrir Modal de Deshabilitar 2FA
      </Button>

      <AlertDisable2FA 
        id={123}
        userName="Juan Pérez"
        open={open}
        handleClose={handleClose}
      />

      <Typography variant="h6">Características implementadas:</Typography>
      <ul>
        <li>Campo de texto para código de 6 dígitos</li>
        <li>Validación de formato (solo números)</li>
        <li>Validación de longitud (exactamente 6 dígitos)</li>
        <li>Estilo monospace para mejor legibilidad</li>
        <li>Manejo de errores específicos para códigos inválidos</li>
        <li>Botón deshabilitado hasta que se ingrese un código válido</li>
        <li>Limpieza automática del formulario al cerrar</li>
        <li>Validación en el servidor con el código proporcionado</li>
      </ul>
    </Stack>
  );
}
