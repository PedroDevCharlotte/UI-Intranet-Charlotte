import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import ReactQuill from 'react-quill-new';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';

interface RichTextModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  title: string;
  label?: string;
  submitText?: string;
  initialContent?: string;
  idTicket: number;
}

export default function RichTextModal({ open, onClose, onSubmit, title, label = 'Comentario', submitText = 'Confirmar', initialContent = '', idTicket}: RichTextModalProps) {
  const formik = useFormik({
    initialValues: {
      content: initialContent || '',
    },
    validationSchema: Yup.object({
      content: Yup.string().required('Este campo es obligatorio'),
    }),
    onSubmit: (values, { resetForm }) => {
      

      onSubmit(values.content);
      resetForm();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <FormikProvider value={formik}>
        <Form>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <InputLabel>{label} *</InputLabel>
              <ReactQuill
                theme="snow"
                value={formik.values.content}
                onChange={value => formik.setFieldValue('content', value)}
              />
              {formik.touched.content && formik.errors.content && (
                <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.content}</span>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="contained" type="submit">
              {submitText}
            </Button>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Dialog>
  );
}
