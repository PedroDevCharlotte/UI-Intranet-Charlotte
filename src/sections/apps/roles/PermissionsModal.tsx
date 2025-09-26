import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import Stack from '@mui/material/Stack';
import MuiButton from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { updateRolePermissions } from 'api/roles';
import { openSnackbar } from 'api/snackbar';
import { useGetPermissions } from 'api/permissions';

interface Props {
  open: boolean;
  onClose: () => void;
  role: any | null;
}

export default function PermissionsModal({ open, onClose, role }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { permissions = [], permissionsLoading } = useGetPermissions();

  useEffect(() => {
    if (role && Array.isArray(role.permissions)) {
      // role.permissions may be string[] or Permission[]
      const mapped = role.permissions.map((p: any) => (typeof p === 'string' ? p : p.name));
      setSelected(mapped);
    } else setSelected([]);
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
      <MainCard
        sx={{
          minWidth: 360,
          maxWidth: 720,
          m: '40px auto',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh'
        }}
        modal
        content={false}
      >
        {/* Header - fixed */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h6">Asignar permisos</Typography>
          <Typography variant="body2" color="text.secondary">
            {role ? `Rol: ${role.name}` : 'Selecciona un rol'}
          </Typography>
        </Box>

        {/* Scrollable content grouped by modulePath */}
        <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
          {permissionsLoading ? (
            <div>Cargando permisos...</div>
          ) : (
            (() => {
              // group permissions by modulePath
              const groups = permissions.reduce(
                (acc: Record<string, any[]>, cur: any) => {
                  const key = cur.modulePath || 'Sin módulo';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(cur);
                  return acc;
                },
                {} as Record<string, any[]>
              );

              return Object.entries(groups).map(([modulePath, perms]: [string, any[]]) => {
                const allSelected = perms.every((pp: any) => selected.includes(pp.name));
                return (
                  <Box key={modulePath} sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1">{modulePath}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {perms.length} permisos
                        </Typography>
                        <MuiButton
                          size="small"
                          onClick={() => {
                            // toggle select all for this group
                            if (allSelected) {
                              // remove all
                              const next = new Set(selected);
                              perms.forEach((pp: any) => next.delete(pp.name));
                              setSelected(Array.from(next));
                            } else {
                              const next = new Set(selected);
                              perms.forEach((pp: any) => next.add(pp.name));
                              setSelected(Array.from(next));
                            }
                          }}
                        >
                          {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </MuiButton>
                      </Stack>
                    </Stack>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {perms.map((p: any) => (
                        <FormControlLabel
                          key={p.id}
                          control={<Checkbox checked={selected.includes(p.name)} onChange={() => toggle(p.name)} />}
                          label={`${p.name} ${p.description ? `- ${p.description}` : ''}`}
                        />
                      ))}
                    </Box>
                  </Box>
                );
              });
            })()
          )}
        </Box>

        {/* Footer - fixed */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <MuiButton onClick={onClose} disabled={saving}>
              Cancelar
            </MuiButton>
            <MuiButton variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </MuiButton>
          </Stack>
        </Box>
      </MainCard>
    </Modal>
  );
}
