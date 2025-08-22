import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import useSWR from 'swr';
import React from 'react';

// GlobalLoader: listens to 'api/loader' SWR key mutated by api/loader helpers
export default function GlobalLoader() {
  const { data } = useSWR('api/loader');
  const open = Boolean(data);

  return (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.snackbar + 10 }} open={open}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
