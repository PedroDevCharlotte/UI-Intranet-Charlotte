import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import MultiFileUpload from 'components/third-party/dropzone/MultiFile';
import ReactQuill from 'react-quill-new';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { useGetUser } from 'api/user';
import { useIntl } from 'react-intl';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { createMessage } from 'api/ticket';

type ParticipantOption = { id: number; label: string };

interface AddMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (content: string, files: any[], participants: ParticipantOption[]) => void;
  participantes: ParticipantOption[];
  idTicket: number;
}

export default function AddMessageModal({ open, onClose, onSend, participantes, idTicket }: AddMessageModalProps) {
  const { users } = useGetUser();
  const userOptions = users.map(user => ({ id: user.id || 0, label: `${user.firstName} ${user.lastName}` }));
  const intl = useIntl();

    const initialValues = (participantes: ParticipantOption[]) => {
        let valueInitial = {
      content: '',
      files: [] as any[],
      participants: participantes || [],
    }


    return valueInitial;
};

  const formik = useFormik({
    initialValues: initialValues(participantes),
    validationSchema: Yup.object({
      content: Yup.string().required('El mensaje es obligatorio'),
      // files: Yup.array(),
      // participants: Yup.array(),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log('Submitting values:', values);
      const formData = new FormData();
      formData.append('content', values.content);
      values.files.forEach((file: File, idx: number) => {
        formData.append('files', file, file.name);
      });
      values.participants.forEach((participant: ParticipantOption) => {
        formData.append('participants', JSON.stringify(participant));
      });
      try {
        const resp = await createMessage(formData, idTicket);

        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'ticket-created-successfully' }),
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        // si se desea puede enviarse la respuesta al onSend
        onSend(values.content, values.files, values.participants);
        resetForm();
        onClose();
      } catch (error: any) {
        console.error('Error submitting form:', error);
        const message = (error && error.message) ? error.message : String(error ?? 'Error submitting message');
        openSnackbar({
          open: true,
          message,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nuevo Mensaje</DialogTitle>
      <FormikProvider value={formik}>
        <Form>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <InputLabel>Mensaje *</InputLabel>
              <ReactQuill
                theme="snow"
                value={formik.values.content}
                onChange={value => formik.setFieldValue('content', value)}
              />
              {formik.touched.content && formik.errors.content && (
                <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.content}</span>
              )}
              <InputLabel>Adjuntar archivos</InputLabel>
              <MultiFileUpload
                files={formik.values.files}
                setFieldValue={(_, value) => formik.setFieldValue('files', value)}
              />
              <InputLabel>Participantes</InputLabel>
              <Autocomplete
                multiple
                options={userOptions}
                value={formik.values.participants}
                onChange={(_, value) =>{
                    const uniqueParticipants = value.filter(
                        (option, index, self) => self.findIndex(o => o.id === option.id) === index
                    );
                     formik.setFieldValue('participants', uniqueParticipants)}}
                renderInput={(params) => <TextField {...params} label="Selecciona participantes" />}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="contained" type="submit">
              Enviar
            </Button>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Dialog>
  );
}
