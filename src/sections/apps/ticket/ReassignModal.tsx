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
import { reassignTechnician } from 'api/ticket';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface UserOption {
  id: number;
  label: string;
}

interface ReassignModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: number) => void;
  userOptions: UserOption[];
  initialUser?: number | null;
  ticketId: number;
}

export default function ReassignModal({ open, onClose, onSubmit, userOptions, initialUser, ticketId }: ReassignModalProps) {
  const formik = useFormik({
    initialValues: {
      user: 0 || null,
      idticket: ticketId
    },
    validationSchema: Yup.object({
      user: Yup.number().required('Selecciona un usuario')
    }),
    onSubmit: (values, { resetForm }) => {
      console.log('Reassigning ticket to user:', values.user);
      if (!values.user) {
        return;
      }

      const updateAssignTo = reassignTechnician(ticketId, values.user || 0);

      updateAssignTo
        .then((res) => {
          if (res && res.id && res.assignee) {
            const assigneeName = `${res.assignee.firstName} ${res.assignee.lastName}`;
            // Usar openSnackbar para mostrar la notificación de éxito o error con la estructura solicitada
            if (res && res.id && res.assignee) {
              const assigneeName = `${res.assignee.firstName} ${res.assignee.lastName}`;
              openSnackbar({
                open: true,
                message: `Ticket reasignado correctamente a ${assigneeName}`,
                variant: 'alert',
                alert: {
                  color: 'success'
                }
              } as SnackbarProps);
            } else {
              openSnackbar({
                open: true,
                message: 'Error al reasignar el ticket',
                variant: 'alert',
                alert: {
                  color: 'error'
                }
              } as SnackbarProps);
            }
          }
        })
        .catch(() => {
          openSnackbar({
            open: true,
            message: 'Error al reasignar el ticket',
            variant: 'alert',
            alert: {
              color: 'error'
            }
          } as SnackbarProps);
        });
      onSubmit(values.user);
      resetForm();
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reasignar Ticket</DialogTitle>
      <FormikProvider value={formik}>
        <Form>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <InputLabel htmlFor="user-select">Selecciona usuario</InputLabel>
              <TextField
                select
                id="user-select"
                label="Usuario"
                value={formik.values.user ? formik.values.user : ''}
                onChange={(e) => {
                  formik.setFieldValue('user', e.target.value);
                }}
                error={!!formik.errors.user && formik.touched.user}
                helperText={formik.touched.user && formik.errors.user}
              >
                <option value="" disabled>
                  Selecciona un usuario
                </option>
                {userOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </TextField>
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
