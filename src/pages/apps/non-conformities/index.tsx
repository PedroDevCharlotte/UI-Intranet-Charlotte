import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NonConformitiesTable from '../../../components/nonConformities/NonConformitiesTable';
import { useGetNonConformities, cancelNonConformity } from '../../../api/nonConformities';
import {
  CircularProgress,
  Container,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Add, DocumentDownload, DocumentText } from 'iconsax-react';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import usePermissions from 'hooks/usePermissions';

const steps = ['Información General', 'Motivos y Clasificación', 'Planes de Acción', 'Seguimientos'];

export default function NonConformitiesPage() {
  const { items: data, loading, error, mutate } = useGetNonConformities();
  const navigate = useNavigate();
  const { hasPerm } = usePermissions();
  
  // Estados para el modal de cancelación
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedNonConformity, setSelectedNonConformity] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para el stepper
  const [activeStep, setActiveStep] = useState(0);

  // Actualizar la lista de no conformidades al cargar la página
  useEffect(() => {
    mutate();
  }, [mutate]);

  // Verificar permisos básicos
  if (!hasPerm('non-conformities.read')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Alert 
            severity="warning" 
            variant="filled"
            sx={{ 
              maxWidth: 500,
              '& .MuiAlert-message': {
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              Acceso restringido
            </Typography>
            <Typography variant="body2">
              No tienes permisos para acceder al módulo de no conformidades. 
              Contacta al administrador del sistema para solicitar los permisos necesarios.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            maxWidth: 500,
            '& .MuiAlert-message': {
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            Error al cargar no conformidades
          </Typography>
          <Typography variant="body2">
            No se pudieron cargar los datos. Por favor, verifica tu conexión a internet e intenta nuevamente.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="inherit">
              Si el problema persiste, contacta al administrador del sistema.
            </Typography>
          </Box>
        </Alert>
      </Box>
    </Container>
  );
  
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  const handleCancel = (item: any) => {
    if (!hasPerm('non-conformities.cancel')) {
      openSnackbar({
        open: true,
        message: 'No tienes permisos para cancelar no conformidades',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }
    setSelectedNonConformity(item);
    setCancelModal(true);
  };

  const handleEdit = (item: any) => {
    if (!hasPerm('non-conformities.update')) {
      openSnackbar({
        open: true,
        message: 'No tienes permisos para editar no conformidades',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }
    // Navegar a la ruta homologada para edición
    navigate(`/apps/non-conformities/new?nonConformityId=${item.id}`);
  };

  const handleCreate = () => {
    if (!hasPerm('non-conformities.create')) {
      openSnackbar({
        open: true,
        message: 'No tienes permisos para crear no conformidades',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }
    navigate('/apps/non-conformities/create');
  };

  const handleDownloadExcel = () => {
    if (!hasPerm('non-conformities.dowloadxls')) {
      openSnackbar({
        open: true,
        message: 'No tienes permisos para descargar Excel',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }
    // TODO: Implementar descarga de Excel
    openSnackbar({
      open: true,
      message: 'Descarga de Excel próximamente disponible',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: { color: 'info' }
    } as SnackbarProps);
  };

  const handleDownloadPDF = () => {
    if (!hasPerm('non-conformities.dowloadpdf')) {
      openSnackbar({
        open: true,
        message: 'No tienes permisos para descargar PDF',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }
    // TODO: Implementar descarga de PDF
    openSnackbar({
      open: true,
      message: 'Descarga de PDF próximamente disponible',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: { color: 'info' }
    } as SnackbarProps);
  };

  const handleConfirmCancel = async () => {
    if (!selectedNonConformity || !cancelReason.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Llamar a la API para cancelar la no conformidad
      await cancelNonConformity(selectedNonConformity.id, cancelReason);
      
      // Mostrar mensaje de éxito
      openSnackbar({
        open: true,
        message: `No conformidad ${selectedNonConformity.number} cancelada exitosamente`,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      
      // Refrescar datos
      mutate();
      
      // Cerrar modal y limpiar estado
      handleCloseCancelModal();
    } catch (error: any) {
      console.error('Error al cancelar no conformidad:', error);
      
      // Mostrar mensaje de error
      openSnackbar({
        open: true,
        message: error?.message || 'Error al cancelar la no conformidad',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCancelModal = () => {
    if (isSubmitting) return; // Evitar cerrar mientras se está enviando
    setCancelModal(false);
    setSelectedNonConformity(null);
    setCancelReason('');
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              No Conformidades
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión y seguimiento de no conformidades del sistema de calidad
            </Typography>
          </Box>
          
          {/* Botones de acción */}
          <Stack direction="row" spacing={1}>
            {hasPerm('non-conformities.create') && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
              >
                Nueva No Conformidad
              </Button>
            )}
            
            {hasPerm('non-conformities.dowloadxls') && (
              <Button
                variant="outlined"
                startIcon={<DocumentDownload />}
                onClick={handleDownloadExcel}
                color="success"
              >
                Excel
              </Button>
            )}
            
            {hasPerm('non-conformities.dowloadpdf') && (
              <Button
                variant="outlined"
                startIcon={<DocumentText />}
                onClick={handleDownloadPDF}
                color="error"
              >
                PDF
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Tabla de No Conformidades */}
      <NonConformitiesTable 
        items={data || []} 
        onEdit={hasPerm('non-conformities.update') ? handleEdit : undefined} 
        onDelete={hasPerm('non-conformities.cancel') ? (item) => handleCancel(item) : undefined} 
        canRead={hasPerm('non-conformities.read')}
      />

      {/* Modal de cancelación */}
      <Dialog 
        open={cancelModal} 
        onClose={handleCloseCancelModal} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Cancelar No Conformidad
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedNonConformity?.number} - {selectedNonConformity?.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Justificación de cancelación"
            placeholder="Explica el motivo por el cual se está cancelando esta no conformidad..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            variant="outlined"
            required
            helperText="Este campo es obligatorio para proceder con la cancelación"
            error={!cancelReason.trim() && cancelReason.length > 0}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseCancelModal}
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={!cancelReason.trim() || isSubmitting}
            sx={{ ml: 1 }}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulario de No Conformidad */}
      <Box sx={{ mt: 4, p: 3, borderRadius: 2, boxShadow: 1, backgroundColor: 'white' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Nueva No Conformidad
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box>
          {activeStep === 0 && (
            <Box>
              {/* Información General */}
              <TextField label="Número" fullWidth />
              <TextField label="Área o Proceso" fullWidth />
            </Box>
          )}
          {activeStep === 1 && (
            <Box>
              {/* Motivos y Clasificación */}
              <TextField label="Motivo" fullWidth />
              <TextField label="Clasificación" fullWidth />
            </Box>
          )}
          {activeStep === 2 && (
            <Box>
              {/* Planes de Acción */}
              <TextField label="Descripción del Plan" fullWidth />
            </Box>
          )}
          {activeStep === 3 && (
            <Box>
              {/* Seguimientos */}
              <TextField label="Justificación" fullWidth />
            </Box>
          )}
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            disabled={activeStep === 0} 
            onClick={handleBack}
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
