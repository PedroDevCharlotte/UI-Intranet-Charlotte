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
import { useGetListOptions, NC_LIST_IDS } from 'api/generalLists';
import axiosServices from 'utils/axios';

type Props = {
  initial?: any;
  onSave: (payload: any) => Promise<void> | void;
  onCancel: () => void;
};

export default function NonConformityForm({ initial = {}, onSave, onCancel }: Props) {
  // Usar hooks para obtener las opciones de las listas
  const { options: typeOptions, loading: loadingTypes } = useGetListOptions(NC_LIST_IDS.TYPES);
  const { options: areaOptions, loading: loadingAreas } = useGetListOptions(NC_LIST_IDS.AREAS);
  const { options: statusOptions, loading: loadingStatus } = useGetListOptions(NC_LIST_IDS.STATUS);

  const loadingOptions = loadingTypes || loadingAreas || loadingStatus;

  const schema = Yup.object().shape({
    number: Yup.string().required('Número es requerido'),
    typeOptionId: Yup.number().nullable().required('Tipo es requerido'),
    areaOptionId: Yup.number().nullable().required('Área / Proceso es requerido'),
    statusOptionId: Yup.number().nullable().required('Estado es requerido'),
    category: Yup.string().nullable(),
    findingDescription: Yup.string().required('Descripción del hallazgo es requerida')
  });

  const formik = useFormik({
    initialValues: {
      number: initial.number ?? '',
      validFrom: initial.validFrom ?? '',
      validTo: initial.validTo ?? '',
      typeOptionId: initial.typeOptionId ?? null,
      areaOptionId: initial.areaOptionId ?? null,
      statusOptionId: initial.statusOptionId ?? null,
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
              <FormControl fullWidth error={Boolean(touched.areaOptionId && errors.areaOptionId)}>
                <InputLabel shrink>Área / Proceso</InputLabel>
                {loadingOptions ? (
                  <CircularProgress size={20} />
                ) : (
                  <Select
                    name="areaOptionId"
                    value={values.areaOptionId ?? ''}
                    onChange={(e) => setFieldValue('areaOptionId', e.target.value || null)}
                    displayEmpty
                  >
                    <MenuItem value="">-- Seleccionar área --</MenuItem>
                    {areaOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.displayText ?? opt.value}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <FormHelperText>{touched.areaOptionId && (errors.areaOptionId as any)}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth error={Boolean(touched.statusOptionId && errors.statusOptionId)}>
                <InputLabel shrink>Estado</InputLabel>
                {loadingOptions ? (
                  <CircularProgress size={20} />
                ) : (
                  <Select
                    name="statusOptionId"
                    value={values.statusOptionId ?? ''}
                    onChange={(e) => setFieldValue('statusOptionId', e.target.value || null)}
                    displayEmpty
                  >
                    <MenuItem value="">-- Seleccionar estado --</MenuItem>
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id} sx={{ 
                        '&::before': {
                          content: '""',
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: opt.color || '#ccc',
                          marginRight: 1
                        }
                      }}>
                        {opt.displayText ?? opt.value}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <FormHelperText>{touched.statusOptionId && (errors.statusOptionId as any)}</FormHelperText>
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
