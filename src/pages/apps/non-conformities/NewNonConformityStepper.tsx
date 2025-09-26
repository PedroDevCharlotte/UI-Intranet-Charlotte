import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NonConformityTabGeneral from './NonConformityTabGeneral';
import NonConformityTabActions from './NonConformityTabActions';
import NonConformityTabReview from './NonConformityTabReview';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import { mutate } from 'swr';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import axiosServices from '../../../utils/axios';
import { useGetUser } from 'api/user';
import { useGetNonConformities, createNonConformityWithFormData, getNonConformityById } from '../../../api/nonConformities';
import { getListOptions, getListOptionsByCode } from '../../../api/generalLists';

const steps = ['Motivos y Clasificación', 'Planes de Acción', 'Revisar y Crear'];

export default function NewNonConformityStepper() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId');

  const { users } = useGetUser();

  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [motiveOptions, setMotiveOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const { items: nonConformities } = useGetNonConformities();

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        // Cargar opciones de tipo usando el ID 6
        const typeRes = await getListOptions(6);
        setTypeOptions(typeRes.options || []);
        // Cargar opciones de motivo usando el ID 9
        const motiveRes = await getListOptions(9);
        setMotiveOptions(motiveRes.options || []);
        // Precargar datos si existe un ticketIdParam
        if (ticketIdParam) {
          const nonConformity = nonConformities.find(item => item.ticketId === ticketIdParam);
          if (nonConformity) {
            formik.setValues({
              number: nonConformity.number || '',
              description: nonConformity.description || '',
              findingDescription: nonConformity.findingDescription || '',
              areaOrProcess: nonConformity.areaOrProcess || '',
              detectedAt: nonConformity.detectedAt || '',
              validFrom: nonConformity.validFrom || '',
              validTo: nonConformity.validTo || '',
              typeOptionId: nonConformity.typeOptionId || '',
              motiveOptionId: nonConformity.motiveOptionId || '',
              areaResponsibleId: nonConformity.areaResponsibleId || null,
              hasSimilarCases: nonConformity.hasSimilarCases || false,
              similarCasesDetails: nonConformity.similarCasesDetails || '',
              rootCauseDetermination: nonConformity.rootCauseDetermination || '',
              observations: nonConformity.observations || '',
              reference: nonConformity.reference || '',
              closedAt: nonConformity.closedAt || '',
              otherType: nonConformity.otherType || '',
              attachment: null,
              otherMotive: nonConformity.otherMotive || '',
              cause: nonConformity.cause || '',
              investigationReference: nonConformity.investigationReference || '',
              classification: nonConformity.classification || '',
              category: nonConformity.category || '',
              participants: Array.isArray(nonConformity.participants) ? nonConformity.participants : [],
            });
          }
        }
      } catch (error) {
        console.error('Error fetching options o data:', error);
        handleApiResponse('Error cargando datos o listas', 'error');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
    return () => {
      mounted = false;
    };
  }, [ticketIdParam, nonConformities]);

  const handleApiResponse = (message: string, variant: 'success' | 'error' | 'info') => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
    });
  };

  const formik = useFormik({
    initialValues: {
      number: '',
      description: '',
      validFrom: '',
      validTo: '',
      detectedAt: '',
      closedAt: '',
      typeOptionId: '',
      motiveOptionId: '',
      areaResponsibleId: null,
      hasSimilarCases: false,
      similarCasesDetails: '',
      rootCauseDetermination: '',
      observations: '',
      reference: '',
      classification: '',
      category: '',
      participants: [] as { id: number; label: string }[],
      otherMotive: '',
      cause: '',
      investigationReference: '',
      findingDescription: '',
      areaOrProcess: '',
      attachment: null as File | null,
      otherType: ''
    },
    validationSchema: Yup.object({
      number: Yup.string().required('El número es obligatorio'),
      description: Yup.string().required('La descripción es obligatoria'),
      typeOptionId: Yup.number().required('El tipo es obligatorio'),
      motiveOptionId: Yup.number().required('El motivo es obligatorio')
    }),
    onSubmit: (values, { setSubmitting }) => {
      // Aquí va la lógica de submit, por ahora solo simula
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        enqueueSnackbar('No conformidad creada correctamente', { variant: 'success' });
        navigate('/apps/non-conformities');
      }, 1000);
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      {loading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1000 }} />}
      <Typography variant="h5" sx={{ mb: 2 }}>Nuevo - No Conformidad</Typography>

      {/* Tabs con componentes separados y navegación */}
      <form onSubmit={formik.handleSubmit}>
        <Box>
          {activeTab === 0 && (
            <NonConformityTabGeneral
              formik={formik}
              typeOptions={typeOptions}
              motiveOptions={motiveOptions}
              loadingOptions={loadingOptions}
            />
          )}
          {activeTab === 1 && (
            <NonConformityTabActions
              formik={formik}
              userOptions={users?.filter(u => u.id !== undefined && u.name !== undefined).map(u => ({ id: u.id as number, label: u.name as string })) ?? []}
            />
          )}
          {activeTab === 2 && (
            <NonConformityTabReview
              values={formik.values}
              setFieldValue={formik.setFieldValue}
            />
          )}
        </Box>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {activeTab > 0 && (
            <Button sx={{ mr: 1 }} onClick={() => setActiveTab((s) => s - 1)} type="button">Atrás</Button>
          )}
          {activeTab < 2 ? (
            <Button variant="contained" onClick={() => setActiveTab((s) => Math.min(s + 1, 2))} type="button">Siguiente</Button>
          ) : (
            <Button variant="contained" type="submit" disabled={formik.isSubmitting}>{formik.isSubmitting ? 'Guardando...' : 'Crear'}</Button>
          )}
        </Box>
      </form>
    </Box>
  );
}
