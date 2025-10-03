import React from 'react';
import { 
  TextField, 
  Autocomplete, 
  Button, 
  Paper, 
  Typography, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider,
  Alert,
  Grid2 as Grid
} from '@mui/material';
import { Add, Trash } from 'iconsax-react';

interface UserOption {
  id: number;
  label: string;
}

interface ActionPlan {
  id: string;
  description: string;
  commitmentDate: string;
  responsibles: UserOption[];
  type: 'principal' | 'secundaria';
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

  // Log para depurar userOptions
  console.log('NonConformityTabActions - userOptions received:', userOptions);

  // Filtrar usuarios excluyendo el usuario con id 1
  const filteredUserOptions = userOptions.filter(user => user.id !== 1);
  
  console.log('NonConformityTabActions - filteredUserOptions:', filteredUserOptions);

  // Inicializar actionPlans si no existe
  const actionPlans: ActionPlan[] = values.actionPlans || [];

  // Validar que haya al menos un plan principal
  const hasPrincipalPlan = actionPlans.some(plan => plan.type === 'principal');

  // Función para agregar un nuevo plan de acción
  const addActionPlan = () => {
    const newPlan: ActionPlan = {
      id: Date.now().toString(),
      description: '',
      commitmentDate: '',
      responsibles: [],
      type: 'secundaria'
    };
    
    const updatedPlans = [...actionPlans, newPlan];
    setFieldValue('actionPlans', updatedPlans);
  };

  // Función para eliminar un plan de acción
  const removeActionPlan = (planId: string) => {
    const updatedPlans = actionPlans.filter(plan => plan.id !== planId);
    setFieldValue('actionPlans', updatedPlans);
  };

  // Función para actualizar un campo específico de un plan
  const updateActionPlan = (planId: string, field: keyof ActionPlan, value: any) => {
    const updatedPlans = actionPlans.map(plan => 
      plan.id === planId ? { ...plan, [field]: value } : plan
    );
    setFieldValue('actionPlans', updatedPlans);
  };

  // Agregar plan inicial si no hay ninguno
  React.useEffect(() => {
    if (actionPlans.length === 0) {
      const initialPlan: ActionPlan = {
        id: 'initial',
        description: '',
        commitmentDate: '',
        responsibles: [],
        type: 'principal'
      };
      setFieldValue('actionPlans', [initialPlan]);
    }
  }, []);

  return (
    <Grid container spacing={3}>
      
      <Grid size={12}>
        <TextField 
          fullWidth 
          label="Causa" 
          name="cause" 
          value={values.cause || ''} 
          onChange={handleChange} 
          multiline 
          rows={3} 
        />
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          Planes de Acción
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add size={16} />}
            onClick={addActionPlan}
            sx={{ ml: 'auto' }}
          >
            Agregar Plan
          </Button>
        </Typography>

        {/* Alerta si no hay plan principal */}
        {!hasPrincipalPlan && actionPlans.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Debe existir al menos un plan de acción principal
          </Alert>
        )}

        {/* Lista de planes de acción */}
        {actionPlans.map((plan, index) => (
          <Paper key={plan.id} elevation={1} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              
              {/* Header del plan */}
              <Grid size={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid size={6}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Plan de Acción #{index + 1}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={plan.type}
                        label="Tipo"
                        onChange={(e) => updateActionPlan(plan.id, 'type', e.target.value)}
                      >
                        <MenuItem value="principal">Principal</MenuItem>
                        <MenuItem value="secundaria">Secundaria</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {actionPlans.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeActionPlan(plan.id)}
                        size="small"
                      >
                        <Trash size={18} />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Descripción del plan */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Descripción del Plan de Acción"
                  value={plan.description}
                  onChange={(e) => updateActionPlan(plan.id, 'description', e.target.value)}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              {/* Fecha compromiso */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Compromiso"
                  value={plan.commitmentDate}
                  onChange={(e) => updateActionPlan(plan.id, 'commitmentDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {/* Responsables */}
              <Grid size={6}>
                <Autocomplete
                  multiple
                  options={filteredUserOptions}
                  getOptionLabel={(option) => option.label}
                  value={plan.responsibles}
                  onChange={(_, newValue) => updateActionPlan(plan.id, 'responsibles', newValue)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Responsables" 
                      placeholder="Seleccionar responsables"
                      required={plan.responsibles.length === 0}
                    />
                  )}
                />
              </Grid>

            </Grid>
          </Paper>
        ))}

        {actionPlans.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No hay planes de acción definidos
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={addActionPlan}>
              Agregar Primer Plan
            </Button>
          </Paper>
        )}
      </Grid>

       <Grid size={12}>
        <TextField 
          fullWidth 
          label="Observaciones" 
          name="observations" 
          value={values.observations || ''} 
          onChange={handleChange} 
          multiline 
          rows={3} 
        />
      </Grid>
      
    </Grid>
  );
}