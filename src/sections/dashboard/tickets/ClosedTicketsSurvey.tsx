import React, { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
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

  // Filtrar solo cerrados y ordenar por fecha descendente (más recientes primero)
  const closed = useMemo(() => {
    return (tickets || [])
      .filter((t: any) => t.status === 'CLOSED')
      .sort((a: any, b: any) => new Date(b.updatedAt || b.closedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.closedAt || a.createdAt).getTime());
  }, [tickets]);

  // Estado para modal de ver más
  const [openModal, setOpenModal] = useState(false);

  // Mostrar solo los 2 más recientes
  const closedPreview = closed.slice(0, 2);

  return (
    <Grid size={{ xs: 12 }}>
      <MainCard title="Tickets sin encuesta">
        {closed.length === 0 ? (
          <div>No hay tickets cerrados</div>
        ) : (
          <>
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
                {closedPreview.map((t: any) => (
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
            {closed.length > 2 && (
              <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setOpenModal(true)}>
                Ver más
              </Button>
            )}
            {/* Modal con la lista completa */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Todos los tickets sin encuesta</DialogTitle>
              <DialogContent>
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
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenModal(false)} color="primary">
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </MainCard>
    </Grid>
  );
}
