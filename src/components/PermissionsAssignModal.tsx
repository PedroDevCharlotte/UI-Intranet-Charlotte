import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPermissions } from 'api/permissions';
import { updateRolePermissions } from 'api/roles';

interface Props {
  open: boolean;
  onClose: () => void;
  roleId: number; // role to assign permissions to
  initialPermissions?: string[]; // permission names
  onSaved?: () => void;
}

export default function PermissionsAssignModal({ open, onClose, roleId, initialPermissions = [], onSaved }: Props) {
  const { permissions, permissionsLoading } = useGetPermissions();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialPermissions));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(new Set(initialPermissions || []));
  }, [initialPermissions, open]);

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Array.from(selected);
      const res = await updateRolePermissions(roleId, payload);
      if (res.success) {
        if (onSaved) onSaved();
        onClose();
      } else {
        console.error('Failed to save permissions', res);
        // You could surface an error snackbar here
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Asignar permisos</DialogTitle>
      <DialogContent dividers>
        {permissionsLoading ? (
          <CircularProgress />
        ) : (
          <List>
            {permissions.map((p: any) => (
              <ListItem key={p.id} divider>
                <FormControlLabel
                  control={<Checkbox checked={selected.has(p.name)} onChange={() => toggle(p.name)} />}
                  label={<ListItemText primary={p.name} secondary={p.description || p.modulePath || ''} />}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
