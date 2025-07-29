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

// ================================|| AUTENTICACIÓN 2FA ||================================ //

export default function TwoFactorAuth() {
  const { isLoggedIn } = useAuth();

  // Aquí puedes agregar lógica de manejo de estado y envío del código 2FA

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Autenticación 2FA</Typography>
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
          <form>
            <Stack spacing={2}>
              <Typography variant="body1">
                Ingresa el código de autenticación de 2 factores enviado a tu dispositivo.
              </Typography>
              <TextField
                label="Código 2FA"
                variant="outlined"
                fullWidth
                required
                // value, onChange, etc.
              />
              <Button variant="contained" color="primary" type="submit">
                Verificar
              </Button>
            </Stack>
          </form>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
