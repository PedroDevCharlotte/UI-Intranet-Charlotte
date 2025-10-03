import React from 'react';
import { 
  TextField, 
  Autocomplete, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Grid2 as Grid
} from '@mui/material';

interface UserOption {
  id: number;
  label: string;
}

interface FormikType {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

interface Props {
  formik: FormikType;
  userOptions: UserOption[];
}

export default function NonConformityTabFiveWhys({ formik, userOptions }: Props) {
  const { values, handleChange, setFieldValue } = formik;

  // Filtrar usuarios excluyendo el usuario con id 1
  const filteredUserOptions = userOptions.filter(user => user.id !== 1);

  return (
    <Grid container spacing={3}>
      
      <Grid size={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Análisis de 5 Porqués
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      {/* Referencia */}
      <Grid size={6}>
        <TextField
          fullWidth
          label="Referencia"
          name="reference"
          value={values.number || ''}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            '& .MuiInputBase-input': {
              backgroundColor: 'grey.100',
            },
          }}
        />
      </Grid>

      {/* Clasificación */}
      <Grid size={6}>
        <TextField
          fullWidth
          label="Clasificación"
          name="classification"
          value={values.classification || ''}
          onChange={handleChange}
          placeholder="Ingrese la clasificación"
        />
      </Grid>

      {/* Personal Participante */}
      <Grid size={12}>
        <Autocomplete
          multiple
          options={filteredUserOptions}
          getOptionLabel={(option) => option.label}
          value={values.fiveWhysParticipants || []}
          onChange={(_, newValue) => setFieldValue('fiveWhysParticipants', newValue)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Personal Participante" 
              placeholder="Seleccionar participantes"
              required={(values.fiveWhysParticipants || []).length === 0}
            />
          )}
        />
      </Grid>

      {/* Fecha */}
      <Grid size={6}>
        <TextField
          fullWidth
          type="date"
          label="Fecha"
          name="fiveWhysDate"
          value={values.fiveWhysDate || ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>

      {/* Existen casos similares */}
      <Grid size={6}>
        <FormControlLabel
          control={
            <Switch
              checked={values.hasSimilarCases || false}
              onChange={(e) => setFieldValue('hasSimilarCases', e.target.checked)}
              name="hasSimilarCases"
              color="primary"
            />
          }
          label="¿Existen casos similares?"
          sx={{ mt: 2 }}
        />
      </Grid>

      {/* Campo condicional para explicación de casos similares */}
      {values.hasSimilarCases && (
        <Grid size={12}>
          <TextField
            fullWidth
            label="Explicación de Casos Similares"
            name="similarCasesDetails"
            value={values.similarCasesDetails || ''}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Proporcione una breve explicación de los casos similares"
            required
          />
        </Grid>
      )}

    </Grid>
  );
}