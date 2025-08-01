// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// react
import { useState } from 'react';

// project-imports
import { deleteUser } from 'api/user';
import { openSnackbar } from 'api/snackbar';
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { Trash } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| USER - DELETE ||============================== //

export default function AlertUserDelete({ id, title, open, handleClose }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deletehandler = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteUser(id);
      
      // Verificar si hay error
      if (result.error || !result.success) {
        openSnackbar({
          open: true,
          message: result.error || 'Error al eliminar el usuario',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
        return;
      }
      
      // Verificar si el resultado es exitoso
      if (result.success) {
        openSnackbar({
          open: true,
          message: result.message || 'Usuario eliminado correctamente',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'success'
          }
        } as SnackbarProps);
        handleClose();
      } else {
        openSnackbar({
          open: true,
          message: 'Error al eliminar el usuario, por favor intente de nuevo',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      openSnackbar({
        open: true,
        message: 'Error inesperado al eliminar el usuario',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack sx={{ gap: 3.5, alignItems: 'center' }}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="h4" align="center">
              ¿Estás seguro de que quieres eliminar?
            </Typography>
            <Typography align="center">
              Al eliminar
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{title}&quot;{' '}
              </Typography>
              usuario, todas las tareas asignadas a ese usuario también se eliminarán.
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ gap: 2, width: 1 }}>
            <Button 
              fullWidth 
              onClick={handleClose} 
              color="secondary" 
              variant="outlined"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              fullWidth 
              color="error" 
              variant="contained" 
              onClick={deletehandler} 
              autoFocus
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
