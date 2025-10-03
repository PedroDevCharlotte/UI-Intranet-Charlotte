import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams, useBlocker } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import Fab from '@mui/material/Fab';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Typography from '@mui/material/Typography';

// third-party
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import MainCard from 'components/MainCard';
import { useGetUser } from 'api/user';
import { 
  useGetNonConformities, 
  createNonConformity, 
  updateNonConformity, 
  getNonConformityById,
  createNonConformityWithFormData,
  getNextConsecutiveNumber,
  generateNonConformityPdf
} from '../../../api/nonConformities';
import PdfModal from '../../../components/PdfModal';
import { getListOptions } from '../../../api/generalLists';
import NonConformityTabGeneral from '../../../sections/apps/non-conformities/NonConformityTabGeneral';
import NonConformityTabActions from '../../../sections/apps/non-conformities/NonConformityTabActions';
import NonConformityTabFiveWhys from '../../../sections/apps/non-conformities/NonConformityTabFiveWhys';
import NonConformityTabWhyProblem from '../../../sections/apps/non-conformities/NonConformityTabWhyProblem';
import NonConformityTabWhyNotDetected from '../../../sections/apps/non-conformities/NonConformityTabWhyNotDetected';
import NonConformityTabFollowUp from '../../../sections/apps/non-conformities/NonConformityTabFollowUp';
import NonConformityTabRootCause from '../../../sections/apps/non-conformities/NonConformityTabRootCause';
import NonConformityTabReview from '../../../sections/apps/non-conformities/NonConformityTabReview';

// assets
import { DocumentText, ClipboardTick, SearchNormal, MessageQuestion, InfoCircle, Chart, Setting2, Eye, ArrowLeft, ArrowRight, TickCircle, MenuBoard, Save2, Warning2 } from 'iconsax-react';

// ==============================|| NON CONFORMITY - NEW STEPPER ||============================== //

