import { useState, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useFormik, Form, FormikProvider } from 'formik';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';

import * as Yup from 'yup';

// project-imports
import IconButton from 'components/@extended/IconButton';
import DynamicFieldComponent from 'components/@extended/DynamicField';
import { openSnackbar } from 'api/snackbar';

// types
import { SnackbarProps } from 'types/snackbar';
import { DynamicField } from 'types/ticket';

// assets
import { CloseCircle } from 'iconsax-react';

// Config
import { DropzopType } from 'config';
import { useGetTicketTypes, useGetDynamicFields, insertTicket } from 'api/ticket';
import { useGetUser, useGetUserMaster } from 'api/user';
import { OutlinedInput } from '@mui/material';
import JWTContext from 'contexts/JWTContext';
import useAuth from 'hooks/useAuth';

// ==============================|| ADD TICKET MODAL ||============================== //

interface AddTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: any) => void;
}

interface TicketForm {
  subject: string;
  description: string;
  ticketType: string;
  files?: File[];
  employeeRelated: string[];
  dynamicFields?: { [key: string]: any };
}

const AddTicketModal = ({ open, onClose, onSubmit }: AddTicketModalProps) => {
  const intl = useIntl();

  const { ticketTypes, ticketTypesLoading, ticketTypesError } = useGetTicketTypes(true);
  const { users } = useGetUser();
  const { user: currentUser } = useAuth();
  // State for selected ticket type ID
  const [selectedTicketTypeCode, setSelectedTicketTypeCode] = useState<string | null>(null);

  // Get dynamic fields based on selected ticket type ID
  const { dynamicFields, dynamicFieldsLoading, dynamicFieldsError } = useGetDynamicFields(selectedTicketTypeCode);

  // Create dynamic validation schema
  const validationSchema = useMemo(() => {
    let schema = Yup.object({
      subject: Yup.string()
        .required(intl.formatMessage({ id: 'subject-required' }))
        .min(5, intl.formatMessage({ id: 'subject-min-length' })),
      description: Yup.string()
        .required(intl.formatMessage({ id: 'description-required' }))
        .min(10, intl.formatMessage({ id: 'description-min-length' })),
      ticketType: Yup.string().required(intl.formatMessage({ id: 'ticket-type-required' }))
    });

    // Add dynamic field validations
    if (dynamicFields.length > 0) {
      const dynamicFieldsSchema: any = {};

      dynamicFields.forEach((field) => {
        let fieldSchema: any;

        switch (field.type) {
          case 'text':
          case 'textarea':
            fieldSchema = Yup.string();
            if (field.validation && typeof field.validation === 'object') {
              if ('minLength' in field.validation) {
                fieldSchema = fieldSchema.min(
                  (field.validation as any).minLength,
                  `${field.label} debe tener al menos ${(field.validation as any).minLength} caracteres`
                );
              }
              if ('maxLength' in field.validation) {
                fieldSchema = fieldSchema.max(
                  (field.validation as any).maxLength,
                  `${field.label} no puede tener más de ${(field.validation as any).maxLength} caracteres`
                );
              }
            }
            break;
          case 'number':
            fieldSchema = Yup.number().typeError(`${field.label} debe ser un número`);
            break;
          case 'date':
            fieldSchema = Yup.date().typeError(`${field.label} debe ser una fecha válida`);
            break;
          case 'select':
            fieldSchema = Yup.string();
            break;
          default:
            fieldSchema = Yup.string();
        }

        if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label} es obligatorio`);
        }

        dynamicFieldsSchema[field.name] = fieldSchema;
      });

      schema = schema.shape({
        dynamicFields: Yup.object(dynamicFieldsSchema)
      });
    }

    return schema;
  }, [intl, dynamicFields]);

  const formik = useFormik<TicketForm>({
    initialValues: {
      subject: '',
      description: '',
      ticketType: '',
      dynamicFields: {},
      employeeRelated: [''],
      files: []
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Preparar el objeto para el API real
        interface Participant {
          userId: number | null;
          role: string;
          canEdit: boolean;
          canComment: boolean;
        }
        const participants: Participant[] = [];

        if (values.employeeRelated && values.employeeRelated.length > 0) {
          values.employeeRelated.forEach((employeeId) => {
            const user = users.find((u) => u.id !== undefined && u.id.toString() === employeeId);
            if (user) {
              participants.push({
                userId: user.id ?? null,
                role: user.role,
                canEdit: true,
                canComment: true
              });
            }
          });
        }

        const ticketData = {
          title: values.subject,
          ticketTypeId: Number(values.ticketType),
          description: values.description,
          createdByUserId: currentUser?.id || 0,
          customFields: JSON.stringify({ ...values.dynamicFields }),
          initialMessage: values.description,
          files: values.files || [],
          participants: JSON.stringify((participants || [])),
          priority: 'MEDIUM',
          dueDate: new Date().toISOString(),
          estimatedHours: 8,
          tags: [],
          isUrgent: false,
          isInternal: true,
          notificationsEnabled: true,
          departmentId: currentUser?.departmentId || 0,
          assignedTo: 0
        };

        // Llamar al API real
        const response = await insertTicket(ticketData);

        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'ticket-created-successfully' }),
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);
        
        resetForm();
        onClose();
        return response;
      } catch (error: any) {
        let errorMsg = intl.formatMessage({ id: 'ticket-creation-failed' });
        if (error && error.message) {
          errorMsg = error.message;
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        openSnackbar({
          open: true,
          message: errorMsg,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
        throw error;
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, setFieldValue } = formik;

  // Effect to update selected ticket type ID when ticketType changes
  useEffect(() => {
    if (values.ticketType && ticketTypes.length > 0) {
      const selectedType = ticketTypes.find((type) => type.id.toString() === values.ticketType);
      if (selectedType) {
        setSelectedTicketTypeCode(selectedType.name); // Usar el código de tipo de ticket
        setFieldValue('dynamicFields', {});
      }
    } else {
      setSelectedTicketTypeCode(null);
    }
  }, [values.ticketType, ticketTypes, setFieldValue]);

  const handleClose = () => {
    formik.resetForm();
  setSelectedTicketTypeCode(null);
    onClose();
  };

  const handleDynamicFieldChange = (name: string, value: any) => {
    setFieldValue(`dynamicFields.${name}`, value);
  };

  // Function to render dynamic fields
  const renderDynamicField = (field: DynamicField) => {
    const fieldError = (touched.dynamicFields as any)?.[field.name] && (errors.dynamicFields as any)?.[field.name];

    return (
      <DynamicFieldComponent
        field={field}
        value={values.dynamicFields?.[field.name]}
        onChange={handleDynamicFieldChange}
        error={Boolean(fieldError)}
        helperText={fieldError as string}
      />
    );
  };

  return (
    <Dialog maxWidth="sm" fullWidth open={open} onClose={handleClose} sx={{ '& .MuiDialog-paper': { p: 2 } }}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">
                <FormattedMessage id="create-new-ticket" />
              </Typography>
              <IconButton color="secondary" onClick={handleClose}>
                <CloseCircle />
              </IconButton>
            </Stack>
          </DialogTitle>
          <Divider />

          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="subject">
                    <FormattedMessage id="subject" />*
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="subject"
                    placeholder={intl.formatMessage({ id: 'enter-subject' })}
                    {...getFieldProps('subject')}
                    error={Boolean(touched.subject && errors.subject)}
                    helperText={touched.subject && errors.subject}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="ticketType">
                    <FormattedMessage id="ticket-type" />*
                  </InputLabel>
                  <FormControl fullWidth error={Boolean(touched.ticketType && errors.ticketType)}>
                    <Select
                      id="ticketType"
                      value={values.ticketType}
                      onChange={(event) => setFieldValue('ticketType', event.target.value)}
                      displayEmpty
                      disabled={ticketTypesLoading}
                    >
                      <MenuItem value="">
                        <em>{intl.formatMessage({ id: 'select-ticket-type' })}</em>
                      </MenuItem>
                      {ticketTypes.map((ticketType) => (
                        <MenuItem key={ticketType.id} value={ticketType.id.toString()}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: ticketType.color,
                                borderRadius: '50%'
                              }}
                            />
                            <span>{ticketType.name}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.ticketType && errors.ticketType && <FormHelperText>{errors.ticketType}</FormHelperText>}
                    {ticketTypesError && <FormHelperText error>{intl.formatMessage({ id: 'error-loading-ticket-types' })}</FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>

              {/* Dynamic Fields Section */}
              {selectedTicketTypeCode && (
                <>
                  {dynamicFieldsLoading && (
                    <Grid size={12}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="loading-additional-fields" />
                        </Typography>
                      </Stack>
                    </Grid>
                  )}

                  {dynamicFieldsError && (
                    <Grid size={12}>
                      <FormHelperText error sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                        <FormattedMessage id="error-loading-additional-fields" />
                      </FormHelperText>
                    </Grid>
                  )}

                  {dynamicFields.length > 0 &&
                    dynamicFields.map((field) => (
                      <Grid key={field.id} size={{ xs: 12, md: field.type === 'textarea' ? 12 : 12 }}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor={field.name}>
                            {field.label}
                            {field.required && <span style={{ color: 'red' }}> *</span>}
                            {field.description && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {field.description}
                              </Typography>
                            )}
                          </InputLabel>
                          {renderDynamicField(field)}
                        </Stack>
                      </Grid>
                    ))}
                </>
              )}

              <Grid size={{ xs: 12 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel id="copy-to-collaborator-label">
                    <FormattedMessage id="copy-to-collaborator-label" />
                  </InputLabel>
                  <Select
                    labelId="copy-to-collaborator-label"
                    displayEmpty
                    multiple
                    id="employeeRelated"
                    name="employeeRelated"
                    value={values.employeeRelated}
                    input={<OutlinedInput />}
                    onChange={(event) => {
                      const {
                        target: { value }
                      } = event;
                      // Filtra los elementos vacíos de value y los asigna a valuesNotEmpty

                      let valuesNotEmpty = (typeof value === 'string' ? value.split(',') : value).filter(
                        (v) => v !== '' && v !== null && v !== undefined
                      );
                      setFieldValue('employeeRelated', valuesNotEmpty);
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>{intl.formatMessage({ id: 'copy-to-collaborator-label' })}</em>
                    </MenuItem>

                    {users
                      .filter((user) => user.id !== currentUser?.id)
                      .map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                        </MenuItem>
                      ))}
                  </Select>
                </Stack>
              </Grid>

              <Grid size={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="description">
                    <FormattedMessage id="description" />*
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="description"
                    multiline
                    rows={4}
                    placeholder={intl.formatMessage({ id: 'enter-description' })}
                    {...getFieldProps('description')}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Stack>
              </Grid>

              <Grid size={12}>
                <InputLabel htmlFor="files">
                  <FormattedMessage id="attach-files" />
                </InputLabel>
                <Stack sx={{ gap: 1.5, alignItems: 'left' }}>
                  <UploadMultiFile
                    showList={true}
                    setFieldValue={setFieldValue}
                    files={values.files}
                    error={touched.files && !!errors.files}
                    type={DropzopType.STANDARD}
                  />
                </Stack>
                {touched.files && errors.files && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.files as string}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </DialogContent>

          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button color="error" onClick={handleClose}>
                <FormattedMessage id="cancel" />
              </Button>
              <Button variant="contained" type="submit" disabled={isSubmitting}>
                <FormattedMessage id="create-ticket" />
              </Button>
            </Stack>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Dialog>
  );
};

export default AddTicketModal;
