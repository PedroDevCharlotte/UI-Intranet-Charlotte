import React from 'react';
import { TextField, Grid, Autocomplete } from '@mui/material';

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

export default function NonConformityTabActions({ formik, userOptions }: Props) {
  const { values, handleChange, setFieldValue } = formik;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField fullWidth label="Hallazgo / Descripción" name="findingDescription" value={values.findingDescription} onChange={handleChange} multiline rows={4} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Causa" name="cause" value={values.cause} onChange={handleChange} multiline rows={3} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Referencia de investigación" name="investigationReference" value={values.investigationReference} onChange={handleChange} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Observaciones" name="observations" value={values.observations} onChange={handleChange} multiline rows={3} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Referencia" name="reference" value={values.reference} onChange={handleChange} />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={userOptions}
          getOptionLabel={(opt) => opt.label}
          value={values.participants}
          onChange={(_, v) => setFieldValue('participants', v)}
          renderInput={(params) => <TextField {...params} label="Participantes" placeholder="Seleccionar participantes" />}
        />
      </Grid>
      {values.hasSimilarCases && (
        <Grid item xs={12}>
          <TextField fullWidth label="Detalles casos similares" name="similarCasesDetails" value={values.similarCasesDetails} onChange={handleChange} multiline rows={3} />
        </Grid>
      )}
      <Grid item xs={12}>
        <TextField fullWidth label="Determinación causa raíz" name="rootCauseDetermination" value={values.rootCauseDetermination} onChange={handleChange} multiline rows={3} />
      </Grid>
    </Grid>
  );
}
