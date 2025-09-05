
import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box } from '@mui/material';
import { useSupportTicketsResponseStats } from 'api/ticket';

const colorMap = {
  verde: '#4CAF50',
  amarillo: '#FFC107',
  rojo: '#F44336',
} as const;

type SemaforoColor = keyof typeof colorMap;

export default function TicketsResponseTrafficLight() {
  const { stats, statsLoading, statsError } = useSupportTicketsResponseStats();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Semáforo de Respuesta - Tickets de Soporte
        </Typography>
        {statsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : statsError ? (
          <Typography color="error">{statsError.message || 'Error al consultar la API'}</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell align="right">Promedio (h)</TableCell>
                  <TableCell align="right">Tickets Cerrados</TableCell>
                  <TableCell align="center">Semáforo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!stats || stats.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ textAlign: 'center' }}>
                        Sin datos en el periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((row: any) => (
                    <TableRow key={row.user.id}>
                      <TableCell>
                        {row.user.firstName || ''} {row.user.lastName || ''}
                      </TableCell>
                      <TableCell align="right">{row.promedioHoras}</TableCell>
                      <TableCell align="right">{row.ticketsCerrados}</TableCell>
                      <TableCell align="center">
                        <span
                          style={{
                            display: 'inline-block',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: colorMap[(row.semaforo as SemaforoColor)] ?? '#BDBDBD',
                          }}
                          title={row.semaforo}
                        />
                          
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
