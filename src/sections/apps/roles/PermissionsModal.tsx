import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { updateRolePermissions } from 'api/roles';
import { openSnackbar } from 'api/snackbar';

interface Props {
  open: boolean;
  onClose: () => void;
  role: any | null;
}

// Permisos de ejemplo — adapta según OpenAPI si hay uno real
const ALL_PERMISSIONS = [
  'tickets.create',
  'tickets.view',
  'tickets.edit',
  'tickets.close',
  'users.view',
  'users.manage',
  'roles.view',
  'roles.manage'
];

export default function PermissionsModal({ open, onClose, role }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role && Array.isArray(role.permissions)) setSelected(role.permissions);
    else setSelected([]);
  }, [role, open]);

  const toggle = (perm: string) => {
    setSelected((s) => (s.includes(perm) ? s.filter((p) => p !== perm) : [...s, perm]));
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      const res = await updateRolePermissions(role.id, selected);
      if (!res || !res.success) {
        openSnackbar({
          action: false,
          open: true,
          message: res?.error || 'Error al actualizar permisos',
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
        setSaving(false);
        return;
      }

      openSnackbar({
        action: false,
        open: true,
        message: 'Permisos actualizados',
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

      setSaving(false);
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
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <MainCard sx={{ minWidth: 360, maxWidth: 640, m: '40px auto' }} modal content={false}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <div>
            <strong>Rol:</strong> {role?.name}
          </div>

          {ALL_PERMISSIONS.map((p) => (
            <FormControlLabel
              key={p}
              control={<Checkbox checked={selected.includes(p)} onChange={() => toggle(p)} />}
              label={p}
            />
          ))}

          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </Stack>
        </Stack>
      </MainCard>
    </Modal>
  );
}
