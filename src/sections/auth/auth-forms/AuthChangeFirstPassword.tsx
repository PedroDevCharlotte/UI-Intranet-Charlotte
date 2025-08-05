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

export default function AuthChangeFirstPassword() {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();

  const { isLoggedIn, changeFirstPassword } = useAuth();

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
          oldPassword: '',
          newPassword: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          oldPassword: Yup.string().required('La contraseña es obligatoria'),
          newPassword: Yup.string()
            .required('La nueva contraseña es obligatoria')
            .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
            .matches(/[a-z]/, 'Debe contener al menos una minúscula')
            .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
            .matches(/[0-9]/, 'Debe contener al menos un número')
            .matches(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            // Validate password reset with verification code
            let response = await changeFirstPassword(values.oldPassword, values.newPassword);

            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);

              openSnackbar({
                open: true,
                message: 'Contraseña restablecida exitosamente.',
                variant: 'alert',
                alert: {
                  color: 'success'
                }
              } as SnackbarProps);

              setTimeout(() => {
                navigate(isLoggedIn ? '/' : '/login', { replace: true });
              }, 1500);
            }
          } catch (err: any) {
            console.error('Fallo ', err);
            console.error('Fallo ', err.statusCode);
            console.error('Fallo scriptedRef', scriptedRef);
            // if (scriptedRef.current) {
            setStatus({ success: false });

            // Handle specific error cases
            let errorMessage = 'Error al actualizar la contraseña';

            if (err.response?.status === 400) {
              errorMessage = 'Código de verificación inválido o expirado';
            } else if (err.response?.status === 404) {
              errorMessage = 'No se encontró una solicitud de actualización para este correo';
            } else if (err.response?.data?.message) {
              errorMessage = err.response.data.message;
            } else if (err.message) {
              errorMessage = err.message;
            }

            setErrors({ submit: errorMessage });
            setSubmitting(false);
            // }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
          // Función para generar y asignar contraseña segura
          const handleGeneratePassword = () => {
            const newPassword = generateSecurePassword(12);
            setFieldValue('newPassword', newPassword);
            changePassword(newPassword);
          };

          return (
            <form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <InputLabel htmlFor="new-password">Nueva Contraseña</InputLabel>
                      <Tooltip title="Generar contraseña segura">
                        <IconButton onClick={handleGeneratePassword} color="primary" size="small" sx={{ ml: 1 }}>
                          <Key size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.newPassword && errors.newPassword)}
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.newPassword}
                      name="newPassword"
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
                      placeholder="Ingresa la nueva contraseña"
                    />
                  </Stack>
                  {touched.newPassword && errors.newPassword && (
                    <FormHelperText error id="helper-text-password-reset">
                      {errors.newPassword}
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
                    <InputLabel htmlFor="old-password">Contraseña Anterior</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.oldPassword && errors.oldPassword)}
                      id="old-password"
                      type="text"
                      value={values.oldPassword}
                      name="oldPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Ingresa la contraseña temporal"
                    />
                  </Stack>
                  {touched.oldPassword && errors.oldPassword && (
                    <FormHelperText error id="helper-text-confirm-password-reset">
                      {errors.oldPassword}
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
                      Guardar nueva Contraseña
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
