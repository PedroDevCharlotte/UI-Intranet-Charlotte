import React from 'react';
import { Grid, Typography } from '@mui/material';

interface Props {
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

export default function NonConformityTabReview({ values, setFieldValue }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <input type="file" onChange={(e) => setFieldValue('attachment', e.target.files?.[0] ?? null)} />
        {values.attachment && values.attachment instanceof File && (
          <Typography sx={{ mt: 1 }}>Archivo: {values.attachment.name}</Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography><strong>Número:</strong> {values.number}</Typography>
        <Typography><strong>Descripción:</strong> {values.description}</Typography>
        <Typography><strong>Hallazgo:</strong> {values.findingDescription}</Typography>
      </Grid>
    </Grid>
  );
}
