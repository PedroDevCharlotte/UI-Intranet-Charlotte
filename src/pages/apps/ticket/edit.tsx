import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';

// project-imports
import MainCard from 'components/MainCard';
import { openSnackbar } from 'api/snackbar';
import { GRID_COMMON_SPACING } from 'config';

// types
import { SnackbarProps } from 'types/snackbar';

// ==============================|| TICKET - EDIT ||============================== //

export default function EditTicket() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    category: '',
    customer: null as any,
    assignedTo: null as any
  });

  // Mock data - En una aplicación real, esto vendría de la API
  const customers = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com' }
  ];

  const agents = [
    { id: 1, name: 'Sarah Wilson', department: 'Support' },
    { id: 2, name: 'David Brown', department: 'Technical' },
    { id: 3, name: 'Lisa Garcia', department: 'Billing' }
  ];

  const categories = ['Technical Issue', 'Billing Question', 'Feature Request', 'Bug Report', 'Account Access', 'General Inquiry', 'Other'];

  // Simular carga de datos del ticket
  useEffect(() => {
    // En una aplicación real, aquí harías una llamada a la API para obtener los datos del ticket
    const mockTicketData = {
      subject: 'Login Issue - Cannot access account',
      description:
        'User is unable to login to their account. They receive an error message saying "Invalid credentials" even though they are using the correct username and password.',
      priority: 'High',
      status: 'In Progress',
      category: 'Technical Issue',
      customer: customers[0],
      assignedTo: agents[0]
    };

    setFormData(mockTicketData);
  }, [id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validación básica
    if (!formData.subject.trim()) {
      openSnackbar({
        open: true,
        message: 'Subject is required',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }

    if (!formData.description.trim()) {
      openSnackbar({
        open: true,
        message: 'Description is required',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }

    try {
      // Aquí iría la llamada a la API para actualizar el ticket

      openSnackbar({
        open: true,
        message: 'Ticket updated successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);

      // Redirigir a los detalles del ticket
      navigate(`/apps/ticket/details/${id}`);
    } catch {
      openSnackbar({
        open: true,
        message: 'Error updating ticket',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  };

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <MainCard title={`Edit Ticket #${id}`}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Typography variant="h6">Ticket Information</Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Subject *</InputLabel>
                    <TextField
                      fullWidth
                      placeholder="Enter ticket subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Status</InputLabel>
                    <FormControl fullWidth>
                      <Select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)}>
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Priority</InputLabel>
                    <FormControl fullWidth>
                      <Select value={formData.priority} onChange={(e) => handleInputChange('priority', e.target.value)}>
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Category</InputLabel>
                    <FormControl fullWidth>
                      <Select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} displayEmpty>
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Customer</InputLabel>
                    <Autocomplete
                      value={formData.customer}
                      onChange={(event, newValue) => handleInputChange('customer', newValue)}
                      options={customers}
                      getOptionLabel={(option) => `${option.name} (${option.email})`}
                      renderInput={(params) => <TextField {...params} placeholder="Select customer" />}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Assign To</InputLabel>
                    <Autocomplete
                      value={formData.assignedTo}
                      onChange={(event, newValue) => handleInputChange('assignedTo', newValue)}
                      options={agents}
                      getOptionLabel={(option) => `${option.name} (${option.department})`}
                      renderInput={(params) => <TextField {...params} placeholder="Assign to agent" />}
                    />
                  </Stack>
                </Grid>
              </Grid>

              {/* Description */}
              <Stack spacing={1}>
                <InputLabel>Description *</InputLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
                <Button variant="outlined" onClick={() => navigate(`/apps/ticket/details/${id}`)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSubmit}>
                  Update Ticket
                </Button>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
