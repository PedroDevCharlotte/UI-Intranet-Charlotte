import React, { useEffect, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
// kept UI simple to avoid adding new icon dependencies
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import { useDropzone } from 'react-dropzone';
import { createBanner, updateBanner, getBannerById } from 'api/banners';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import * as Yup from 'yup';

type Props = {
  open: boolean;
  onClose: () => void;
  bannerId?: number | null;
  onSaved?: () => void;
};

export default function BannerModal({ open, onClose, bannerId, onSaved }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (bannerId) {
      getBannerById(Number(bannerId)).then((data) => {
        formik.setValues({
          title: data.title || '',
          description: data.description || data.subtitle || '',
          link: data.link || '',
          startDate: data.startDate ? String(data.startDate) : '',
          endDate: data.endDate ? String(data.endDate) : '',
          status: data.status === undefined ? true : Boolean(data.status),
          order: data.order || 0,
          image: null
        });
        setPreview(data.imageUrl || null);
      });
    } else {
      formik.resetForm();
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      formik.setFieldValue('image', file);
      const reader = new FileReader();
      reader.onload = () => setPreview(String(reader.result));
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  const validationSchema = Yup.object().shape({
    title: Yup.string().notRequired(),
    description: Yup.string().notRequired(),
    link: Yup.string()
      .url('URL inválida')
      .nullable()
      .notRequired()
      .test('empty-or-url', 'URL inválida', (value) => !value || value.trim() === '' || Yup.string().url().isValidSync(value)),
    startDate: Yup.string()
      .nullable()
      .notRequired()
      .test('valid-date', 'Fecha inválida', (value) => !value || !isNaN(Date.parse(value))),
    endDate: Yup.string()
      .nullable()
      .notRequired()
      .test('valid-date', 'Fecha inválida', (value) => !value || !isNaN(Date.parse(value)))
      .test('end-after-start', 'La fecha de finalización debe ser mayor o igual a la fecha de inicio', function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(startDate) <= new Date(value);
      }),
    status: Yup.boolean(),
    order: Yup.number(),
    image: Yup.mixed()
      .nullable()
      .when([], {
        is: () => !bannerId,
        then: (schema) => schema.required('Imagen requerida'),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

  const formik = useFormik({
    initialValues: { title: '', description: '', link: '', startDate: '', endDate: '', status: true, order: 0, image: null as File | null },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('link', values.link || '');
        formData.append('startDate', values.startDate || '');
        formData.append('endDate', values.endDate || '');
        formData.append('status', String(values.status ? 'active' : 'inactive'));
        formData.append('order', String(values.order));
        if (values.image) formData.append('image', values.image);

        if (bannerId) {
          await updateBanner(Number(bannerId), formData);
        } else {
          await createBanner(formData);
        }

        onSaved && onSaved();
        onClose();
        openSnackbar({ open: true, message: 'Banner guardado', anchorOrigin: { vertical: 'top', horizontal: 'right' }, variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
      } catch {
        openSnackbar({ open: true, message: 'Error guardando banner', anchorOrigin: { vertical: 'top', horizontal: 'right' }, variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
      }
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{bannerId ? 'Editar banner' : 'Nuevo banner'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Título" name="title" value={formik.values.title} onChange={formik.handleChange} sx={{ mt: 1 }} error={Boolean(formik.touched.title && formik.errors.title)} helperText={formik.touched.title && formik.errors.title} />
          <TextField fullWidth label="Descripción" name="description" value={formik.values.description} onChange={formik.handleChange} sx={{ mt: 2 }} multiline minRows={3} />
          <TextField fullWidth label="URL de destino" name="link" value={formik.values.link} onChange={formik.handleChange} sx={{ mt: 2 }} error={Boolean(formik.touched.link && formik.errors.link)} helperText={formik.touched.link && formik.errors.link} />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Fecha inicio"
              name="startDate"
              type="date"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
              error={Boolean(formik.touched.startDate && formik.errors.startDate)}
              helperText={formik.touched.startDate && formik.errors.startDate}
            />
            <TextField
              label="Fecha final"
              name="endDate"
              type="date"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
              error={Boolean(formik.touched.endDate && formik.errors.endDate)}
              helperText={formik.touched.endDate && formik.errors.endDate}
            />
          </Stack>

          <FormControlLabel
            control={<Switch checked={Boolean(formik.values.status)} onChange={(e) => formik.setFieldValue('status', e.target.checked)} name="status" color="primary" />}
            label={formik.values.status ? 'Activo' : 'Inactivo'}
            sx={{ mt: 2 }}
          />

          <TextField fullWidth label="Orden" name="order" type="number" value={formik.values.order} onChange={formik.handleChange} sx={{ mt: 2 }} />

          <Box sx={{ mt: 2 }}>
            <div
              {...getRootProps()}
              style={{
                border: `1px dashed ${formik.touched.image && formik.errors.image ? '#d32f2f' : 'rgba(0,0,0,0.2)'}`,
                padding: 12,
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography>Drop the image here ...</Typography>
              ) : (
                <Typography>{preview ? 'Cambiar imagen' : 'Arrastra o selecciona una imagen'}</Typography>
              )}
            </div>
            {formik.touched.image && formik.errors.image && (
              <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                {formik.errors.image}
              </Typography>
            )}
            {preview && (
              <Box component="img" src={preview} alt="preview" sx={{ width: '100%', mt: 2, maxHeight: 240, objectFit: 'contain' }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" type="submit">
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
