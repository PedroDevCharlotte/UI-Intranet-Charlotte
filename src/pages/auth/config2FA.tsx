import { Link } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// project-imports
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';

// ================================|| CONFIGURAR AUTENTICACIÓN 2FA ||================================ //

export default function SetupTwoFactorAuth() {
  const { isLoggedIn } = useAuth();

  // Aquí puedes agregar lógica para generar el código QR y manejar el estado del código 2FA
  // Por ejemplo: const [qrCodeUrl, setQrCodeUrl] = useState('');
  // const [code, setCode] = useState('');

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Configurar autenticación 2FA</Typography>
            <Typography
              component={Link}
              to={isLoggedIn ? '/auth/login' : '/login'}
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
              Escanea el siguiente código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.) y luego ingresa el código generado para completar la configuración.
            </Typography>
            {/* Aquí deberías renderizar el código QR generado por el backend */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
              {/* <img src={qrCodeUrl} alt="Código QR 2FA" /> */}
              <div style={{ width: 180, height: 180, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Código QR aquí
              </div>
            </div>
            <form>
              <Stack spacing={2}>
                <TextField
                  label="Código 2FA"
                  variant="outlined"
                  fullWidth
                  required
                  // value, onChange, etc.
                />
                <Button variant="contained" color="primary" type="submit">
                  Activar 2FA
                </Button>
              </Stack>
            </form>
          </Stack>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
