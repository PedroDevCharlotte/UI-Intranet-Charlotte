import React from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider,
  Switch,
  FormControlLabel,
  Grid2 as Grid
} from '@mui/material';
import { Add, Trash } from 'iconsax-react';

interface UserOption {
  id: number;
  label: string;
}

interface FollowUp {
  id: string;
  date: string;
  verifiedBy: UserOption | null;
  verifiedByOther: string;
  justification: string;
  wasEffective: boolean;
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

export default function NonConformityTabFollowUp({ formik, userOptions }: Props) {
  const { values, setFieldValue } = formik;

  // Filtrar usuarios excluyendo el usuario con id 1 y agregar opción "Otro"
  const auditorOptions = [
    ...userOptions.filter(user => user.id !== 1),
    { id: -1, label: 'Otro' }
  ];

  // Inicializar followUps si no existe
  const followUps: FollowUp[] = values.followUps || [];

  // Función para agregar un nuevo seguimiento
  const addFollowUp = () => {
    const newFollowUp: FollowUp = {
      id: Date.now().toString(),
      date: '',
      verifiedBy: null,
      verifiedByOther: '',
      justification: '',
      wasEffective: false
    };
    
    const updatedFollowUps = [...followUps, newFollowUp];
    setFieldValue('followUps', updatedFollowUps);
  };

  // Función para eliminar un seguimiento
  const removeFollowUp = (followUpId: string) => {
    const updatedFollowUps = followUps.filter(followUp => followUp.id !== followUpId);
    setFieldValue('followUps', updatedFollowUps);
  };

  // Función para actualizar un campo específico de un seguimiento
  const updateFollowUp = (followUpId: string, field: keyof FollowUp, value: any) => {
    const updatedFollowUps = followUps.map(followUp => 
      followUp.id === followUpId ? { ...followUp, [field]: value } : followUp
    );
    setFieldValue('followUps', updatedFollowUps);
  };

  // Agregar seguimiento inicial si no hay ninguno
  React.useEffect(() => {
    if (followUps.length === 0) {
      const initialFollowUp: FollowUp = {
        id: 'initial',
        date: '',
        verifiedBy: null,
        verifiedByOther: '',
        justification: '',
        wasEffective: false
      };
      setFieldValue('followUps', [initialFollowUp]);
    }
  }, []);

  return (
    <Grid container spacing={3}>
      
      <Grid size={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          Seguimientos y Análisis de Efectividad
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add size={16} />}
            onClick={addFollowUp}
            sx={{ ml: 'auto' }}
          >
            Agregar Seguimiento
          </Button>
        </Typography>

        {/* Lista de seguimientos */}
        {followUps.map((followUp, index) => (
          <Paper key={followUp.id} elevation={1} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              
              {/* Header del seguimiento */}
              <Grid size={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid size={9}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Seguimiento #{index + 1}
                    </Typography>
                  </Grid>
                  <Grid size={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {followUps.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeFollowUp(followUp.id)}
                        size="small"
                      >
                        <Trash size={18} />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Fecha */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  value={followUp.date}
                  onChange={(e) => updateFollowUp(followUp.id, 'date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {/* Verificado por Auditor */}
              <Grid size={6}>
                <FormControl fullWidth required>
                  <InputLabel>Verificado por Auditor</InputLabel>
                  <Select
                    value={followUp.verifiedBy?.id || ''}
                    label="Verificado por Auditor"
                    onChange={(e) => {
                      const selectedOption = auditorOptions.find(option => option.id === e.target.value);
                      updateFollowUp(followUp.id, 'verifiedBy', selectedOption || null);
                      // Limpiar el campo "otro" si no se seleccionó "Otro"
                      if (selectedOption?.id !== -1) {
                        updateFollowUp(followUp.id, 'verifiedByOther', '');
                      }
                    }}
                  >
                    <MenuItem value="">Seleccionar auditor</MenuItem>
                    {auditorOptions.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Campo "Otro" auditor - Solo se muestra si se seleccionó "Otro" */}
              {followUp.verifiedBy?.id === -1 && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Especificar Auditor"
                    value={followUp.verifiedByOther}
                    onChange={(e) => updateFollowUp(followUp.id, 'verifiedByOther', e.target.value)}
                    placeholder="Ingrese el nombre del auditor"
                    required
                  />
                </Grid>
              )}

              {/* Justificación */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Justificación"
                  value={followUp.justification}
                  onChange={(e) => updateFollowUp(followUp.id, 'justification', e.target.value)}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              {/* Fue efectiva la acción */}
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={followUp.wasEffective}
                      onChange={(e) => updateFollowUp(followUp.id, 'wasEffective', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="¿Fue efectiva la acción?"
                  sx={{ mt: 1 }}
                />
              </Grid>

            </Grid>
          </Paper>
        ))}

        {followUps.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No hay seguimientos registrados
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={addFollowUp}>
              Agregar Primer Seguimiento
            </Button>
          </Paper>
        )}
      </Grid>
      
    </Grid>
  );
}