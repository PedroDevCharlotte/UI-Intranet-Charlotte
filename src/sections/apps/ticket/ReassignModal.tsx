import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';

interface UserOption {
  id: number;
  label: string;
}

interface ReassignModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: UserOption) => void;
  userOptions: UserOption[];
  initialUser?: UserOption | null;
}

export default function ReassignModal({ open, onClose, onSubmit, userOptions, initialUser }: ReassignModalProps) {
  const formik = useFormik({
    initialValues: {
      user: initialUser || null,
    },
    validationSchema: Yup.object({
      user: Yup.object().nullable().required('Selecciona un usuario'),
    }),
    onSubmit: (values, { resetForm }) => {
      if (values.user) onSubmit(values.user);
      resetForm();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reasignar Ticket</DialogTitle>
      <FormikProvider value={formik}>
        <Form>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <InputLabel>Selecciona usuario</InputLabel>
              <Autocomplete
                options={userOptions}
                getOptionLabel={option => option.label}
                value={formik.values.user}
                onChange={(_, value) => formik.setFieldValue('user', value)}
                renderInput={params => (
                  <TextField {...params} label="Usuario" error={!!formik.errors.user && formik.touched.user} helperText={formik.touched.user && formik.errors.user}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="contained" type="submit">
              Reasignar
            </Button>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Dialog>
  );
}
