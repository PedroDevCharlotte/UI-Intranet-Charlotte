import React, { useEffect, useState } from 'react';
import { useFormik, FormikProvider, Form } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import axiosServices, { fetcher } from 'utils/axios';

type Props = {
  initial?: any;
  onSave: (payload: any) => Promise<void> | void;
  onCancel: () => void;
};

export default function NonConformityForm({ initial = {}, onSave, onCancel }: Props) {
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [motiveOptions, setMotiveOptions] = useState<any[]>([]);

  // Example: list ids may vary; assuming codes exist in general-lists to identify
  const TYPE_LIST_ID = 'non-conformity-types'; // replace with actual list id or numeric id if needed
  const MOTIVE_LIST_ID = 'non-conformity-motives';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingOptions(true);
      try {
        // try code-based lists first
        const [typesRes, motivesRes] = await Promise.all([
          axiosServices.get(`/general-lists/by-code/${TYPE_LIST_ID}/options`).catch(() => axiosServices.get(`/general-lists/${TYPE_LIST_ID}/options`)),
          axiosServices.get(`/general-lists/by-code/${MOTIVE_LIST_ID}/options`).catch(() => axiosServices.get(`/general-lists/${MOTIVE_LIST_ID}/options`))
        ]);
        if (!mounted) return;
        setTypeOptions(typesRes?.data ?? []);
        setMotiveOptions(motivesRes?.data ?? []);
      } catch (e) {
        // fallback: empty
        setTypeOptions([]);
        setMotiveOptions([]);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const schema = Yup.object().shape({
    number: Yup.string().required('Número es requerido'),
    areaOrProcess: Yup.string().required('Área / Proceso es requerido'),
    category: Yup.string().nullable(),
    findingDescription: Yup.string().required('Descripción del hallazgo es requerida')
  });

  const formik = useFormik({
    initialValues: {
      number: initial.number ?? '',
      validFrom: initial.validFrom ?? '',
      validTo: initial.validTo ?? '',
      typeOptionId: initial.typeOptionId ?? null,
      otherType: initial.otherType ?? '',
      detectedAt: initial.detectedAt ?? '',
      areaOrProcess: initial.areaOrProcess ?? '',
      areaResponsibleId: initial.areaResponsibleId ?? null,
      classification: initial.classification ?? '',
      category: initial.category ?? '',
      motiveOptionId: initial.motiveOptionId ?? null,
      otherMotive: initial.otherMotive ?? '',
      findingDescription: initial.findingDescription ?? '',
      cause: initial.cause ?? '',
      participants: initial.participants ?? [],
      hasSimilarCases: !!initial.hasSimilarCases,
      similarCasesDetails: initial.similarCasesDetails ?? ''
    },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSave(values);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue } = formik;

  return (
    <FormikProvider value={formik}>
      <Form onSubmit={handleSubmit}>
        <Box sx={{ p: 2, width: 700 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Number"
                name="number"
                value={values.number}
                onChange={handleChange}
                error={Boolean(touched.number && errors.number)}
                helperText={touched.number && (errors.number as string)}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Valid From"
                name="validFrom"
                value={values.validFrom?.slice(0, 10) ?? ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Valid To"
                name="validTo"
                value={values.validTo?.slice(0, 10) ?? ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

      <Grid size={{ xs: 6 }}>
              <FormControl fullWidth error={Boolean(touched.typeOptionId && errors.typeOptionId)}>
                <InputLabel shrink>Type</InputLabel>
                {loadingOptions ? (
                  <CircularProgress size={20} />
                ) : (
                  <Select
                    name="typeOptionId"
                    value={values.typeOptionId ?? ''}
                    onChange={(e) => setFieldValue('typeOptionId', e.target.value || null)}
                    displayEmpty
                  >
                    <MenuItem value="">-- Select type --</MenuItem>
                    {typeOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.displayText ?? opt.value}
                      </MenuItem>
                    ))}
                  </Select>
                )}
        <FormHelperText>{touched.typeOptionId && (errors.typeOptionId as any)}</FormHelperText>
              </FormControl>
            </Grid>

      <Grid size={{ xs: 6 }}>
              <FormControl fullWidth error={Boolean(touched.motiveOptionId && errors.motiveOptionId)}>
                <InputLabel shrink>Motive</InputLabel>
                {loadingOptions ? (
                  <CircularProgress size={20} />
                ) : (
                  <Select
                    name="motiveOptionId"
                    value={values.motiveOptionId ?? ''}
                    onChange={(e) => setFieldValue('motiveOptionId', e.target.value || null)}
                    displayEmpty
                  >
                    <MenuItem value="">-- Select motive --</MenuItem>
                    {motiveOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.displayText ?? opt.value}
                      </MenuItem>
                    ))}
                  </Select>
                )}
        <FormHelperText>{touched.motiveOptionId && (errors.motiveOptionId as any)}</FormHelperText>
              </FormControl>
            </Grid>

      <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Finding Description"
                name="findingDescription"
                value={values.findingDescription}
                onChange={handleChange}
        error={Boolean(touched.findingDescription && errors.findingDescription)}
        helperText={touched.findingDescription && (errors.findingDescription as string)}
              />
            </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={() => onCancel()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Form>
    </FormikProvider>
  );
}
