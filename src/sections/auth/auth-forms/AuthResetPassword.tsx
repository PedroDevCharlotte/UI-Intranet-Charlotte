import { useEffect, useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// types
import { StringColorProps } from 'types/password';
import { SnackbarProps } from 'types/snackbar';

// assets
import { Eye, EyeSlash, Key } from 'iconsax-react';

// ============================|| FIREBASE - RESET PASSWORD ||============================ //

// Función para generar contraseña segura
const generateSecurePassword = (length: number = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Asegurar que la contraseña tenga al menos un carácter de cada tipo
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Completar el resto de la longitud con caracteres aleatorios
  const allChars = lowercase + uppercase + numbers + specialChars;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres para que no tengan un patrón predecible
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

export default function AuthResetPassword() {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();

  const { isLoggedIn, verifyPasswordReset } = useAuth();

  const [level, setLevel] = useState<StringColorProps>();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const changePassword = (value: string) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          code: '',
          password: '',
          confirmPassword: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Debe ser un correo electrónico válido').max(255).required('El correo electrónico es obligatorio'),
          code: Yup.string()
            .required('El código de verificación es obligatorio')
            .min(6, 'El código debe tener al menos 6 caracteres')
            .max(10, 'El código no puede tener más de 10 caracteres'),
          password: Yup.string()
            .required('La contraseña es obligatoria')
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .matches(/[a-z]/, 'Debe contener al menos una minúscula')
            .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
            .matches(/[0-9]/, 'Debe contener al menos un número')
            .matches(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
          confirmPassword: Yup.string()
            .required('La confirmación de la contraseña es obligatoria')
            .test('confirmPassword', '¡Las contraseñas deben coincidir!', (confirmPassword, yup) => yup.parent.password === confirmPassword)
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            // Validate password reset with verification code
            await verifyPasswordReset(values.email, values.code, values.password);

            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);

              openSnackbar({
                open: true,
                message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
                variant: 'alert',
                alert: {
                  color: 'success'
                }
              } as SnackbarProps);

              setTimeout(() => {
                navigate(isLoggedIn ? '/auth/login' : '/login', { replace: true });
              }, 1500);
            }
          } catch (err: any) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });

              // Handle specific error cases
              let errorMessage = 'Error al restablecer la contraseña';

              if (err.response?.status === 400) {
                errorMessage = 'Código de verificación inválido o expirado';
              } else if (err.response?.status === 404) {
                errorMessage = 'No se encontró una solicitud de restablecimiento para este correo';
              } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
              } else if (err.message) {
                errorMessage = err.message;
              }

              setErrors({ submit: errorMessage });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
          // Función para generar y asignar contraseña segura
          const handleGeneratePassword = () => {
            const newPassword = generateSecurePassword(12);
            setFieldValue('password', newPassword);
            setFieldValue('confirmPassword', newPassword);
            changePassword(newPassword);
          };

          return (
            <form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="email-reset">Correo Electrónico</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.email && errors.email)}
                      id="email-reset"
                      type="email"
                      value={values.email}
                      name="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Ingresa tu correo electrónico"
                      autoComplete="email"
                    />
                  </Stack>
                  {touched.email && errors.email && (
                    <FormHelperText error id="helper-text-email-reset">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="verification-code">Código de Verificación</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.code && errors.code)}
                      id="verification-code"
                      type="text"
                      value={values.code}
                      name="code"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Ingresa el código de verificación"
                      inputProps={{
                        maxLength: 10,
                        style: { textTransform: 'uppercase' }
                      }}
                    />
                  </Stack>
                  {touched.code && errors.code && (
                    <FormHelperText error id="helper-text-verification-code">
                      {errors.code}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <InputLabel htmlFor="password-reset">Contraseña</InputLabel>
                      <Tooltip title="Generar contraseña segura">
                        <IconButton onClick={handleGeneratePassword} color="primary" size="small" sx={{ ml: 1 }}>
                          <Key size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.password && errors.password)}
                      id="password-reset"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        changePassword(e.target.value);
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="mostrar/ocultar contraseña"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            color="secondary"
                          >
                            {showPassword ? <Eye /> : <EyeSlash />}
                          </IconButton>
                        </InputAdornment>
                      }
                      placeholder="Ingresa la contraseña"
                    />
                  </Stack>
                  {touched.password && errors.password && (
                    <FormHelperText error id="helper-text-password-reset">
                      {errors.password}
                    </FormHelperText>
                  )}
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      <Grid>
                        <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                      </Grid>
                      <Grid>
                        <Typography variant="subtitle1" sx={{ fontSize: '0.75rem' }}>
                          {level?.label}
                        </Typography>
                      </Grid>
                    </Grid>
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="confirm-password-reset">Confirmar Contraseña</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                      id="confirm-password-reset"
                      type="password"
                      value={values.confirmPassword}
                      name="confirmPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Ingresa la confirmación de la contraseña"
                    />
                  </Stack>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <FormHelperText error id="helper-text-confirm-password-reset">
                      {errors.confirmPassword}
                    </FormHelperText>
                  )}
                </Grid>

                {errors.submit && (
                  <Grid size={12}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
                  </Grid>
                )}
                <Grid size={12}>
                  <AnimateButton>
                    <Button
                      disableElevation
                      disabled={isSubmitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Restablecer Contraseña
                    </Button>
                  </AnimateButton>
                </Grid>
              </Grid>
            </form>
          );
        }}
      </Formik>
    </>
  );
}
