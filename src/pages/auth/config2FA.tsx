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
import { useEffect, useState } from 'react';
import { n } from 'react-router/dist/development/fog-of-war-DLtn2OLr';

// ================================|| CONFIGURAR AUTENTICACIÓN 2FA ||================================ //

export default function SetupTwoFactorAuth() {
  const { isLoggedIn, setup2FA, user, enable2FA } = useAuth();
  const navigate = useNavigate();

  // Aquí puedes agregar lógica para generar el código QR y manejar el estado del código 2FA
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [errorToEnable, setError] = useState('');
  // const [code, setCode] = useState('');

  // Usar useEffect para llamar a setup2FA al montar el componente

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await setup2FA();
        // Aquí deberías manejar la respuesta, como generar el código QR
        setQrCodeUrl(response.qrCode);
        console.log('2FA setup response:', response);
      } catch (error) {
        console.error('Error setting up 2FA:', error);
      }
    };

    fetchQrCode();
  }, [setup2FA]);
  

  const handleActivate2FA = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Activating 2FA with code:', event);
    const form = event.target as HTMLFormElement;
    console.log('Form elements:', form);
    const code = form.elements.namedItem('code') as HTMLInputElement;
    console.log('Code input value:', code);
    try {
      let resp = await enable2FA(code.value);
      console.log('2FA activated successfully:', resp);

      if (!resp.isError) {
        navigate(APP_DEFAULT_PATH); // Redirigir a la página de verificación de 2FA

      }else{
        setError( 'Error al activar 2FA, intenta nuevamente o recarga la pagina y vuelve a escanear el QR.');
      }
      // Redirigir o mostrar mensaje de éxito
    } catch (error) {
      // Manejar error de activación
      console.error('Error al activar 2FA:', error);
    }

  };


  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Configurar autenticación 2FA</Typography>
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
          <Stack spacing={2}>
            <Typography variant="body1">
              Escanea el siguiente código QR con tu aplicación de autenticación (Microsoft Authenticator, Google Authenticator, Authy, etc.) y luego ingresa el código generado para completar la configuración.
            </Typography>
            {/* Aquí deberías renderizar el código QR generado por el backend */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
              {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Código QR 2FA" />
              ) : (
              <div style={{ width: 180, height: 180, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Código QR aquí
              </div>
              )}
            </div>
            <form onSubmit={handleActivate2FA}>
              <Stack spacing={2}>
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
                  Activar 2FA
                </Button>
              </Stack>
              {errorToEnable && (
                <Typography color="error" variant="body2">
                  {errorToEnable}
                </Typography>
              )}
            </form>
          </Stack>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
