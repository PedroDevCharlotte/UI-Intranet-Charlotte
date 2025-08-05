// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthChangeFirstPassword from 'sections/auth/auth-forms/AuthChangeFirstPassword';
// ================================|| CHANGE FIRST LOGIN ||================================ //


export default function FirstLogin() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1, mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Primer inicio de sesión</Typography>
            <Typography color="secondary">Por favor elige tu nueva contraseña para continuar</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthChangeFirstPassword />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
