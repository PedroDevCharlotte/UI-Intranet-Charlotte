import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Autocomplete,
  Chip
} from '@mui/material';
import Grid from '@mui/material/Grid2';

interface Option {
  id: number;
  value: string;
  displayText?: string;
}

// Eliminado bloque duplicado y definición incorrecta
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
  typeOptions: Option[];
  motiveOptions: Option[];
  loadingOptions: boolean;
  userOptions: UserOption[];
  categoryOptions: Option[];
  clasificationsOptions: Option[];
}

export default function NonConformityTabGeneral({ formik, typeOptions, motiveOptions, loadingOptions, userOptions, categoryOptions, clasificationsOptions }: Props) {
  const { values, handleChange, setFieldValue } = formik;
  // Adaptador para SelectChangeEvent
  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    handleChange({
      target: {
        name: e.target.name,
        value: e.target.value
      }
    } as React.ChangeEvent<any>);
  };
  const filteredUserOptions = userOptions.filter((user) => user.id !== 1);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField fullWidth label="Número" name="number" value={values.number} onChange={handleChange} />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Descripción del Hallazgo"
          name="description"
          value={values.description}
          onChange={handleChange}
          multiline
          rows={3}
        />
      </Grid>
      
      <Grid size={6}>
        <FormControl fullWidth>
          <InputLabel shrink>Clasificación</InputLabel>
          {loadingOptions ? (
            <CircularProgress size={20} />
          ) : (
            <Select name="classificationOptionId" value={values.classificationOptionId} onChange={handleSelectChange} displayEmpty>
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {clasificationsOptions.map((o: Option) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.displayText ?? o.value}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </Grid>
      <Grid size={6}>
        <FormControl fullWidth>
          <InputLabel shrink>Categoría</InputLabel>
          {loadingOptions ? (
            <CircularProgress size={20} />
          ) : (
            <Select name="categoryOptionId" value={values.categoryOptionId} onChange={handleSelectChange} displayEmpty>
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {categoryOptions.map((o: Option) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.displayText ?? o.value}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </Grid>
      <Grid size={12}>
        <TextField fullWidth label="Área y/o Proceso" name="areaOrProcess" value={values.areaOrProcess} onChange={handleChange} />
      </Grid>
      <Grid size={12}>
        <Autocomplete
          multiple
          id="participants"
          options={[...filteredUserOptions, { id: -1, label: 'Otro' }]}
          getOptionLabel={(option) => option.label}
          value={values.participants || []}
          onChange={(_, newValue) => {
            setFieldValue('participants', newValue);

            // Si se deselecciona la opción "Otro", limpiar el campo otherResponsible
            const hasOtherOption = newValue.some((option: any) => option.id === -1);
            if (!hasOtherOption && values.otherResponsible) {
              setFieldValue('otherResponsible', '');
            }
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip variant="outlined" label={option.label} {...getTagProps({ index })} key={option.id} />)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Personal Responsable"
              placeholder="Seleccionar responsables"
              helperText="Puede seleccionar múltiples responsables. Use 'Otro' para agregar responsables externos."
              required={(values.fiveWhysParticipants || []).length === 0}
            />
          )}
        />
      </Grid>

      {/* Campo de texto condicional para "Otro" responsable */}
      {values.participants?.some((p: any) => p.id === -1) && (
        <Grid size={12}>
          <TextField
            fullWidth
            label="Especifique otro responsable"
            name="otherResponsible"
            value={values.otherResponsible || ''}
            onChange={handleChange}
            placeholder="Ingrese el nombre del responsable externo..."
            helperText="Escriba el nombre completo del responsable que no está en la lista de usuarios"
            required
          />
        </Grid>
      )}
      <Grid size={6}>
        <TextField
          fullWidth
          type="date"
          label="Fecha de Elaboración"
          name="validFrom"
          value={values.validFrom}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          fullWidth
          type="date"
          label="Fecha de Detección"
          name="detectedAt"
          value={values.detectedAt}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid size={6}>
        <FormControl fullWidth>
          <InputLabel shrink>Tipo</InputLabel>
          {loadingOptions ? (
            <CircularProgress size={20} />
          ) : (
            <Select name="typeOptionId" value={values.typeOptionId} onChange={handleSelectChange} displayEmpty>
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {typeOptions.map((o: Option) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.displayText ?? o.value}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </Grid>
      {!!values.typeOptionId &&
        (() => {
          const selected = typeOptions.find((o: Option) => o.id === values.typeOptionId);
          if (!selected) return false;
          return (selected.displayText ?? selected.value) === 'Otro:';
        })() && (
          <Grid size={12}>
            <TextField
              fullWidth
              label="Especifique otro tipo"
              name="otherType"
              value={values.otherType}
              onChange={handleChange}
              placeholder="Ingrese el tipo específico..."
              required
            />
          </Grid>
        )}
      <Grid size={6}>
        <FormControl fullWidth>
          <InputLabel shrink>Motivo</InputLabel>
          {loadingOptions ? (
            <CircularProgress size={20} />
          ) : (
            <Select name="motiveOptionId" value={values.motiveOptionId} onChange={handleSelectChange} displayEmpty>
              <MenuItem value="">-- Seleccionar --</MenuItem>
              {motiveOptions.map((o: Option) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.displayText ?? o.value}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </Grid>
      {!!values.motiveOptionId &&
        (() => {
          const selected = motiveOptions.find((o: Option) => o.id === values.motiveOptionId);
          if (!selected) return false;
          return ['Incidente, indique tipo', 'Otro:'].includes(selected.displayText ?? selected.value);
        })() && (
          <Grid size={12}>
            <TextField
              fullWidth
              label={(() => {
                const selected = motiveOptions.find((o: Option) => o.id === values.motiveOptionId);
                if (!selected) return 'Detalle';
                if ((selected.displayText ?? selected.value) === 'Otro:') return 'Especifique otro motivo';
                return 'Detalle';
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
