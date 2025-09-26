import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import UserHistoryModal from './UserHistoryModal';
import UserSessionsModal from './UserSessionsModal';

// ==============================|| DEMO - API INTEGRATION ||============================== //

export default function DemoApiIntegration() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  const handleHistoryOpen = () => setHistoryOpen(true);
  const handleHistoryClose = () => setHistoryOpen(false);

  const handleSessionsOpen = () => setSessionsOpen(true);
  const handleSessionsClose = () => setSessionsOpen(false);

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4">Demo: Integración con API Charlotte Core</Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Historial de Cambios Conectado
        </Typography>
        <Typography variant="body2" paragraph>
          Endpoint: <code>GET /audit/entity/User/&#123;userId&#125;</code>
        </Typography>
        <Button variant="contained" onClick={handleHistoryOpen}>
          Ver Historial de Cambios (Usuario ID: 123)
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Historial de Sesiones Conectado
        </Typography>
        <Typography variant="body2" paragraph>
          Endpoint: <code>GET /audit/admin/sessions/&#123;userId&#125;</code>
        </Typography>
        <Button variant="contained" onClick={handleSessionsOpen}>
          Ver Historial de Sesiones (Usuario ID: 123)
        </Button>
      </Paper>

      <Divider />

      <Paper sx={{ p: 3, bgcolor: 'success.lighter' }}>
        <Typography variant="h6" gutterBottom color="success.main">
          🔗 APIs Configuradas
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • <strong>Base URL:</strong> http://localhost:3006
          </Typography>
          <Typography variant="body2">
            • <strong>Historial de Cambios:</strong> /audit/entity/User/&#123;userId&#125;
          </Typography>
          <Typography variant="body2">
            • <strong>Sesiones de Usuario:</strong> /audit/admin/sessions/&#123;userId&#125;
          </Typography>
          <Typography variant="body2">
            • <strong>Deshabilitar 2FA:</strong> /auth/2fa/disable
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom color="info.main">
          📋 Características Implementadas
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">✅ Conexión real con API Charlotte Core</Typography>
          <Typography variant="body2">✅ Manejo de errores y estados de carga</Typography>
          <Typography variant="body2">✅ Transformación de datos de API a UI</Typography>
          <Typography variant="body2">✅ Detección automática de dispositivos desde User Agent</Typography>
          <Typography variant="body2">✅ Formateo de fechas en español</Typography>
          <Typography variant="body2">✅ Validación de código 2FA con 6 dígitos</Typography>
        </Stack>
      </Paper>

      {/* Modales */}
      <UserHistoryModal open={historyOpen} onClose={handleHistoryClose} userId={123} userName="Usuario Demo" />

      <UserSessionsModal open={sessionsOpen} onClose={handleSessionsClose} userId={123} userName="Usuario Demo" />
    </Stack>
  );
}
