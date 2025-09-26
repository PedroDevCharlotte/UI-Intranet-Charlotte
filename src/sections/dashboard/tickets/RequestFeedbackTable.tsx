import React, { useMemo, useState } from 'react';
import MainCard from 'components/MainCard';
import { useGetTicket } from 'api/ticket';
import {
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { CardSend } from 'iconsax-react';
import { requestTicketFeedback } from 'api/ticket';
import { openSnackbar } from 'api/snackbar';

export default function RequestFeedbackTable() {
  const { ticket: tickets, ticketLoading } = useGetTicket();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{ id: number; ticketNumber?: string | number } | null>(null);
  const [loading, setLoading] = useState(false);
  console.log('tickets for feedback request', tickets);
  const rows = useMemo(
    () =>
      (tickets || [])
        .filter((t) => t.status === 'CLOSED')
        .map((t) => ({
          id: t.id,
          ticketNumber: t.ticketNumber,
          creatorName: t.creatorName ? `${t.creatorName}`.trim() : ''
        })),
    [tickets]
  );

  const handleRequest = async (id: number) => {
    // open confirmation dialog
    const ticket = rows.find((r) => r.id === id);
    setSelectedTicket(ticket ? { id: ticket.id, ticketNumber: ticket.ticketNumber } : { id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedTicket) return;
    setLoading(true);
    try {
      await requestTicketFeedback(selectedTicket.id);
      openSnackbar({
        open: true,
        message: 'Solicitud de encuesta enviada al creador.',
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      setConfirmOpen(false);
    } catch (err: any) {
      console.error('Error requesting feedback', err);
      openSnackbar({ open: true, message: 'Error al solicitar la encuesta', variant: 'alert', alert: { color: 'error' } } as any);
    } finally {
      setLoading(false);
      setSelectedTicket(null);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedTicket(null);
  };

  return (
    <MainCard title="Solicitar encuesta a tickets cerrados">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col" sx={{ fontWeight: 700 }}>
              Folio
            </TableCell>
            <TableCell component="th" scope="col" sx={{ fontWeight: 700 }}>
              Creador
            </TableCell>
            <TableCell component="th" scope="col" sx={{ fontWeight: 700 }}>
              Acción
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>#{r.ticketNumber}</TableCell>
              <TableCell>{r.creatorName}</TableCell>
              <TableCell>
                <Tooltip title="Solicitar que contesten la encuesta">
                  <IconButton aria-label={`request-feedback-${r.id}`} onClick={() => handleRequest(r.id)}>
                    <CardSend />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={confirmOpen} onClose={handleCancel} aria-labelledby="confirm-request-dialog">
        <DialogTitle id="confirm-request-dialog">Confirmar solicitud</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas solicitar al creador del ticket {selectedTicket ? `#${selectedTicket.ticketNumber}` : ''} que conteste la encuesta? Se
            enviará un correo al creador con el enlace a la encuesta.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading} variant="contained">
            {loading ? 'Enviando...' : 'Solicitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
