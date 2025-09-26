import React from 'react';
import { TextField, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, SelectChangeEvent } from '@mui/material';

interface Option {
  id: number;
  value: string;
  displayText?: string;
}

// Eliminado bloque duplicado y definición incorrecta

interface FormikType {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
}

interface Props {
  formik: FormikType;
  typeOptions: Option[];
  motiveOptions: Option[];
  loadingOptions: boolean;
}

export default function NonConformityTabGeneral({ formik, typeOptions, motiveOptions, loadingOptions }: Props) {
  const { values, handleChange } = formik;
  // Adaptador para SelectChangeEvent
  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    handleChange({
      target: {
        name: e.target.name,
        value: e.target.value
      }
    } as React.ChangeEvent<any>);
  };
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
  <TextField fullWidth label="Número" name="number" value={values.number} onChange={handleChange} />
      </Grid>
      <Grid item xs={12}>
  <TextField fullWidth label="Descripción del Hallazgo" name="description" value={values.description} onChange={handleChange} multiline rows={3} />
      </Grid>
      <Grid item xs={6}>
  <TextField fullWidth label="Clasificación" name="classification" value={values.classification} onChange={handleChange} />
      </Grid>
      <Grid item xs={6}>
  <TextField fullWidth label="Categoría" name="category" value={values.category} onChange={handleChange} />
      </Grid>
      <Grid item xs={12}>
  <TextField fullWidth label="Área y/o Proceso" name="areaOrProcess" value={values.areaOrProcess} onChange={handleChange} />
      </Grid>
      <Grid item xs={6}>
  <TextField fullWidth type="date" label="Fecha de Elaboración" name="validFrom" value={values.validFrom} onChange={handleChange} InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={6}>
  <TextField fullWidth type="date" label="Fecha de Detección" name="detectedAt" value={values.detectedAt} onChange={handleChange} InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel shrink>Tipo</InputLabel>
          {loadingOptions ? <CircularProgress size={20} /> : (
            <Select name="typeOptionId" value={values.typeOptionId} onChange={handleSelectChange} displayEmpty>
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {typeOptions.map((o: Option) => <MenuItem key={o.id} value={o.id}>{o.displayText ?? o.value}</MenuItem>)}
            </Select>
          )}
        </FormControl>
      </Grid>
      {(!!values.typeOptionId && (() => {
  const selected = typeOptions.find((o: Option) => o.id === values.typeOptionId);
        if (!selected) return false;
        return (selected.displayText ?? selected.value) === "Otro:";
      })()) && (
        <Grid item xs={12}>
          <TextField fullWidth label="Especifique otro tipo" name="otherType" value={values.otherType} onChange={handleChange} />
        </Grid>
      )}
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel shrink>Motivo</InputLabel>
          {loadingOptions ? <CircularProgress size={20} /> : (
            <Select name="motiveOptionId" value={values.motiveOptionId} onChange={handleSelectChange} displayEmpty>
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {motiveOptions.map((o: Option) => <MenuItem key={o.id} value={o.id}>{o.displayText ?? o.value}</MenuItem>)}
            </Select>
          )}
        </FormControl>
      </Grid>
      {(!!values.motiveOptionId && (() => {
  const selected = motiveOptions.find((o: Option) => o.id === values.motiveOptionId);
        if (!selected) return false;
        return ["Incidente, indique tipo", "Otro:"].includes(selected.displayText ?? selected.value);
      })()) && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={(() => {
              const selected = motiveOptions.find((o: Option) => o.id === values.motiveOptionId);
              if (!selected) return "Detalle";
              if ((selected.displayText ?? selected.value) === "Otro:") return "Especifique otro motivo";
              return "Detalle";
            })()}
            name="otherMotive"
            value={values.otherMotive}
            onChange={handleChange}
          />
        </Grid>
      )}
    </Grid>
  );
}
