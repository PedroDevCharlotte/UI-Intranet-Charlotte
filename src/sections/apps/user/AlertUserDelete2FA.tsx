// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';

// react
import { useState } from 'react';

// project-imports
import { openSnackbar } from 'api/snackbar';
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';
import axios from 'utils/axios';

// assets
import { Shield } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';

interface Props {
  userId: number;
  userName: string;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| USER - DISABLE 2FA ||============================== //

export default function AlertDisable2FA({ userId, userName, open, handleClose }: Props) {
  const [isDisabling, setIsDisabling] = useState(false);
  const [token, setToken] = useState('');

  const handleDisable2FA = async () => {
    if (!token.trim()) {
      openSnackbar({
        open: true,
        message: 'El token es obligatorio',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      return;
    }

    setIsDisabling(true);

    try {
      const response = await axios.post('/auth/2fa/disable', {
        userId: userId,
        token: token.trim()
      });

      openSnackbar({
        open: true,
        message: 'Autenticación de dos factores desactivada correctamente',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);

      setToken('');
      handleClose();
    } catch (error: any) {
      console.error('Error desactivando 2FA:', error);

      let errorMessage = 'Error al desactivar la autenticación de dos factores';

      if (error.response?.status === 400) {
        errorMessage = 'Token inválido o expirado';
      } else if (error.response?.status === 401) {
        errorMessage = 'No tiene permisos para realizar esta acción';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      openSnackbar({
        open: true,
        message: errorMessage,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    } finally {
      setIsDisabling(false);
    }
  };

  const handleDialogClose = () => {
    if (!isDisabling) {
      setToken('');
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="sm"
      aria-labelledby="disable-2fa-title"
      aria-describedby="disable-2fa-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack sx={{ gap: 3.5, alignItems: 'center' }}>
          <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Shield variant="Bold" />
          </Avatar>

          <Stack sx={{ gap: 2, width: '100%' }}>
            <Typography variant="h4" align="center">
              Desactivar Autenticación de Dos Factores
            </Typography>
            <Typography align="center">
              ¿Estás seguro de que quieres desactivar la autenticación de dos factores para
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{userName}&quot;{' '}
              </Typography>
              ?
            </Typography>

            <Stack sx={{ gap: 1, mt: 2 }}>
              <InputLabel htmlFor="2fa-token">Token de Verificación</InputLabel>
              <TextField
                fullWidth
                id="2fa-token"
                placeholder="Ingrese el token de verificación"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isDisabling}
                autoFocus
              />
            </Stack>
          </Stack>

          <Stack direction="row" sx={{ gap: 2, width: 1 }}>
            <Button fullWidth onClick={handleDialogClose} color="secondary" variant="outlined" disabled={isDisabling}>
              Cancelar
            </Button>
            <Button
              fullWidth
              color="warning"
              variant="contained"
              onClick={handleDisable2FA}
              disabled={isDisabling || !token.trim()}
              startIcon={isDisabling ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isDisabling ? 'Desactivando...' : 'Desactivar 2FA'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
