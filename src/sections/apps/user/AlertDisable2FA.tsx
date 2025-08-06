// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

// react
import { useState } from 'react';

// project-imports
import { openSnackbar } from 'api/snackbar';
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { Shield } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { disable2FA } from 'api/user';

interface Props {
  id: number;
  userName: string;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| USER - DISABLE 2FA ||============================== //

export default function AlertDisable2FA({ id, userName, open, handleClose }: Props) {
  const [isDisabling, setIsDisabling] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleAuthCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 6) {
      setAuthCode(value);
      setCodeError('');
    }
  };

  const handleDialogClose = () => {
    setAuthCode('');
    setCodeError('');
    handleClose();
  };

  const disable2FAHandler = async () => {
    // Validar que el código tenga 6 dígitos
    if (!authCode || authCode.length !== 6) {
      setCodeError('El código debe tener 6 dígitos');
      return;
    }

    setIsDisabling(true);

    try {
      // Aquí deberías hacer la llamada a la API real para deshabilitar 2FA con el código
      const result = await disable2FA(id, authCode, true);

      // Simulamos la llamada a la API
      if (result.success) {
        openSnackbar({
          open: true,
          message: `Autenticación 2FA deshabilitada correctamente para ${userName}`,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'success'
          }
        } as SnackbarProps);
        
        setTimeout(() => {
          setIsDisabling(false);
          handleDialogClose();
        }, 1000);
      } else {
        // Si el resultado indica código inválido
        if (result.error && result.error.includes('código')) {
          setCodeError('Código de autenticación inválido');
        } else {
          openSnackbar({
            open: true,
            message: result.error || `Error al deshabilitar 2FA para ${userName}`,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            variant: 'alert',
            alert: {
              color: 'error'
            }
          } as SnackbarProps);
        }
        setIsDisabling(false);
      }
      
    } catch (error: any) {
      console.error('Error inesperado:', error);
      
      // Verificar si es un error de código inválido
      if (error.response?.status === 400 || error.message?.includes('código')) {
        setCodeError('Código de autenticación inválido');
      } else {
        openSnackbar({
          open: true,
          message: 'Error inesperado al deshabilitar 2FA',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
      }
      setIsDisabling(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isDisabling ? undefined : handleDialogClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
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
              ¿Deshabilitar Autenticación 2FA?
            </Typography>
            <Typography align="center">
              Al deshabilitar la autenticación 2FA para
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{userName}&quot;{' '}
              </Typography>
              el usuario perderá la capa adicional de seguridad en su cuenta.
            </Typography>
            <Typography align="center" color="warning.main" variant="body2">
              <strong>Advertencia:</strong> Esta acción volverá a solicitar la autenticación 2FA para la seguridad de la cuenta del usuario.
            </Typography>

            {/* Campo de código de autenticación */}
            <Stack sx={{ gap: 1, mt: 2 }}>
              <InputLabel htmlFor="auth-code">
                Código de Autenticación (6 dígitos)
              </InputLabel>
              <TextField
                id="auth-code"
                value={authCode}
                onChange={handleAuthCodeChange}
                placeholder="123456"
                fullWidth
                error={!!codeError}
                disabled={isDisabling}
                inputProps={{
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }
                }}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    fontFamily: 'monospace'
                  }
                }}
              />
              {codeError && (
                <FormHelperText error>{codeError}</FormHelperText>
              )}
              <Typography variant="caption" color="text.secondary" align="center">
                Ingresa el código de 6 dígitos de tu aplicación autenticadora
              </Typography>
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
              onClick={disable2FAHandler}
              autoFocus
              disabled={isDisabling || !authCode || authCode.length !== 6}
              startIcon={isDisabling ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isDisabling ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
