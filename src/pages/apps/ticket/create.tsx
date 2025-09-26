import React, { useState } from 'react';
import { Typography, Paper } from '@mui/material';
import AddTicketModal from 'sections/apps/ticket/AddTicketModal';

const TicketCreatePage: React.FC = () => {
  const [openModal, setOpenModal] = useState(true);

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Crear Ticket
      </Typography>
      <AddTicketModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          window.history.back();
        }}
      />
    </Paper>
  );
};

export default TicketCreatePage;
