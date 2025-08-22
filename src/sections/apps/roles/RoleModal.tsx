import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { createRole, updateRole } from 'api/roles';
import { openSnackbar } from 'api/snackbar';

export default function RoleModal({ open, onClose, role }: any) {
  const isEdit = !!role;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
      setIsActive(role.isActive !== false);
    } else {
      setName('');
      setDescription('');
      setIsActive(true);
    }
  }, [role, open]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = { name, description, isActive };
    try {
      let result;
      if (isEdit) result = await updateRole(role.id, payload);
      else result = await createRole(payload);

      if (!result || !result.success) {
        openSnackbar({
          action: false,
          open: true,
          message: result?.error || 'Error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          variant: 'alert',
          alert: { color: 'error', variant: 'filled' },
          transition: 'Fade',
          close: false,
          actionButton: false,
          maxStack: 3,
          dense: false,
          iconVariant: 'usedefault'
        });
        setSubmitting(false);
        return;
      }

  openSnackbar({
        action: false,
        open: true,
        message: result.message || 'Operación exitosa',
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success', variant: 'filled' },
        transition: 'Fade',
        close: false,
        actionButton: false,
        maxStack: 3,
        dense: false,
        iconVariant: 'usedefault'
      });
      setSubmitting(false);
      onClose();
    } catch (err: any) {
  openSnackbar({
        action: false,
        open: true,
        message: err?.message || 'Error inesperado',
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error', variant: 'filled' },
        transition: 'Fade',
        close: false,
        actionButton: false,
        maxStack: 3,
        dense: false,
        iconVariant: 'usedefault'
      });
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <MainCard sx={{ minWidth: 360, maxWidth: 640, m: '40px auto' }} modal content={false}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}</Button>
          </Stack>
        </Stack>
      </MainCard>
    </Modal>
  );
}
