import { ArrowSwapHorizontal, Document, DocumentDownload, InfoCircle } from 'iconsax-react';
import CustomTooltip from 'components/@extended/Tooltip';
import IconButton from 'components/@extended/IconButton';
import { useState, useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
// MultiFileUpload/ReactQuill/axios/useSWR imports are kept commented because they are not used in this file currently
// import MultiFileUpload from 'components/third-party/dropzone/MultiFile';
// import 'quill/dist/quill.snow.css';
// import ReactQuill from 'react-quill-new';
import { useParams, useNavigate } from 'react-router';
// useSWR and axios are not directly used here; leave commented to avoid unused import warnings
// import useSWR from 'swr';
// import axios from 'axios';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Add, Edit, CloseCircle, ArrowLeft2, Trash } from 'iconsax-react';

import AddMessageModal from 'sections/apps/ticket/AddMessageModal';
import RichTextModal from 'sections/apps/ticket/RichTextModal';
import ReassignModal from 'sections/apps/ticket/ReassignModal';
import CancelTicketModal from 'components/CancelTicketModal';
import { useResolveUsersAttentsTiketByType } from 'hooks/useResolverUsers';
// project-imports
import { invalidateTicketCaches } from 'api/ticket';
import MainCard from 'components/MainCard';
import { openSnackbar } from 'api/snackbar';
import { GRID_COMMON_SPACING } from 'config';

// types
import { SnackbarProps } from 'types/snackbar';
import { TicketList, TicketMessage, TicketAttachment } from 'types/ticket';
import { useGetTicketById, downloadTicketAttachment, updateTicketStatus, closeTicket, updateTicket } from 'api/ticket';
import { useGetUser } from 'api/user';
import { createNonConformityFromTicket } from 'api/nonConformities';
import usePermissions from 'hooks/usePermissions';
import useAuth from 'hooks/useAuth';

// ==============================|| TICKET - DETAILS ||============================== //

export default function TicketDetails() {
  const [openCancelModal, setOpenCancelModal] = useState(false);
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [openNCModal, setOpenNCModal] = useState(false);
  const usersList = useGetUser().users.map((user) => ({ value: user.id, label: user.firstName + ' ' + user.lastName, email: user.email }));
  type ParticipantOption = { id: number; label: string };
  // participantes form state removed (unused)
  const [openReassignModal, setOpenReassignModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { ticketDetail: data, ticketDetailLoading: isLoading, ticketDetailError: error } = useGetTicketById(parseInt(id || ''));
  // Consulta el ticket y mensajes usando SWR y axios

  const ticketData: TicketList | null = data || null;
  const messages: TicketMessage[] = data?.messages || [];
  const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [editData, setEditData] = useState<TicketList | null>(ticketData);

  const handleEdit = () => {
    setIsEditing(true);
    if (ticketData) setEditData({ ...ticketData });
  };

  const resolveUsersAttentsTiketByType = useResolveUsersAttentsTiketByType(ticketData?.ticketTypeId || 0, ticketData?.assignedTo || 0);

  // Permisos de usuario
  const { hasPerm } = usePermissions();
  // Usuario actual (necesario para lógica de cambio de estado)
  const { user: currentUser } = useAuth();
  // Evitar ejecutar la actualización varias veces
  const updatedRef = useRef(false);

  useEffect(() => {
    const tryUpdateStatus = async () => {
      if (!ticketData || !currentUser) return;
      if (updatedRef.current) return;
      const currentStatus = ticketData.status;
      const assigned = ticketData.assignedTo;
      // Solo cuando el ticket está abierto o en seguimiento y el usuario actual es el asignado
      if ((currentStatus === 'OPEN' || currentStatus === 'FOLLOW_UP') && String(currentUser.id) === String(assigned)) {
        try {
          updatedRef.current = true;
          await updateTicketStatus(ticketData.id, 'IN_PROGRESS');
          // Opcional: notificar al usuario
          openSnackbar({
            open: true,
            message: 'El ticket fue marcado como En proceso',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            variant: 'alert',
            alert: { color: 'success' }
          } as SnackbarProps);
        } catch {
          console.error('Error updating ticket status');
          // No volver a intentar inmediatamente
          updatedRef.current = true;
        }
      }
    };

    tryUpdateStatus();
  }, [ticketData, currentUser]);

  const handleSave = async () => {
    if (!ticketData) return;
    try {
      // set editing false to close inputs
      setIsEditing(false);

      // build payload with editable fields only
      const payload: Partial<TicketList> = {
        title: editData?.title,
        description: editData?.description,
        status: editData?.status,
        participants: editData?.participants
      };

      await updateTicket(ticketData.id, payload);

      openSnackbar({
        open: true,
        message: 'Ticket actualizado correctamente',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    } catch (err) {
      console.error('Error saving ticket details', err);
      openSnackbar({
        open: true,
        message: 'Error al actualizar el ticket',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (ticketData) setEditData({ ...ticketData });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      case 'FOLLOW_UP':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'default';
      case 'NON_CONFORMITY':
        return 'secondary';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleDownloadAttachment = async (attachment: TicketAttachment) => {
    try {
      const blob = await downloadTicketAttachment(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.originalFileName || attachment.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar archivo');
    }
  };

  const formatDate = (dateString: string) => {
    // Usa el locale global si está disponible, si no, fallback a 'es-MX'
    const locale = (navigator.languages && navigator.languages[0]) || navigator.language || 'es-MX';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLabelStatus = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Abierto';
      case 'IN_PROGRESS':
        return 'En proceso';
      case 'FOLLOW_UP':
        return 'En seguimiento';
      case 'COMPLETED':
        return 'Finalizado';
      case 'CLOSED':
        return 'Cerrado';
      case 'NON_CONFORMITY':
        return 'No conformidad';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  // Responsive detection
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading) return <Typography>Cargando ticket...</Typography>;
  if (error) return <Typography>Error al cargar el ticket.</Typography>;
  if (!ticketData) return <Typography>No se encontró el ticket.</Typography>;

  // Participantes para el select (debe ir después de ticketData)
  const participantes: ParticipantOption[] =
    ticketData.participants && ticketData.participants.length > 0
      ? ticketData.participants
          .filter((p) => p.userId !== ticketData.creator?.id && p.userId !== ticketData.assignedTo)
          .map((p) => ({
            id: p.userId || 0,
            label: `${p.user.firstName} ${p.user.lastName}`
          }))
      : [];

  return (
    <>
      {/* Modal de nuevo mensaje extraído a componente */}
      <AddMessageModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSend={() => setOpenModal(false)}
        participantes={participantes}
        idTicket={ticketData.id}
      />
      {/* Modal para cerrar ticket */}
      <RichTextModal
        open={openCloseModal}
        onClose={() => setOpenCloseModal(false)}
        onSubmit={async (content) => {
          if (!ticketData.id) return;
          try {
            await closeTicket(ticketData.id, content);
            openSnackbar({
              open: true,
              message: 'Ticket cerrado correctamente',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'success' }
            } as SnackbarProps);
          } catch {
            console.error('Error closing ticket');
            openSnackbar({
              open: true,
              message: 'Error al cerrar el ticket',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'error' }
            } as SnackbarProps);
          } finally {
            setOpenCloseModal(false);
          }

          // Aquí puedes llamar a la API para cerrar el ticket con el comentario
        }}
        title="Cerrar ticket"
        label="Motivo de cierre"
        submitText="Cerrar"
        idTicket={ticketData.id}
      />
      {/* Modal para generar no conformidad */}

      <RichTextModal
        open={openNCModal}
        onClose={() => setOpenNCModal(false)}
        onSubmit={async (content) => {
          if (!ticketData.id) return;
          try {
            // Crear la no conformidad desde el ticket
            const nonConformity = await createNonConformityFromTicket(ticketData.id, content);

            openSnackbar({
              open: true,
              message: `No conformidad ${nonConformity.number} creada exitosamente`,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'success' }
            } as SnackbarProps);

            // Cerrar el modal
            setOpenNCModal(false);

            // Redirigir al formulario por pasos de no conformidades
            navigate(`/apps/non-conformities/${nonConformity.id}?ticketId=${nonConformity.ticketId || ''}`);
          } catch (error) {
            console.error('Error creating non-conformity from ticket:', error);
            openSnackbar({
              open: true,
              message: 'Error al crear la no conformidad',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'error' }
            } as SnackbarProps);
          }
        }}
        title="Generar no conformidad"
        label="Motivo de la no conformidad"
        submitText="Generar"
        idTicket={ticketData.id}
      />
      {/* Modal para reasignar ticket */}
      {Array.isArray(resolveUsersAttentsTiketByType) && resolveUsersAttentsTiketByType.length > 0 ? (
        <ReassignModal
          open={openReassignModal}
          onClose={() => setOpenReassignModal(false)}
          userOptions={resolveUsersAttentsTiketByType}
          initialUser={ticketData.assignedTo}
          ticketId={ticketData.id}
          onSubmit={(user) => {
            setOpenReassignModal(false);
            // Aquí puedes llamar a la API para reasignar el ticket
          }}
        />
      ) : (
        <Dialog open={openReassignModal} onClose={() => setOpenReassignModal(false)}>
          <DialogTitle>No hay usuarios disponibles</DialogTitle>
          <DialogContent>
            <Typography>No hay usuarios disponibles para reasignar este ticket.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReassignModal(false)} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <MainCard
            title={
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5">Ticket #{ticketData.ticketNumber}</Typography>
              </Stack>
            }
            secondary={
              // Hide secondary controls on small screens; FABs will appear instead
              !isSmall ? (
                <Stack direction="row" spacing={1}>
                  {!isEditing ? (
                    <>
                      {ticketData.status !== 'CLOSED' && ticketData.status !== 'CANCELLED' && ticketData.status !== 'COMPLETED' && (
                        <>
                          {hasPerm('tickets.sendMessage') && (
                            <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpenModal(true)}>
                              Nuevo Mensaje
                            </Button>
                          )}
                          {/* <Button variant="outlined" onClick={handleEdit}>
                            Editar
                          </Button> */}
                          {hasPerm('tickets.closeTicket') && (
                            <Button variant="outlined" onClick={() => setOpenCloseModal(true)}>
                              Cerrar ticket
                            </Button>
                          )}

                          {hasPerm('tickets.cancel') && (
                            <Button variant="outlined" color="error" onClick={() => setOpenCancelModal(true)}>
                              Cancelar ticket
                            </Button>
                          )}

                          {hasPerm('tickets.createNoConformity') && ticketData.ticketTypeId == 5 && (
                            <Button variant="outlined" onClick={() => setOpenNCModal(true)}>
                              Generar no conformidad
                            </Button>
                          )}
                          {hasPerm('tickets.reassign') && (
                            <Button variant="outlined" color="secondary" onClick={() => setOpenReassignModal(true)}>
                              Reasignar
                            </Button>
                          )}
                        </>
                      )}

                      <Button
                        variant="shadow"
                        color="success"
                        onClick={() => {
                          try {
                            if (ticketData && ticketData.id) invalidateTicketCaches(ticketData.id);
                          } catch {
                            // ignore
                            console.debug('invalidateTicketCaches error');
                          }
                          navigate('/apps/ticket/list');
                        }}
                      >
                        Volver
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="contained" onClick={handleSave}>
                        Guardar
                      </Button>
                      <Button variant="outlined" onClick={handleCancel}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </Stack>
              ) : (
                <></>
              )
            }
          >
            <Stack spacing={3}>
              {/* Ticket Information */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack spacing={1}>
                    <InputLabel>Asunto</InputLabel>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={editData?.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value } as TicketList)}
                      />
                    ) : (
                      <Typography variant="body1">{ticketData.title}</Typography>
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Stack spacing={1}>
                    <InputLabel>Tipo de Ticket</InputLabel>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <Select value={editData?.ticketType?.name || ''} disabled>
                          <MenuItem value={editData?.ticketType?.name || ''}>{editData?.ticketType?.name || ''}</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body1">{ticketData.ticketType?.name || ''}</Typography>
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Stack spacing={1}>
                    <InputLabel>Status</InputLabel>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <Select
                          value={editData?.status || ''}
                          onChange={(e) => editData && setEditData({ ...editData, status: e.target.value })}
                        >
                          <MenuItem value="OPEN">Abierto</MenuItem>
                          <MenuItem value="IN_PROGRESS">En proceso</MenuItem>
                          <MenuItem value="FOLLOW_UP">En seguimiento</MenuItem>
                          <MenuItem value="COMPLETED">Finalizado</MenuItem>
                          <MenuItem value="CLOSED">Cerrado</MenuItem>
                          <MenuItem value="NON_CONFORMITY">No conformidad</MenuItem>
                          <MenuItem value="CANCELLED">Cancelado</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={getLabelStatus(ticketData.status)}
                        size="small"
                        color={getStatusColor(ticketData.status) as any}
                        variant="outlined"
                        sx={{ width: 'fit-content' }}
                      />
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Creado
                  </Typography>
                  <Typography variant="body1">{formatDate(ticketData.createdAt)}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Última Actualización
                  </Typography>
                  <Typography variant="body1">{formatDate(ticketData.updatedAt)}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack spacing={1}>
                    <InputLabel>Participantes</InputLabel>
                    {isEditing ? (
                      <Autocomplete
                        multiple
                        options={usersList}
                        getOptionLabel={(option) => option?.label || ''}
                        value={
                          editData?.participants && editData.participants.length > 0
                            ? editData.participants
                                .map((p: any) => {
                                  const user = usersList.find((u) => u.value === (p.userId || p.value));
                                  return user ?? null;
                                })
                                .filter((u): u is { value: number; label: string; email: string } => !!u)
                            : []
                        }
                        onChange={(_, value) => {
                          setEditData((prev) => {
                            if (!prev) return prev;
                            // Map to TicketParticipant, keeping previous data if possible
                            const prevParts = prev.participants || [];
                            const newParts = value.filter(Boolean).map((v: any) => {
                              const prevPart = prevParts.find((pp) => pp.userId === v.value);
                              return {
                                id: prevPart?.id ?? 0,
                                ticketId: prevPart?.ticketId,
                                user: {
                                  firstName: v.label.split(' ')[0],
                                  lastName: v.label.split(' ').slice(1).join(' '),
                                  email: v.email,
                                  id: v.value
                                },
                                userId: v.value,
                                role: prevPart?.role,
                                canComment: prevPart?.canComment ?? true,
                                canEdit: prevPart?.canEdit ?? true,
                                canClose: prevPart?.canClose ?? false,
                                canAssign: prevPart?.canAssign ?? false,
                                receiveNotifications: prevPart?.receiveNotifications ?? true,
                                joinedAt: prevPart?.joinedAt ?? new Date().toISOString(),
                                removedAt: prevPart?.removedAt ?? null,
                                addedBy: prevPart?.addedBy ?? null
                              };
                            });
                            return { ...prev, participants: newParts };
                          });
                        }}
                        renderInput={(params) => <TextField {...params} label="Selecciona participantes" />}
                      />
                    ) : ticketData.participants && ticketData.participants.length > 0 ? (
                      ticketData.participants.map((participant) => (
                        <Chip
                          key={participant.userId}
                          label={participant.user ? `${participant.user.firstName} ${participant.user.lastName}` : 'Usuario desconocido'}
                          size="small"
                          color={getPriorityColor(ticketData.priority) as any}
                          variant="filled"
                          sx={{ width: 'fit-content' }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin participantes
                      </Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Creador
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nombre
                        </Typography>
                        <Typography variant="body1">
                          {ticketData.creator?.firstName} {ticketData.creator?.lastName}
                        </Typography>
                      </Grid>
                      {/* <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{ticketData.creator?.email}</Typography>
                      </Grid> */}
                    </Grid>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Asignado a
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nombre
                        </Typography>
                        <Typography variant="body1">
                          {ticketData.assignee?.firstName} {ticketData.assignee?.lastName}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Departamento
                        </Typography>
                        <Typography variant="body1">{ticketData.department?.name}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              {/* Description */}
              <Stack spacing={1}>
                <InputLabel>Description</InputLabel>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={editData?.description || ''}
                    onChange={(e) => editData && setEditData({ ...editData, description: e.target.value })}
                  />
                ) : (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {ticketData.description}
                  </Typography>
                )}
              </Stack>

              <Divider />

              {/* Sección de mensajes del caso */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Mensajes del Caso
                </Typography>
                <Stack spacing={2}>
                  {sortedMessages.map((msg: TicketMessage) => {
                    // Filtrar adjuntos de este mensaje
                    const msgAttachments = ticketData.attachments?.filter((att) => att.messageId === msg.id) || [];
                    return (
                      <Box key={msg.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, background: '#fafbfc' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">
                            {msg.sender?.firstName} {msg.sender?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(msg.createdAt)}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 1 }} dangerouslySetInnerHTML={{ __html: msg.content }} />
                        {msgAttachments.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Archivos adjuntos:
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                              {msgAttachments.map((att) => (
                                <CustomTooltip key={att.id} title={att.originalFileName || att.fileName} arrow>
                                  <span>
                                    <IconButton size="small" color="primary" onClick={() => handleDownloadAttachment(att)}>
                                      <Document style={{ fontSize: 22, marginRight: 4 }} />
                                      <DocumentDownload style={{ fontSize: 18 }} />
                                    </IconButton>
                                  </span>
                                </CustomTooltip>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
      {/* Floating action buttons for small screens */}
      {isSmall && (
        <Box
          sx={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: (theme) => theme.zIndex.tooltip + 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {!isEditing ? (
            <>
              {ticketData.status !== 'CLOSED' && ticketData.status !== 'COMPLETED' && (
                <>
                  {hasPerm('tickets.sendMessage') && (
                    <Fab size="medium" color="primary" aria-label="nuevo-mensaje" onClick={() => setOpenModal(true)}>
                      <Add />
                    </Fab>
                  )}
                  {hasPerm('tickets.update') && (
                    <Fab size="medium" color="default" aria-label="editar" onClick={handleEdit}>
                      <Edit />
                    </Fab>
                  )}
                  {hasPerm('tickets.close') && (
                    <Fab size="medium" color="inherit" aria-label="cerrar" onClick={() => setOpenCloseModal(true)}>
                      <CloseCircle />
                    </Fab>
                  )}
                  {hasPerm('tickets.cancel') && (
                    <Fab size="medium" color="error" aria-label="cancelar-ticket" onClick={() => setOpenCancelModal(true)}>
                      <Trash />
                    </Fab>
                  )}
                  {hasPerm('tickets.noConformity') && ticketData.ticketTypeId == 5 && (
                    <Fab size="medium" color="warning" aria-label="no-conformidad" onClick={() => setOpenNCModal(true)}>
                      <InfoCircle />
                    </Fab>
                  )}
                  {hasPerm('tickets.reassign') && (
                    <Fab size="medium" color="secondary" aria-label="reasignar" onClick={() => setOpenReassignModal(true)}>
                      <ArrowSwapHorizontal />
                    </Fab>
                  )}
                </>
              )}
              <Fab
                size="medium"
                color="success"
                aria-label="volver"
                onClick={() => {
                  try {
                    if (ticketData && ticketData.id) invalidateTicketCaches(ticketData.id);
                  } catch {
                    // ignore
                  }
                  navigate('/apps/ticket/list');
                }}
              >
                <ArrowLeft2 />
              </Fab>
            </>
          ) : (
            <>
              <Fab size="medium" color="primary" aria-label="guardar" onClick={handleSave}>
                <Edit />
              </Fab>
              <Fab size="medium" color="default" aria-label="cancelar" onClick={handleCancel}>
                <CloseCircle />
              </Fab>
            </>
          )}
        </Box>
      )}

      {/* Modal para cancelar ticket */}
      <CancelTicketModal
        open={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        onConfirm={async (justification) => {
          if (!ticketData) return;
          try {
            // Llama al endpoint de cancelación con justificación
            await import('api/ticket').then(({ cancelTicket, invalidateTicketCaches }) =>
              cancelTicket(ticketData.id, justification).then(() => {
                try {
                  // invalidar caches y redirigir a la lista
                  invalidateTicketCaches(ticketData.id);
                } catch {
                  // noop
                  console.debug('invalidateTicketCaches error');
                }
              })
            );
            openSnackbar({
              action: false,
              open: true,
              message: 'Ticket cancelado correctamente',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'success', variant: 'filled' },
              transition: 'Fade',
              close: false,
              actionButton: false,
              dense: false,
              maxStack: 3,
              iconVariant: 'usedefault'
            });
            setOpenCancelModal(false);
            // redirigir a la lista de tickets
            try {
              navigate('/apps/ticket/list');
            } catch {
              // noop
              console.debug('navigate error');
            }
          } catch {
            openSnackbar({
              action: false,
              open: true,
              message: 'Error al cancelar el ticket',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              variant: 'alert',
              alert: { color: 'error', variant: 'filled' },
              transition: 'Fade',
              close: false,
              actionButton: false,
              dense: false,
              maxStack: 3,
              iconVariant: 'usedefault'
            });
          }
        }}
      />
    </>
  );
}
