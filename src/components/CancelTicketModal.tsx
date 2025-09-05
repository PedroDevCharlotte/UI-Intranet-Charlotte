import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface CancelTicketModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => void;
}

const CancelTicketModal: React.FC<CancelTicketModalProps> = ({ open, onClose, onConfirm }) => {
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!justification.trim()) {
      setError('La justificación es obligatoria');
      return;
    }
    setError('');
    onConfirm(justification);
    setJustification('');
  };

  const handleClose = () => {
    setError('');
    setJustification('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancelar ticket</DialogTitle>
      <DialogContent>
        <TextField
          label="Justificación de cancelación"
          value={justification}
          onChange={e => setJustification(e.target.value)}
          multiline
          rows={4}
          fullWidth
          required
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cerrar</Button>
        <Button onClick={handleConfirm} color="error" variant="contained">Cancelar ticket</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelTicketModal;
