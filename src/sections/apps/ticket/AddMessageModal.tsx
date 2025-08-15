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

type ParticipantOption = { id: number; label: string };

interface AddMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (content: string, files: any[], participants: ParticipantOption[]) => void;
  participantes: ParticipantOption[];
}

export default function AddMessageModal({ open, onClose, onSend, participantes }: AddMessageModalProps) {
  const { users } = useGetUser();
  const userOptions = users.map(user => ({ id: user.id || 0, label: `${user.firstName} ${user.lastName}` }));

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
    onSubmit: (values, { resetForm }) => {
      onSend(values.content, values.files, values.participants);
      resetForm();
      onClose();
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
