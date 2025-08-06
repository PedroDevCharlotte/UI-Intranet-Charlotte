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
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { openSnackbar } from 'api/snackbar';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

// types
import { SnackbarProps } from 'types/snackbar';

// ==============================|| TICKET - DETAILS ||============================== //

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data - En una aplicación real, esto vendría de la API
  const [ticketData, setTicketData] = useState({
    id: id || '1',
    subject: 'Login Issue - Cannot access account',
    description: 'User is unable to login to their account. They receive an error message saying "Invalid credentials" even though they are using the correct username and password.',
    priority: 'High',
    status: 'Open',
    category: 'Technical Issue',
    customer: { name: 'John Doe', email: 'john.doe@example.com' },
    assignedTo: { name: 'Sarah Wilson', department: 'Support' },
    createdAt: '2025-08-06T10:30:00Z',
    updatedAt: '2025-08-06T14:15:00Z'
  });

  const [editData, setEditData] = useState({ ...ticketData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...ticketData });
  };

  const handleSave = async () => {
    try {
      // Aquí iría la llamada a la API para actualizar el ticket
      console.log('Updating ticket:', editData);
      
      setTicketData({ ...editData });
      setIsEditing(false);
      
      openSnackbar({
        open: true,
        message: 'Ticket updated successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    } catch (error) {
      openSnackbar({
        open: true,
        message: 'Error updating ticket',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...ticketData });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': case 'Urgent': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'ticket', to: '/apps/ticket/list' },
    { title: `details #${id}` }
  ];

  return (
    <>
      <Breadcrumbs custom heading={`ticket-details-${id}`} links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <MainCard
            title={
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5">Ticket #{ticketData.id}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={ticketData.priority}
                    size="small"
                    color={getPriorityColor(ticketData.priority) as any}
                    variant="filled"
                  />
                  <Chip
                    label={ticketData.status}
                    size="small"
                    color={getStatusColor(ticketData.status) as any}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            }
            secondary={
              <Stack direction="row" spacing={1}>
                {!isEditing ? (
                  <>
                    <Button variant="outlined" onClick={handleEdit}>
                      Edit
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/apps/ticket/list')}>
                      Back to List
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                )}
              </Stack>
            }
          >
            <Stack spacing={3}>
              {/* Ticket Information */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Subject</InputLabel>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={editData.subject}
                        onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                      />
                    ) : (
                      <Typography variant="body1">{ticketData.subject}</Typography>
                    )}
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Category</InputLabel>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <Select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        >
                          <MenuItem value="Technical Issue">Technical Issue</MenuItem>
                          <MenuItem value="Billing Question">Billing Question</MenuItem>
                          <MenuItem value="Feature Request">Feature Request</MenuItem>
                          <MenuItem value="Bug Report">Bug Report</MenuItem>
                          <MenuItem value="Account Access">Account Access</MenuItem>
                          <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body1">{ticketData.category}</Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Priority</InputLabel>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <Select
                          value={editData.priority}
                          onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                        >
                          <MenuItem value="Low">Low</MenuItem>
                          <MenuItem value="Medium">Medium</MenuItem>
                          <MenuItem value="High">High</MenuItem>
                          <MenuItem value="Urgent">Urgent</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={ticketData.priority}
                        size="small"
                        color={getPriorityColor(ticketData.priority) as any}
                        variant="filled"
                        sx={{ width: 'fit-content' }}
                      />
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <InputLabel>Status</InputLabel>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <Select
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        >
                          <MenuItem value="Open">Open</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Resolved">Resolved</MenuItem>
                          <MenuItem value="Closed">Closed</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={ticketData.status}
                        size="small"
                        color={getStatusColor(ticketData.status) as any}
                        variant="outlined"
                        sx={{ width: 'fit-content' }}
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>

              <Divider />

              {/* Customer Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Customer Information</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                    <Typography variant="body1">{ticketData.customer.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{ticketData.customer.email}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Assignment Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Assignment</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">Assigned To</Typography>
                    <Typography variant="body1">{ticketData.assignedTo.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">Department</Typography>
                    <Typography variant="body1">{ticketData.assignedTo.department}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Description */}
              <Stack spacing={1}>
                <InputLabel>Description</InputLabel>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                ) : (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {ticketData.description}
                  </Typography>
                )}
              </Stack>

              <Divider />

              {/* Timestamps */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Timeline</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">Created</Typography>
                    <Typography variant="body1">{formatDate(ticketData.createdAt)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">{formatDate(ticketData.updatedAt)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
