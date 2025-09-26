import React, { useMemo } from 'react';
import MainCard from 'components/MainCard';
import Grid from '@mui/material/Grid2';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import { useGetTicket } from 'api/ticket';
import { useNavigate } from 'react-router-dom';
import { MessageTick } from 'iconsax-react';

/**
 * ClosedTicketsSurvey
 * Muestra una lista simple de tickets con status CLOSED.
 * Solo muestra el número de ticket y un botón (tooltip: "Responder encuesta")
 */
export default function ClosedTicketsSurvey() {
  // Reuse the main tickets hook to get the list (limit large)
  const { ticket: tickets = [] } = useGetTicket();

  // Filtrar solo cerrados
  const closed = useMemo(() => (tickets || []).filter((t: any) => t.status === 'CLOSED'), [tickets]);

  return (
    <Grid size={{ xs: 12 }}>
      <MainCard title="Tickets cerrados sin encuesta resuelta">
        {closed.length === 0 ? (
          <div>No hay tickets cerrados</div>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell component="th" scope="col" sx={{ fontWeight: 700 }}>
                  Folio
                </TableCell>
                <TableCell component="th" scope="col" sx={{ fontWeight: 700 }}>
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {closed.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell>#{t.ticketNumber}</TableCell>
                  <TableCell>
                    <Tooltip title="Responder encuesta">
                      <IconButton
                        aria-label={`encuesta-${t.id}`}
                        onClick={() => window.open(`/apps/ticket/feedback/${t.id}`, '_blank')}
                        size="large"
                      >
                        <MessageTick />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </MainCard>
    </Grid>
  );
}
