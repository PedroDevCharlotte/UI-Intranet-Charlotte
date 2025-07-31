import { useEffect, useState, ChangeEvent } from 'react';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
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

import { insertUser, updateUser } from 'api/user';
import { openSnackbar } from 'api/snackbar';
import { Gender } from 'config';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// assets
import { Camera, CloseCircle, Trash } from 'iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { UserList } from 'types/user';

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
  const newUser = {
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    age: 18,
    avatar: 1,
    gender: Gender.FEMALE,
    role: '',
    fatherName: '',
    orders: 0,
    progress: 50,
    status: 2,
    orderStatus: '',
    contact: '',
    country: '',
    location: '',
    about: '',
    skills: [],
    time: ['just now'],
    date: ''
  };

  if (user) {
    return merge({}, newUser, user);
  }

  return newUser;
};

const allStatus: StatusProps[] = [
  { value: 3, label: 'Rechazado' },
  { value: 1, label: 'Verificado' },
  { value: 2, label: 'Pendiente' }
];

// ==============================|| USER ADD / EDIT - FORM ||============================== //

export default function FormUserAdd({ user, closeModal }: { user: UserList | null; closeModal: () => void }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(
    getImageUrl(`avatar-${user && user !== null && user?.avatar ? user.avatar : 1}.png`, ImagePath.USERS)
  );

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const UserSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('El nombre es obligatorio'),
    lastName: Yup.string().max(255).required('El apellido es obligatorio'),
    email: Yup.string()
      .max(255)
      .required('El correo electrónico es obligatorio')
      .email('Debe ser un correo válido')
      .test(
        'domain',
        'El correo debe ser del dominio charlotte.com.mx',
        (value) => !!value && value.endsWith('@charlotte.com.mx')
      ),
    status: Yup.string().required('El estado es obligatorio'),
    location: Yup.string().max(500),
    about: Yup.string().max(500)
  });

  const [openAlert, setOpenAlert] = useState(false);

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
        let newUser: UserList = values;
        newUser.name = newUser.firstName + ' ' + newUser.lastName;

        if (user) {
          updateUser(newUser.id!, newUser).then((re) => {
            if (re.error) {
              openSnackbar({
                open: true,
                message: re.error,
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
              message: 'Usuario actualizado correctamente.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        } else {
          await insertUser(newUser).then((resp) => {
            if (resp.error) {
              openSnackbar({
                open: true,
                message: resp.error,
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
              message: 'Usuario agregado correctamente.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);
            setSubmitting(false);
            closeModal();
          });
        }
      } catch {}
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

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
            <DialogContent  sx={{ p: 2.5 }}>
              <Grid container spacing={2} >
               
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
                          helperText={touched.firstName && errors.firstName}
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
                          helperText={touched.lastName && errors.lastName}
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
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel htmlFor="user-skills">Rol/es Asignado/s</InputLabel>
                        <Autocomplete
                          multiple
                          fullWidth
                          id="user-skills"
                          options={skills}
                          {...getFieldProps('skills')}
                          getOptionLabel={(label) => label}
                          onChange={(event, newValue) => {
                            setFieldValue('skills', newValue);
                          }}
                          renderInput={(params) => <TextField {...params} name="skill" placeholder="Asignar Rol" />}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                variant="combined"
                                key={index}
                                label={option}
                                deleteIcon={<CloseCircle style={{ fontSize: '0.75rem' }} />}
                                sx={{ color: 'text.primary' }}
                              />
                            ))
                          }
                        />
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
                    <Button color="error" onClick={closeModal}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {user ? 'Editar' : 'Agregar'}
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
