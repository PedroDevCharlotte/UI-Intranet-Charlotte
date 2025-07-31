import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { APP_DEFAULT_PATH } from 'config';

// project-imports
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { useState } from 'react';

// ================================|| AUTENTICACIÓN 2FA ||================================ //

export default function TwoFactorAuth() {
  const { isLoggedIn, register2FA, requires2FA, verify2FA } = useAuth();
  const navigate = useNavigate();
  const [errorToEnable, setError] = useState('');

  // Aquí puedes agregar lógica de manejo de estado y envío del código 2FA
  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const code = form.elements.namedItem('code') as HTMLInputElement;

    try {
      let resp = await verify2FA(code.value);
      console.log('2FA verification successful:', resp);
      // Redirigir o mostrar mensaje de éxito
      if (!resp.isError) {
        navigate(APP_DEFAULT_PATH); // Redirigir a la página de verificación de 2FA
      } else {
        setError('Error al activar 2FA, intenta nuevamente o recarga la pagina y vuelve a escanear el QR.');
      }
    } catch (error) {
      // Manejar error de verificación
        setError('Error al verificar 2FA, intenta nuevamente o solicita al administrador que reestablesca la autenticación 2FA.');

      console.error('Error al verificar el código 2FA:', error);
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Autenticación 2FA</Typography>
            <Typography
              component={Link}
              to={isLoggedIn ? '/login' : '/login'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              Volver al inicio de sesión
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <form onSubmit={handleVerify}>
            <Stack spacing={2}>
              <Typography variant="body1">Ingresa el código de autenticación de 2 factores enviado a tu dispositivo.</Typography>
              <TextField
                label="Código 2FA"
                variant="outlined"
                id="code"
                name="code"
                fullWidth
                required
                // value, onChange, etc.
              />
              <Button variant="contained" color="primary" type="submit">
                Verificar
              </Button>
              {errorToEnable && (
                <Typography color="error" variant="body2">
                  {errorToEnable}
                </Typography>
              )}
            </Stack>
          </form>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