export default function NewNonConformityStepper() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const ticketIdParam = searchParams.get('ticketId');

  const { users, usersLoading, usersError } = useGetUser();
  
  // Estado para manejar la pestaña activa
  const [activeTab, setActiveTab] = useState(0);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // Estado para el modal de PDF
  const [pdfModalData, setPdfModalData] = useState({
    open: false,
    url: null as string | null,
    title: '',
    fileName: 'documento.pdf'
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Configuración de tabs para el SpeedDial
  const speedDialActions = [
    { icon: <DocumentText size={20} />, name: 'Motivos y Clasificación', tabIndex: 0 },
    { icon: <ClipboardTick size={20} />, name: 'Causa y Plan de Acción', tabIndex: 1 },
    { icon: <Chart size={20} />, name: 'Seguimientos y Análisis', tabIndex: 2 },
    { icon: <SearchNormal size={20} />, name: 'Análisis de 5 Porqués', tabIndex: 3 },
    { icon: <MessageQuestion size={20} />, name: '¿Por qué tuvimos el problema?', tabIndex: 4 },
    { icon: <InfoCircle size={20} />, name: '¿Por qué no fue detectado?', tabIndex: 5 },
    { icon: <Setting2 size={20} />, name: 'Determinación Causa Raíz', tabIndex: 6 },
    { icon: <Eye size={20} />, name: 'Revisar e Imprimir', tabIndex: 7 }
  ];

  const handleSpeedDialAction = (tabIndex: number) => {
    handleTabChange(tabIndex);
    setSpeedDialOpen(false);
  };

  // Función para preparar el payload para la API
  const preparePayloadForApi = (values: any) => {
    return {
      number: values.number,
      validFrom: values.validFrom || null,
      validTo: values.validTo || null,
      typeOptionId: values.typeOptionId || null,
      otherType: values.otherType || null,
      createdAtDate: values.createdAtDate || null,
      detectedAt: values.detectedAt || null,
      closedAt: values.closedAt || null,
      areaOrProcess: values.areaOrProcess || null,
      areaResponsibleId: values.areaResponsibleId || null,
      classification: values.classification || null,
      category: values.category || null,
      motiveOptionId: values.motiveOptionId || null,
      otherMotive: values.otherMotive || null,
      findingDescription: values.findingDescription || null,
      cause: values.cause || null,
      investigationReference: values.investigationReference || null,
      observations: values.observations || null,
      reference: values.reference || null,
      participants: values.participants || [],
      hasSimilarCases: values.hasSimilarCases || false,
      similarCasesDetails: values.similarCasesDetails || null,
      rootCauseDetermination: values.rootCauseDetermination || null,
      // Mapear planes de acción
      actionPlans: values.actionPlans?.map((plan: any) => ({
        description: plan.description,
        commitmentDate: plan.commitmentDate,
        type: plan.type,
        responsibleOptionId: plan.responsibles?.[0]?.id || null
      })) || [],
      // Mapear seguimientos
      followUps: values.followUps?.map((followUp: any) => ({
        date: followUp.date,
        verifiedBy: followUp.verifiedBy?.id || null,
        justification: followUp.justification,
        wasEffective: followUp.wasEffective || false
      })) || [],
      // Mapear análisis de 5 porqués
      whyRecords: [
        ...Array.from({ length: 5 }, (_, i) => ({
          type: 'WHY_HAD_PROBLEM',
          questionNumber: i + 1,
          answer: values[`whyProblem${i + 1}`] || ''
        })).filter(record => record.answer),
        ...Array.from({ length: 5 }, (_, i) => ({
          type: 'WHY_NOT_DETECTED',
          questionNumber: i + 1,
          answer: values[`whyNotDetected${i + 1}`] || ''
        })).filter(record => record.answer)
      ]
    };
  };



  // Función para autoguardado
  const autoSave = async (values: any) => {
    if (!hasUnsavedChanges || !isEditing) return;
    
    setIsAutoSaving(true);
    try {
      if (nonConformityData?.id) {
        // Actualizar no conformidad existente
        const payload = preparePayloadForApi(values);
        await updateNonConformity(nonConformityData.id, payload);
        enqueueSnackbar('Borrador guardado automáticamente', { variant: 'success', autoHideDuration: 2000 });
      } else {
        // Guardar en localStorage como respaldo para nuevas no conformidades
        localStorage.setItem('nonConformityDraft', JSON.stringify({
          ...values,
          lastSaved: new Date().toISOString(),
          activeTab
        }));
        enqueueSnackbar('Borrador guardado localmente', { variant: 'info', autoHideDuration: 2000 });
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error en autoguardado:', error);
      enqueueSnackbar('Error al guardar borrador', { variant: 'error' });
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Función para manejar cambio de tab con autoguardado
  const handleTabChange = async (newTab: number) => {
    if (hasUnsavedChanges) {
      await autoSave(formik.values);
    }
    setActiveTab(newTab);
  };

  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [motiveOptions, setMotiveOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nonConformityData, setNonConformityData] = useState<any>(null);

  const { items: nonConformities, mutate: mutateNonConformities } = useGetNonConformities();

  // Efecto para detectar cambios no guardados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Bloquear navegación dentro de la aplicación React Router
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: any; nextLocation: any }) => {
        return hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname;
      },
      [hasUnsavedChanges]
    )
  );

  // Manejar el bloqueador de navegación
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowExitDialog(true);
    }
  }, [blocker.state]);

  // Efecto para cargar borrador guardado
  useEffect(() => {
    const savedDraft = localStorage.getItem('nonConformityDraft');
    if (savedDraft && id === 'new') {
      try {
        const draft = JSON.parse(savedDraft);
        const shouldLoadDraft = window.confirm(
          '¿Deseas cargar el borrador guardado anteriormente?'
        );
        
        if (shouldLoadDraft) {
          formik.setValues(draft);
          setActiveTab(draft.activeTab || 0);
          enqueueSnackbar('Borrador cargado exitosamente', { variant: 'success' });
        } else {
          localStorage.removeItem('nonConformityDraft');
        }
      } catch (error) {
        console.error('Error al cargar borrador:', error);
        localStorage.removeItem('nonConformityDraft');
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        // Cargar opciones de tipo usando el ID 6
        const typeRes = await getListOptions(6);
        if (mounted) setTypeOptions(typeRes.options || []);
        
        // Cargar opciones de motivo usando el ID 9
        const motiveRes = await getListOptions(9);
        if (mounted) setMotiveOptions(motiveRes.options || []);
        
        // Cargar datos si existe un ID (que no sea 'new')
        if (id && id !== 'new' && mounted) {
          await loadNonConformityData(id);
        } else if (id === 'new' && mounted) {
          // Generar número consecutivo para nueva no conformidad
          try {
            const nextNumber = await getNextConsecutiveNumber();
            formik.setFieldValue('number', nextNumber);
          } catch (error) {
            console.warn('No se pudo generar número automático:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching options o data:', error);
        if (mounted) handleApiResponse('Error cargando datos o listas', 'error');
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    loadOptions();
    return () => {
      mounted = false;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      otherType: '',
      actionPlans: [] as { id: string; description: string; commitmentDate: string; responsibles: { id: number; label: string }[]; type: 'principal' | 'secundaria' }[],
      followUps: [] as { id: string; date: string; verifiedBy: { id: number; label: string } | null; verifiedByOther: string; justification: string; wasEffective: boolean }[],
      // Campos de análisis de 5 porqués
      fiveWhysParticipants: [] as { id: number; label: string }[],
      fiveWhysDate: '',
      // Campos ¿Por qué tuvimos el problema?
      whyProblem1: '',
      whyProblem2: '',
      whyProblem3: '',
      whyProblem4: '',
      whyProblem5: '',
      // Campos ¿Por qué no fue detectado?
      whyNotDetected1: '',
      whyNotDetected2: '',
      whyNotDetected3: '',
      whyNotDetected4: '',
      whyNotDetected5: ''
    },
    validationSchema: Yup.object({
      number: Yup.string().required('El número es obligatorio'),
      description: Yup.string().required('La descripción es obligatoria'),
      typeOptionId: Yup.number().required('El tipo es obligatorio'),
      motiveOptionId: Yup.number().required('El motivo es obligatorio'),
      actionPlans: Yup.array()
        .min(1, 'Debe tener al menos un plan de acción')
        .test('has-principal', 'Debe existir al menos un plan de acción principal', function(value) {
          if (!value || value.length === 0) return false;
          return value.some((plan: any) => plan.type === 'principal');
        })
        .of(
          Yup.object({
            description: Yup.string().required('La descripción es obligatoria'),
            commitmentDate: Yup.string().required('La fecha compromiso es obligatoria'),
            responsibles: Yup.array().min(1, 'Debe seleccionar al menos un responsable'),
            type: Yup.string().oneOf(['principal', 'secundaria']).required('El tipo es obligatorio')
          })
        )
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const payload = preparePayloadForApi(values);
        
        if (isEditing && nonConformityData?.id) {
          // Actualizar no conformidad existente
          await updateNonConformity(nonConformityData.id, payload);
          enqueueSnackbar('No conformidad actualizada correctamente', { variant: 'success' });
        } else {
          // Crear nueva no conformidad
          if (values.attachment) {
            // Si hay archivo adjunto, usar FormData
            const formData = new FormData();
            
            // Agregar todos los campos al FormData
            Object.entries(payload).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                  formData.append(key, JSON.stringify(value));
                } else if (typeof value === 'object') {
                  formData.append(key, JSON.stringify(value));
                } else {
                  formData.append(key, String(value));
                }
              }
            });
            
            formData.append('attachment', values.attachment);
            await createNonConformityWithFormData(formData);
          } else {
            // Sin archivo adjunto, usar JSON
            await createNonConformity(payload);
          }
          enqueueSnackbar('No conformidad creada correctamente', { variant: 'success' });
        }
        
        // Actualizar la lista de no conformidades
        mutateNonConformities();
        
        // Limpiar borrador y navegar
        setHasUnsavedChanges(false);
        localStorage.removeItem('nonConformityDraft');
        navigate('/apps/non-conformities');
        
      } catch (error: any) {
        console.error('Error al guardar no conformidad:', error);
        
        // Manejar errores específicos de validación
        if (error.statusCode === 400 && error.message) {
          enqueueSnackbar(`Error de validación: ${error.message}`, { variant: 'error' });
        } else if (error.details && Array.isArray(error.details)) {
          // Mostrar errores de validación detallados
          error.details.forEach((detail: any) => {
            enqueueSnackbar(`${detail.field}: ${detail.message}`, { variant: 'error' });
          });
        } else {
          enqueueSnackbar(
            error.message || 'Error al guardar la no conformidad', 
            { variant: 'error' }
          );
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Función para cargar datos de una no conformidad existente
  const loadNonConformityData = useCallback(async (nonConformityId: string) => {
    setLoading(true);
    try {
      const data = await getNonConformityById(nonConformityId);
      setNonConformityData(data);
      setIsEditing(true);
      
      // Mapear los datos al formulario
      const mappedValues = {
        number: data.number || '',
        validFrom: data.validFrom || '',
        validTo: data.validTo || '',
        typeOptionId: data.typeOptionId || '',
        otherType: data.otherType || '',
        createdAtDate: data.createdAtDate || '',
        detectedAt: data.detectedAt || '',
        closedAt: data.closedAt || '',
        areaOrProcess: data.areaOrProcess || '',
        areaResponsibleId: data.areaResponsibleId || null,
        classification: data.classification || '',
        category: data.category || '',
        motiveOptionId: data.motiveOptionId || '',
        otherMotive: data.otherMotive || '',
        findingDescription: data.findingDescription || '',
        cause: data.cause || '',
        investigationReference: data.investigationReference || '',
        observations: data.observations || '',
        reference: data.reference || '',
        participants: data.participants || [],
        hasSimilarCases: data.hasSimilarCases || false,
        similarCasesDetails: data.similarCasesDetails || '',
        rootCauseDetermination: data.rootCauseDetermination || '',
        description: data.findingDescription || data.observations || '',
        attachment: null,
        // Mapear planes de acción
        actionPlans: data.actionPlans?.map((plan: any, index: number) => ({
          id: plan.id || `plan-${index}`,
          description: plan.description || '',
          commitmentDate: plan.commitmentDate || '',
          type: plan.type || 'principal',
          responsibles: plan.responsibleOptionId ? [{ id: plan.responsibleOptionId, label: 'Usuario' }] : []
        })) || [],
        // Mapear seguimientos
        followUps: data.followUps?.map((followUp: any, index: number) => ({
          id: followUp.id || `followup-${index}`,
          date: followUp.date || '',
          verifiedBy: followUp.verifiedBy ? { id: followUp.verifiedBy, label: 'Usuario' } : null,
          verifiedByOther: '',
          justification: followUp.justification || '',
          wasEffective: followUp.wasEffective || false
        })) || [],
        // Mapear análisis de 5 porqués
        fiveWhysParticipants: [],
        fiveWhysDate: '',
        // Campos ¿Por qué tuvimos el problema?
        whyProblem1: '',
        whyProblem2: '',
        whyProblem3: '',
        whyProblem4: '',
        whyProblem5: '',
        // Campos ¿Por qué no fue detectado?
        whyNotDetected1: '',
        whyNotDetected2: '',
        whyNotDetected3: '',
        whyNotDetected4: '',
        whyNotDetected5: ''
      };

      // Mapear registros de 5 porqués
      if (data.whyRecords && Array.isArray(data.whyRecords)) {
        data.whyRecords.forEach((record: any) => {
          if (record.type === 'WHY_HAD_PROBLEM' && record.questionNumber >= 1 && record.questionNumber <= 5) {
            const fieldName = `whyProblem${record.questionNumber}` as 'whyProblem1' | 'whyProblem2' | 'whyProblem3' | 'whyProblem4' | 'whyProblem5';
            mappedValues[fieldName] = record.answer || '';
          } else if (record.type === 'WHY_NOT_DETECTED' && record.questionNumber >= 1 && record.questionNumber <= 5) {
            const fieldName = `whyNotDetected${record.questionNumber}` as 'whyNotDetected1' | 'whyNotDetected2' | 'whyNotDetected3' | 'whyNotDetected4' | 'whyNotDetected5';
            mappedValues[fieldName] = record.answer || '';
          }
        });
      }

      formik.setValues(mappedValues);
      enqueueSnackbar('Datos cargados correctamente', { variant: 'success' });
    } catch (error) {
      console.error('Error cargando no conformidad:', error);
      enqueueSnackbar('Error al cargar los datos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [formik, enqueueSnackbar]);

  // Funciones para manejar el PDF
  const handlePrintPdf = async () => {
    if (!id) {
      enqueueSnackbar('No se puede generar PDF: No hay ID de no conformidad', { variant: 'error' });
      return;
    }

    try {
      enqueueSnackbar('Generando PDF...', { variant: 'info' });

      const pdfBlob = await generateNonConformityPdf(parseInt(id));
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setPdfModalData({
        open: true,
        url: pdfUrl,
        title: `No Conformidad ${formik.values.number}`,
        fileName: `no-conformidad-${formik.values.number}.pdf`
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      enqueueSnackbar('Error al generar el PDF', { variant: 'error' });
    }
  };

  const handleClosePdfModal = () => {
    if (pdfModalData.url) {
      URL.revokeObjectURL(pdfModalData.url);
    }
    setPdfModalData({
      open: false,
      url: null,
      title: '',
      fileName: 'documento.pdf'
    });
  };

  // Efecto para detectar cambios en el formulario
  useEffect(() => {
    // Verificar si hay cambios reales comparando con valores iniciales
    const hasChanges = JSON.stringify(formik.values) !== JSON.stringify(formik.initialValues);
    if (hasChanges && !hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  }, [formik.values]);

  // Efecto para autoguardado después de inactividad
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasUnsavedChanges && !formik.isSubmitting) {
        autoSave(formik.values);
      }
    }, 5000); // Autoguardar después de 5 segundos de inactividad

    return () => clearTimeout(timeoutId);
  }, [formik.values, hasUnsavedChanges]);

  console.log('Users data:', { users, usersLoading, usersError });
  
  const userOptions = users?.filter(u => u.id !== undefined && u.name !== undefined).map(u => ({ id: u.id as number, label: u.name as string })) ?? [];
  
  console.log('User options generated:', userOptions);

  // Efecto para manejar errores de carga de usuarios
  useEffect(() => {
    if (usersError) {
      console.error('Error loading users:', usersError);
      enqueueSnackbar('Error al cargar la lista de usuarios', { variant: 'error' });
    }
  }, [usersError, enqueueSnackbar]);

  // Función para renderizar el contenido de cada pestaña
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <NonConformityTabGeneral
            formik={formik}
            typeOptions={typeOptions}
            motiveOptions={motiveOptions}
            loadingOptions={loadingOptions}
          />
        );
      case 1:
        return (
          <NonConformityTabActions
            formik={formik}
            userOptions={userOptions}
          />
        );
      case 2:
        return (
          <NonConformityTabFollowUp
            formik={formik}
            userOptions={userOptions}
          />
        );
      case 3:
        return (
          <NonConformityTabFiveWhys
            formik={formik}
            userOptions={userOptions}
          />
        );
      case 4:
        return (
          <NonConformityTabWhyProblem
            formik={formik}
          />
        );
      case 5:
        return (
          <NonConformityTabWhyNotDetected
            formik={formik}
          />
        );
      case 6:
        return (
          <NonConformityTabRootCause
            formik={formik}
          />
        );
      case 7:
        return (
          <NonConformityTabReview
            values={formik.values}
            setFieldValue={formik.setFieldValue}
            nonConformityId={id ? parseInt(id) : undefined}
            onPrintPdf={handlePrintPdf}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {loading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1000 }} />}
      
      {/* Panel lateral con pestañas - Solo en desktop */}
      {!isMobile && (
        <Grid size={{ xs: 12, md: 3 }}>
          <MainCard>
            <Grid container spacing={6}>
              <Grid size={12}>
                <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
                  <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Typography variant="h5">
                      {id === 'new' 
                        ? 'Nueva No Conformidad' 
                        : `${isEditing ? 'Editar' : 'Ver'} No Conformidad - ${nonConformityData?.number || id}`
                      }
                    </Typography>
                    {ticketIdParam && (
                      <Typography color="secondary">Ticket ID: {ticketIdParam}</Typography>
                    )}
                  </Stack>
                  
                  {/* Indicador de estado de guardado - Desktop */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {isAutoSaving && (
                      <>
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="primary">
                          Guardando...
                        </Typography>
                      </>
                    )}
                    {hasUnsavedChanges && !isAutoSaving && (
                      <>
                        <Warning2 size={16} color="#ff9800" />
                        <Typography variant="caption" color="warning.main">
                          Cambios no guardados
                        </Typography>
                      </>
                    )}
                    {!hasUnsavedChanges && !isAutoSaving && (
                      <>
                        <Save2 size={16} color="#4caf50" />
                        <Typography variant="caption" color="success.main">
                          Guardado
                        </Typography>
                      </>
                    )}
                  </Box>
                </Stack>
              </Grid>
              <Grid size={12}>
              <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: 'secondary.main' } }}>
                <ListItemButton selected={activeTab === 0} onClick={() => handleTabChange(0)}>
                  <ListItemIcon>
                    <DocumentText size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Motivos y Clasificación" />
                </ListItemButton>
                <ListItemButton selected={activeTab === 1} onClick={() => handleTabChange(1)}>
                  <ListItemIcon>
                    <ClipboardTick size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Causa y Plan de Acción" />
                </ListItemButton>
                <ListItemButton selected={activeTab === 2} onClick={() => handleTabChange(2)}>
                  <ListItemIcon>
                    <Chart size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Seguimientos y Análisis" />
                </ListItemButton>
                <ListItemButton selected={activeTab === 3} onClick={() => handleTabChange(3)}>
                  <ListItemIcon>
                    <SearchNormal size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Análisis de 5 Porqués" />
                </ListItemButton>
                <ListItemButton selected={activeTab === 4} onClick={() => handleTabChange(4)}>
                  <ListItemIcon>
                    <MessageQuestion size={18} />
                  </ListItemIcon>
                  <ListItemText primary="¿Por qué tuvimos el problema?" />
                </ListItemButton>
                <ListItemButton selected={activeTab === 5} onClick={() => handleTabChange(5)}>
                  <ListItemIcon>
                    <InfoCircle size={18} />
                  </ListItemIcon>
                  <ListItemText primary="¿Por qué no fue detectado?" />
                </ListItemButton>
                <ListItemButton selected={activeTab === 6} onClick={() => handleTabChange(6)}>
                  <ListItemIcon>
                    <Setting2 size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Determinación Causa Raíz" />
                </ListItemButton>
                <ListItemButton selected={activeTab === 7} onClick={() => handleTabChange(7)}>
                  <ListItemIcon>
                    <Eye size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Revisar e Imprimir" />
                </ListItemButton>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      )}

      {/* Contenido principal del formulario */}
      <Grid size={{ xs: 12, md: isMobile ? 12 : 9 }}>
        <MainCard sx={{ mb: isMobile ? 10 : 0 }}>
          {/* Header para móvil */}
          {isMobile && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {id === 'new' 
                  ? 'Nueva No Conformidad' 
                  : `${isEditing ? 'Editar' : 'Ver'} No Conformidad - ${nonConformityData?.number || id}`
                }
              </Typography>
              {ticketIdParam && (
                <Typography color="secondary" variant="body2">
                  Ticket ID: {ticketIdParam}
                </Typography>
              )}
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                {speedDialActions[activeTab].name}
              </Typography>
              
              {/* Indicador de estado de guardado */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 1 }}>
                {isAutoSaving && (
                  <>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="primary">
                      Guardando...
                    </Typography>
                  </>
                )}
                {hasUnsavedChanges && !isAutoSaving && (
                  <>
                    <Warning2 size={16} color="#ff9800" />
                    <Typography variant="caption" color="warning.main">
                      Cambios no guardados
                    </Typography>
                  </>
                )}
                {!hasUnsavedChanges && !isAutoSaving && (
                  <>
                    <Save2 size={16} color="#4caf50" />
                    <Typography variant="caption" color="success.main">
                      Guardado
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}
          <form onSubmit={formik.handleSubmit}>
            {renderTabContent()}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2 }}>
                {activeTab > 0 && (
                  isMobile ? (
                    <Tooltip title="Anterior" placement="top">
                      <IconButton 
                        onClick={() => handleTabChange(activeTab - 1)}
                        sx={{ 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { 
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <ArrowLeft size={20} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Button variant="outlined" onClick={() => handleTabChange(activeTab - 1)}>
                      Anterior
                    </Button>
                  )
                )}
                {activeTab < 7 && (
                  isMobile ? (
                    <Tooltip title="Siguiente" placement="top">
                      <IconButton 
                        onClick={() => handleTabChange(activeTab + 1)}
                        sx={{ 
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': { 
                            bgcolor: 'primary.dark'
                          }
                        }}
                      >
                        <ArrowRight size={20} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Button variant="contained" onClick={() => handleTabChange(activeTab + 1)}>
                      Siguiente
                    </Button>
                  )
                )}
              </Box>
              {activeTab === 7 && (
                isMobile ? (
                  <Tooltip title={
                    formik.isSubmitting 
                      ? 'Guardando...' 
                      : isEditing 
                        ? 'Actualizar No Conformidad' 
                        : 'Crear No Conformidad'
                  } placement="top">
                    <IconButton 
                      type="submit" 
                      disabled={formik.isSubmitting}
                      sx={{ 
                        bgcolor: 'success.main',
                        color: 'success.contrastText',
                        '&:hover': { 
                          bgcolor: 'success.dark'
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground'
                        }
                      }}
                    >
                      <TickCircle size={20} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Button variant="contained" type="submit" disabled={formik.isSubmitting}>
                    {formik.isSubmitting 
                      ? 'Guardando...' 
                      : isEditing 
                        ? 'Actualizar No Conformidad' 
                        : 'Crear No Conformidad'
                    }
                  </Button>
                )
              )}
            </Box>
          </form>
        </MainCard>
      </Grid>

      {/* SpeedDial flotante para navegación de tabs */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Navegación de tabs"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            left: 24,
            zIndex: 1300,
            '& .MuiSpeedDial-fab': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
              }
            },
            '& .MuiSpeedDialAction-fab': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid',
              borderColor: 'divider'
            }
          }}
          icon={
            <Box sx={{ position: 'relative' }}>
              <MenuBoard size={24} />
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {activeTab + 1}
              </Box>
            </Box>
          }
          openIcon={<MenuBoard size={24} style={{ transform: 'rotate(45deg)' }} />}
          open={speedDialOpen}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          direction="up"
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.tabIndex}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipPlacement="right"
              onClick={() => handleSpeedDialAction(action.tabIndex)}
              sx={{
                bgcolor: activeTab === action.tabIndex ? 'primary.main' : 'background.paper',
                color: activeTab === action.tabIndex ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: activeTab === action.tabIndex ? 'primary.dark' : 'primary.light',
                  color: 'primary.contrastText',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* Diálogo de confirmación para salir */}
      <Dialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        aria-labelledby="exit-dialog-title"
        aria-describedby="exit-dialog-description"
      >
        <DialogTitle id="exit-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning2 size={24} color="#ff9800" />
            Cambios no guardados
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="exit-dialog-description">
            Tienes cambios no guardados. ¿Qué deseas hacer?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button 
            onClick={() => {
              setShowExitDialog(false);
              if (blocker.state === 'blocked') {
                blocker.reset();
              }
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              setHasUnsavedChanges(false);
              localStorage.removeItem('nonConformityDraft');
              setShowExitDialog(false);
              if (blocker.state === 'blocked') {
                blocker.proceed();
              } else {
                navigate('/apps/non-conformities');
              }
            }}
            variant="outlined"
            color="error"
          >
            Salir sin guardar
          </Button>
          <Button 
            onClick={async () => {
              await autoSave(formik.values);
              setShowExitDialog(false);
              if (blocker.state === 'blocked') {
                blocker.proceed();
              } else {
                navigate('/apps/non-conformities');
              }
            }}
            variant="contained"
            startIcon={<Save2 size={16} />}
          >
            Guardar y salir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para mostrar el PDF */}
      <PdfModal
        open={pdfModalData.open}
        onClose={handleClosePdfModal}
        pdfUrl={pdfModalData.url}
        title={pdfModalData.title}
        fileName={pdfModalData.fileName}
      />
    </Grid>
  );
}
