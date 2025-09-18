import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PermissionsAssignModal from 'components/PermissionsAssignModal';

export default function PermissionsDemoPage() {
  const [open, setOpen] = useState(false);
  // demo roleId -- change to a real role id when using in production
  const roleId = 1;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Demo: Asignar permisos a rol
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Abrir modal de permisos
      </Button>
      <PermissionsAssignModal open={open} onClose={() => setOpen(false)} roleId={roleId} />
    </Container>
  );
}
