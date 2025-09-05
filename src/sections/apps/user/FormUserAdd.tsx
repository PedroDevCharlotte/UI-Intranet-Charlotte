import { useEffect, useState, ChangeEvent, SyntheticEvent } from 'react';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// third-party
import { merge } from 'lodash-es';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import AlertUserDelete from './AlertUserDelete';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

import { insertUser, updateUser, useGetRoles, useGetDepartments, useGetSupportTypes, assignSupportTypes, useGetUser } from 'api/user';
import { openSnackbar } from 'api/snackbar';
import { Gender } from 'config';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// assets
import { Camera, CloseCircle, Eye, EyeSlash, Key, Trash } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { UserList } from 'types/user';
import { passiveEventSupported } from '@tanstack/react-table';
import { StringColorProps } from 'types/password';

interface StatusProps {
  value: number;
  label: string;
}

const skills = [
  'Adobe XD',
  'After Effect',
  'Angular',
  'Animación',
  'ASP.Net',
  'Bootstrap',
  'C#',
  'CC',
  'Corel Draw',
  'CSS',
  'DIV',
  'Dreamweaver',
  'Figma',
  'Gráficos',
  'HTML',
  'Illustrator',
  'J2Ee',
  'Java',
  'Javascript',
  'JQuery',
  'Diseño de logotipo',
  'Material UI',
  'Motion',
  'MVC',
  'MySQL',
  'NodeJS',
  'npm',
  'Photoshop',
  'PHP',
  'React',
  'Redux',
  'Reduxjs & tooltit',
  'SASS',
  'SCSS',
  'SQL Server',
  'SVG',
  'UI/UX',
  'Diseño de interfaz de usuario',
  'Wordpress'
];

// CONSTANT
const getInitialValues = (user: UserList | null) => {
  const newUser: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: 0,
    departmentId: 0,
    active: true,
    daysToPasswordExpiration: 90,
    supportTypeIds: [],
    manager: null,
    subordinates: []
  };
  if (user) {
    return merge({}, newUser, user, {
      manager: user.manager || null,
      subordinates: user.subordinates || []
    });
  }
  return newUser;
};

const allStatus: StatusProps[] = [
  { value: 3, label: 'Rechazado' },
  { value: 1, label: 'Verificado' },
  { value: 2, label: 'Pendiente' }
];

// ==============================|| USER ADD / EDIT - FORM ||============================== //

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

export default function FormUserAdd({ user, closeModal }: { user: UserList | null; closeModal: () => void }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);
  const [level, setLevel] = useState<StringColorProps>();
