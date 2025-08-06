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
import { openSnackbar } from 'api/snackbar';
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { People } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';

interface Props {
  id: number;
  userName: string;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| USER - ASSIGN TEAM ||============================== //

export default function AlertAssignTeam({ id, userName, open, handleClose }: Props) {
  const [isAssigning, setIsAssigning] = useState(false);

  const assignTeamHandler = async () => {
    setIsAssigning(true);
    
    try {
      // Aquí deberías hacer la llamada a la API real para asignar equipo
      // const result = await assignTeam(id);
      
      // Simulamos la llamada a la API
      setTimeout(() => {
        openSnackbar({
          open: true,
          message: `Equipo de trabajo asignado correctamente a ${userName}`,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'success'
          }
        } as SnackbarProps);
        
        setIsAssigning(false);
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error inesperado:', error);
      openSnackbar({
        open: true,
        message: 'Error inesperado al asignar equipo de trabajo',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      setIsAssigning(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isAssigning ? undefined : handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="assign-team-title"
      aria-describedby="assign-team-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack sx={{ gap: 3.5, alignItems: 'center' }}>
          <Avatar color="secondary" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <People variant="Bold" />
          </Avatar>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="h4" align="center">
              ¿Asignar Equipo de Trabajo?
            </Typography>
            <Typography align="center">
              ¿Desea asignar un equipo de trabajo a
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{userName}&quot;{' '}
              </Typography>
              ?
            </Typography>
            <Typography align="center" color="text.secondary" variant="body2">
              Esta acción abrirá el modal de asignación de equipos.
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ gap: 2, width: 1 }}>
            <Button 
              fullWidth 
              onClick={handleClose} 
              color="secondary" 
              variant="outlined"
              disabled={isAssigning}
            >
              Cancelar
            </Button>
            <Button 
              fullWidth 
              color="secondary" 
              variant="contained" 
              onClick={assignTeamHandler} 
              autoFocus
              disabled={isAssigning}
              startIcon={isAssigning ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isAssigning ? 'Asignando...' : 'Asignar Equipo'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
