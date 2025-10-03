import React from 'react';
import { 
  TextField, 
  Typography,
  Divider,
  InputAdornment,
  Grid2 as Grid
} from '@mui/material';
import { Link2 } from 'iconsax-react';

interface FormikType {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

interface Props {
  formik: FormikType;
}

export default function NonConformityTabWhyProblem({ formik }: Props) {
  const { values, handleChange } = formik;

  return (
    <Grid container spacing={3}>
      
      <Grid size={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ¿Por qué tuvimos el problema?
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      {/* ¿Por qué 1? */}
      <Grid size={12}>
        <TextField
          fullWidth
          label="1. ¿Por qué?"
          name="whyProblem1"
          value={values.whyProblem1 || ''}
          onChange={handleChange}
          multiline
          rows={2}
          placeholder="Primera causa del problema"
          required
        />
      </Grid>

      {/* ¿Por qué 2? */}
      <Grid size={12}>
        <TextField
          fullWidth
          label="2. ¿Por qué?"
          name="whyProblem2"
          value={values.whyProblem2 || ''}
          onChange={handleChange}
          multiline
          rows={2}
          placeholder="¿Por qué?"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                   Por lo tanto
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>

      {/* ¿Por qué 3? */}
      <Grid size={12}>
        <TextField
          fullWidth
          label="3. ¿Por qué?"
          name="whyProblem3"
          value={values.whyProblem3 || ''}
          onChange={handleChange}
          multiline
          rows={2}
          placeholder="¿Por qué?"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                   Por lo tanto
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>

      {/* ¿Por qué 4? */}
      <Grid size={12}>
        <TextField
          fullWidth
          label="4. ¿Por qué?"
          name="whyProblem4"
          value={values.whyProblem4 || ''}
          onChange={handleChange}
          multiline
          rows={2}
          placeholder="¿Por qué?"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                   Por lo tanto
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>

      {/* ¿Por qué 5? */}
      <Grid size={12}>
        <TextField
          fullWidth
          label="5. ¿Por qué?"
          name="whyProblem5"
          value={values.whyProblem5 || ''}
          onChange={handleChange}
          multiline
          rows={2}
          placeholder="¿Por qué?"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                   Por lo tanto
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>

    </Grid>
  );
}