// Obtener usuarios para manager y subordinates
const { users = [], usersLoading } = useGetUser();
  // API calls for roles and departments
  const { roles, rolesLoading } = useGetRoles();
  const { departments, departmentsLoading } = useGetDepartments();
  const { supportTypes, supportTypesLoading } = useGetSupportTypes();

  // Debug logs

  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(
    getImageUrl(`avatar-${user && user !== null && user?.avatar ? user.avatar : 1}.png`, ImagePath.USERS)
  );
  const isNewUser = !user;
  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    // El loading se controlará por las APIs de roles y departamentos
    setLoading(rolesLoading || departmentsLoading);
  }, [rolesLoading, departmentsLoading]);

  const UserSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('El nombre es obligatorio'),
    lastName: Yup.string().max(255).required('El apellido es obligatorio'),
    email: Yup.string()
      .max(255)
      .required('El correo electrónico es obligatorio')
      .email('Debe ser un correo válido')
      .test('domain', 'El correo debe ser del dominio charlotte.com.mx', (value) => !!value && value.endsWith('@charlotte.com.mx')),
    departmentId: Yup.number().min(1, 'El departamento es obligatorio').required('El departamento es obligatorio'),
    roleId: Yup.number().min(1, 'El rol es obligatorio').required('El rol es obligatorio'),
    active: Yup.boolean().required('El estado es obligatorio'),
    password: Yup.string().when('$isNewUser', {
      is: true,
      then: (schema) =>
        schema
          .required('La contraseña es obligatoria')
          .min(8, 'La contraseña debe tener al menos 8 caracteres')
          .matches(/[a-z]/, 'Debe contener al menos una minúscula')
          .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
          .matches(/[0-9]/, 'Debe contener al menos un número')
          .matches(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
      otherwise: (schema) =>
        schema
          .min(8, 'La contraseña debe tener al menos 8 caracteres')
          .matches(/[a-z]/, 'Debe contener al menos una minúscula')
          .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
          .matches(/[0-9]/, 'Debe contener al menos un número')
          .matches(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial')
    }),
    manager: Yup.mixed().nullable(),
    subordinates: Yup.array().of(Yup.mixed())
  });

  const [openAlert, setOpenAlert] = useState(false);

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

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(user!),
    validationSchema: UserSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Construir el objeto de usuario con solo los campos necesarios para el DTO
        const userData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          roleId: values.roleId,
          departmentId: values.departmentId,
          active: values.active,
          daysToPasswordExpiration: values.daysToPasswordExpiration,
          role: roles?.find((r: any) => r.id === values.roleId)?.name || '',
          managerId: values.manager ? values.manager.id : null,
          subordinateIds: Array.isArray(values.subordinates) ? values.subordinates.map((s: any) => s.id) : []
        };

        console.log('Submitting user data:', userData);

        if (user) {
          // Para actualización, incluir el ID
          const updateData = { ...userData, id: user.id };
          const result = await updateUser(user.id!, updateData);

          if (result.error || !result.success) {
            openSnackbar({
              open: true,
              message: result.error || 'Error al actualizar el usuario',
              variant: 'alert',
              alert: {
                color: 'error'
              }
            } as SnackbarProps);
            setSubmitting(false);
            return;
          }

          openSnackbar({
            open: true,
            message: result.message || 'Usuario actualizado correctamente.',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          } as SnackbarProps);
          // Asignar tipos de soporte si se seleccionaron
          if ((values as any).supportTypeIds && Array.isArray((values as any).supportTypeIds)) {
            await assignSupportTypes(user.id!, (values as any).supportTypeIds as number[]);
          }
          setSubmitting(false);
          closeModal();
        } else {
          // Para inserción, enviar solo los datos necesarios
          const result = await insertUser(userData);

          if (result.error || !result.success) {
            openSnackbar({
              open: true,
              message: result.error || 'Error al crear el usuario',
              variant: 'alert',
              alert: {
                color: 'error'
              }
            } as SnackbarProps);
            setSubmitting(false);
            return;
          }

          openSnackbar({
            open: true,
            message: result.message || 'Usuario agregado correctamente.',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          } as SnackbarProps);
          // Asignar tipos de soporte al usuario creado, si aplica
          if ((values as any).supportTypeIds && Array.isArray((values as any).supportTypeIds)) {
            const createdUserId = result.data?.id || (result.data && result.data.user && result.data.user.id);
            if (createdUserId) await assignSupportTypes(createdUserId, (values as any).supportTypeIds as number[]);
          }
          setSubmitting(false);
          closeModal();
        }
      } catch (error) {
        console.error('Error inesperado en onSubmit:', error);
        openSnackbar({
          open: true,
          message: 'Error inesperado. Por favor intente de nuevo.',
          variant: 'alert',
          alert: {
            color: 'error'
          }
        } as SnackbarProps);
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, handleBlur, handleChange, isSubmitting, getFieldProps, setFieldValue } = formik;

  // Función para generar y asignar contraseña segura
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setFieldValue('password', newPassword);
    changePassword(newPassword);
  };

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{user ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-firstName">Nombre</InputLabel>
                        <TextField
                          fullWidth
                          id="user-firstName"
                          placeholder="Ingrese el nombre"
                          {...getFieldProps('firstName')}
                          error={Boolean(touched.firstName && errors.firstName)}
                          helperText={touched.firstName && typeof errors.firstName === 'string' ? errors.firstName : undefined}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-lastName">Apellidos</InputLabel>
                        <TextField
                          fullWidth
                          id="user-lastName"
                          placeholder="Ingrese el apellido"
                          {...getFieldProps('lastName')}
                          error={Boolean(touched.lastName && errors.lastName)}
                          helperText={touched.lastName && typeof errors.lastName === 'string' ? errors.lastName : undefined}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-email">Correo electrónico</InputLabel>
                        <TextField
                          fullWidth
                          id="user-email"
                          placeholder="Ingrese el correo electrónico"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && typeof errors.email === 'string' ? errors.email : undefined}
                        />
                      </Stack>
                    </Grid>

                    {/* Campo para seleccionar el jefe (manager) */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-manager">Jefe directo</InputLabel>
                        <Autocomplete
                          id="user-manager"
                          options={users.filter((u: any) => !user || u.id !== user.id)}
                          getOptionLabel={(option: any) => option.name || `${option.firstName} ${option.lastName}`}
                          value={formik.values.manager || null}
                          onChange={(_, value) => setFieldValue('manager', value)}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          loading={usersLoading}
                          renderInput={(params) => <TextField {...params} placeholder="Selecciona un jefe" />}
                        />
                      </Stack>
                    </Grid>
                    {/* Campo para seleccionar subordinados */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-subordinates">Subordinados</InputLabel>
                        <Autocomplete
                          multiple
                          id="user-subordinates"
                          options={users.filter((u: any) => !user || u.id !== user.id)}
                          getOptionLabel={(option: any) => option.name || `${option.firstName} ${option.lastName}`}
                          value={formik.values.subordinates || []}
                          onChange={(_, value) => setFieldValue('subordinates', value)}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          loading={usersLoading}
                          renderInput={(params) => <TextField {...params} placeholder="Selecciona subordinados" />}
                        />
                      </Stack>
                    </Grid>
                    {/* Campo de tipos de soporte */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel>Tipos de soporte</InputLabel>
                        <Autocomplete
                          multiple
                          options={supportTypes || []}
                          getOptionLabel={(option: any) => option.name || option.label || ''}
                          defaultValue={user && (user as any).supportTypes ? (user as any).supportTypes : []}
                          onChange={(_, value) => {
                            const ids = value.map((v: any) => v.id);
                            setFieldValue('supportTypeIds', ids);
                          }}
                          renderTags={(value: any[], getTagProps) =>
                            value.map((option: any, index: number) => (
                              <Chip label={option.name || option.label} {...getTagProps({ index })} key={option.id} />
                            ))
                          }
                          renderInput={(params) => <TextField {...params} placeholder="Selecciona tipos de soporte" />}
                        />
                      </Stack>
                    </Grid>

                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-department">Departamento</InputLabel>
                        <Select
                          fullWidth
                          id="user-department"
                          value={getFieldProps('departmentId').value}
                          name="departmentId"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.departmentId && errors.departmentId)}
                          displayEmpty
                          disabled={departmentsLoading}
                        >
                          <MenuItem value={0} disabled>
                            <em>{departmentsLoading ? 'Cargando departamentos...' : 'Seleccione un departamento'}</em>
                          </MenuItem>
                          {(() => {
                            // console.log('Rendering departments:', departments, 'isArray:', Array.isArray(departments), 'length:', departments?.length);
                            return (
                              Array.isArray(departments) &&
                              departments.map((dept: any) => {
                                // console.log('Rendering department item:', dept);
                                return (
                                  <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </MenuItem>
                                );
                              })
                            );
                          })()}
                        </Select>
                        {touched.departmentId && typeof errors.departmentId === 'string' && (
                          <FormHelperText error>{errors.departmentId}</FormHelperText>
                        )}
                      </Stack>
                    </Grid>

                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <InputLabel htmlFor="password">Contraseña</InputLabel>
                          <Tooltip title="Generar contraseña segura">
                            <IconButton onClick={handleGeneratePassword} color="primary" size="small" sx={{ ml: 1 }}>
                              <Key size={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <OutlinedInput
                          fullWidth
                          error={Boolean(touched.password && errors.password)}
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={getFieldProps('password').value}
                          name="password"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            handleChange(e);
                            changePassword(e.target.value);
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="Mostrar u ocultar contraseña"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                color="secondary"
                              >
                                {showPassword ? <Eye /> : <EyeSlash />}
                              </IconButton>
                            </InputAdornment>
                          }
                          placeholder="******"
                          inputProps={{}}
                        />
                      </Stack>
                      {touched.password && typeof errors.password === 'string' && (
                        <FormHelperText error id="helper-text-password">
                          {errors.password}
                        </FormHelperText>
                      )}
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <Grid container spacing={2} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                          <Grid>
                            <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                          </Grid>
                          <Grid>
                            <Typography variant="subtitle1" sx={{ fontSize: '0.75rem' }}>
                              {level?.label}
                            </Typography>
                          </Grid>
                          <Grid sx={{ flexGrow: 1 }} />
                        </Grid>
                      </FormControl>
                    </Grid>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-role">Rol del Usuario</InputLabel>
                        <Select
                          fullWidth
                          id="user-role"
                          value={getFieldProps('roleId').value}
                          name="roleId"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.roleId && errors.roleId)}
                          displayEmpty
                          disabled={rolesLoading}
                        >
                          <MenuItem value={0} disabled>
                            <em>{rolesLoading ? 'Cargando roles...' : 'Seleccione un rol'}</em>
                          </MenuItem>
                          {(() => {
                            // console.log('Rendering roles:', roles, 'isArray:', Array.isArray(roles), 'length:', roles?.length);
                            return (
                              Array.isArray(roles) &&
                              roles.map((role: any) => {
                                // console.log('Rendering role item:', role);
                                return (
                                  <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                  </MenuItem>
                                );
                              })
                            );
                          })()}
                        </Select>
                        {touched.roleId && typeof errors.roleId === 'string' && <FormHelperText error>{errors.roleId}</FormHelperText>}
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-daysToPasswordExpiration">Días para expiración de contraseña</InputLabel>
                        <TextField
                          fullWidth
                          id="user-daysToPasswordExpiration"
                          type="number"
                          placeholder="Ingrese los días"
                          {...getFieldProps('daysToPasswordExpiration')}
                          error={Boolean(touched.daysToPasswordExpiration && errors.daysToPasswordExpiration)}
                          helperText={
                            touched.daysToPasswordExpiration && typeof errors.daysToPasswordExpiration === 'string'
                              ? errors.daysToPasswordExpiration
                              : undefined
                          }
                          inputProps={{ min: 1 }}
                          onChange={(e) => {
                            const value = Math.max(1, Number(e.target.value));
                            setFieldValue('daysToPasswordExpiration', value);
                          }}
                        />
                      </Stack>
                    </Grid>

                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-active">Estado del Usuario</InputLabel>
                        <FormControlLabel
                          control={
                            <Switch
                              id="user-active"
                              checked={getFieldProps('active').value}
                              onChange={(event) => {
                                setFieldValue('active', event.target.checked);
                              }}
                              color="primary"
                            />
                          }
                          label={getFieldProps('active').value ? 'Activo' : 'Inactivo'}
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              color: getFieldProps('active').value ? 'success.main' : 'error.main',
                              fontWeight: 'medium'
                            }
                          }}
                        />
                        {touched.active && typeof errors.active === 'string' && <FormHelperText error>{errors.active}</FormHelperText>}
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
                <Grid>
                  {user && (
                    <Tooltip title="Eliminar usuario" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <Trash variant="Bold" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                    <Button color="error" onClick={closeModal} disabled={isSubmitting}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                      {isSubmitting ? (user ? 'Actualizando...' : 'Creando...') : user ? 'Editar' : 'Agregar'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {user && <AlertUserDelete id={user.id!} title={user.firstName} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
}
