import React from 'react';
import { 
  TextField, 
  Typography,
  Divider,
  Grid2 as Grid
} from '@mui/material';

interface FormikType {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

interface Props {
  formik: FormikType;
}

export default function NonConformityTabRootCause({ formik }: Props) {
  const { values, handleChange } = formik;

  return (
    <Grid container spacing={3}>
      
      <Grid size={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Determinación de la(s) causa(s) Raíz
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      {/* Campo de determinación de causa raíz */}
      <Grid size={12}>
        <TextField
          fullWidth
          label="Determinación de la(s) causa(s) Raíz"
          name="rootCauseDetermination"
          value={values.rootCauseDetermination || ''}
          onChange={handleChange}
          multiline
          rows={6}
          placeholder="Basándose en el análisis realizado, describa detalladamente la(s) causa(s) raíz identificada(s)..."
          required
        />
      </Grid>

    </Grid>
  );
}