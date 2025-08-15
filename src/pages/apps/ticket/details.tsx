import { Document, DocumentDownload } from 'iconsax-react';
import CustomTooltip from 'components/@extended/Tooltip';
import IconButton from 'components/@extended/IconButton';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import MultiFileUpload from 'components/third-party/dropzone/MultiFile';
import 'quill/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';
import { useParams, useNavigate } from 'react-router';
import useSWR from 'swr';
import axios from 'axios';

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

import AddMessageModal from 'sections/apps/ticket/AddMessageModal';
import RichTextModal from 'sections/apps/ticket/RichTextModal';
import ReassignModal from 'sections/apps/ticket/ReassignModal';
import { useResolverUsers } from 'hooks/useResolverUsers';
// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { openSnackbar } from 'api/snackbar';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

// types
import { SnackbarProps } from 'types/snackbar';
import { TicketList, User, TicketType, Department, TicketMessage, TicketAttachment } from 'types/ticket';
import { useGetTicketById, useGetTicketMaster, downloadTicketAttachment } from 'api/ticket';
import { useGetUser } from 'api/user';

// ==============================|| TICKET - DETAILS ||============================== //

export default function TicketDetails() {
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [openNCModal, setOpenNCModal] = useState(false);
  const [closeComment, setCloseComment] = useState('');
  const [ncComment, setNCComment] = useState('');
  const usersList = useGetUser().users.map(user => ({ value: user.id, label: user.firstName + ' ' + user.lastName, email: user.email }));
  const [formContent, setFormContent] = useState('');
  const [formFiles, setFormFiles] = useState<any[]>([]);
  type ParticipantOption = { id: number; label: string };
  const [formParticipants, setFormParticipants] = useState<ParticipantOption[]>([]);
  const [openReassignModal, setOpenReassignModal] = useState(false);
  const [selectedReassignUser, setSelectedReassignUser] = useState<any>(null);
  const resolverUsers = useResolverUsers();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  console.log('ID del ticket:', id);
  const { ticketDetail: data, ticketDetailLoading: isLoading, ticketDetailError: error } = useGetTicketById(parseInt(id || ''));
  console.log('Datos del ticket', data);
  // Consulta el ticket y mensajes usando SWR y axios

  // const { data, isLoading, error } = useSWR(id ? `/tickets/${id}` : null, () => fetchTicket(id));
  console.log('Ticket data:', data);
  const ticketData: TicketList | null = data || null;
  type Message = { id: number; sender: string; date: string; content: string };
  const messages: TicketMessage[] = data?.messages || [];
  const [editData, setEditData] = useState<TicketList | null>(ticketData);

  const handleEdit = () => {
    setIsEditing(true);
    if (ticketData) setEditData({ ...ticketData });
  };

  const handleSave = async () => {
    try {
      // Aquí iría la llamada a la API para actualizar el ticket
      // await axios.put(`/tickets/${id}`, editData);
      setIsEditing(false);
      openSnackbar({
        open: true,
        message: 'Ticket updated successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    } catch (error) {
      openSnackbar({
        open: true,
        message: 'Error updating ticket',
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
    } catch (err) {
      alert('Error al descargar archivo');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
  }

  if (isLoading) return <Typography>Cargando ticket...</Typography>;
  if (error) return <Typography>Error al cargar el ticket.</Typography>;
  if (!ticketData) return <Typography>No se encontró el ticket.</Typography>;

  // Participantes para el select (debe ir después de ticketData)
  const participantes: ParticipantOption[] =
    ticketData.participants.map((p) => ({
      id: p.userId || 0,
      label: `${p.user.firstName} ${p.user.lastName}`
    })) || [];

  return (
    <>
      {/* Modal de nuevo mensaje extraído a componente */}
      <AddMessageModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSend={() => setOpenModal(false)}
        participantes={participantes}
      />
      {/* Modal para cerrar ticket */}
      <RichTextModal
        open={openCloseModal}
        onClose={() => setOpenCloseModal(false)}
        onSubmit={(content) => {
          setCloseComment(content);
          setOpenCloseModal(false);
          // Aquí puedes llamar a la API para cerrar el ticket con el comentario
        }}
        title="Cerrar ticket"
        label="Motivo de cierre"
        submitText="Cerrar"
      />
      {/* Modal para generar no conformidad */}
      <RichTextModal
        open={openNCModal}
        onClose={() => setOpenNCModal(false)}
        onSubmit={(content) => {
          setNCComment(content);
          setOpenNCModal(false);
          // Aquí puedes llamar a la API para crear la no conformidad con el comentario
        }}
        title="Generar no conformidad"
        label="Motivo de la no conformidad"
        submitText="Generar"
      />
      {/* Modal para reasignar ticket */}
      <ReassignModal
        open={openReassignModal}
        onClose={() => setOpenReassignModal(false)}
        userOptions={resolverUsers}
        onSubmit={(user) => {
          setSelectedReassignUser(user);
          setOpenReassignModal(false);
          // Aquí puedes llamar a la API para reasignar el ticket
        }}
      />
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <MainCard
            title={
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5">Ticket #{ticketData.ticketNumber}</Typography>
              </Stack>
            }
            secondary={
              <Stack direction="row" spacing={1}>
                {!isEditing ? (
                  <>
                    <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpenModal(true)}>
                      Nuevo Mensaje
                    </Button>
                    <Button variant="outlined" onClick={handleEdit}>
                      Editar
                    </Button>
                    <Button variant="outlined" onClick={() => setOpenCloseModal(true)}>
                      Cerrar ticket
                    </Button>
                    {ticketData.ticketTypeId == 5 && (
                      <Button variant="outlined" onClick={() => setOpenNCModal(true)}>
                        Generar no conformidad
                      </Button>
                    )}
                    <Button variant="outlined" color="secondary" onClick={() => setOpenReassignModal(true)}>
                      Reasignar
                    </Button>
                    <Button variant="shadow" color="success" onClick={() => navigate('/apps/ticket/list')}>
                      Volver a la lista
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
            }
          >
            <Stack spacing={3}>
              {/* Ticket Information */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
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

                <Grid size={{ xs: 12, md: 4 }}>
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
                <Grid size={{ xs: 12, md: 4 }}>
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

                  <Grid size={{ xs: 12 }}>
                    <Stack spacing={1}>
                      <InputLabel>Participantes</InputLabel>
                      {isEditing ? (
                        <Autocomplete
                          multiple
                          options={usersList}
                          getOptionLabel={(option) => option?.label || ''}
                          value={editData?.participants?.map((p: any) => {
                            const user = usersList.find(u => u.value === (p.userId || p.value));
                            return user ?? null;
                          }).filter((u): u is { value: number; label: string; email: string } => !!u) || []}
                          onChange={(_, value) => {
                            setEditData(prev => {
                              if (!prev) return prev;
                              // Map to TicketParticipant, keeping previous data if possible
                              const prevParts = prev.participants || [];
                              const newParts = value.filter(Boolean).map((v: any) => {
                                const prevPart = prevParts.find(pp => pp.userId === v.value);
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
                      ) : (
                        ticketData.participants.map((participant) => (
                          <Chip
                            label={
                              participant.user
                                ? `${participant.user.firstName} ${participant.user.lastName} ( ${participant.user.email} )`
                                : 'Usuario desconocido'
                            }
                            size="small"
                            color={getPriorityColor(ticketData.priority) as any}
                            variant="filled"
                            sx={{ width: 'fit-content' }}
                          />
                        ))
                      )}
                    </Stack>
                  </Grid>
              </Grid>

              <Divider />

              {/* Información del creador */}
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{ticketData.creator?.email}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Información del asignado */}
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

              <Divider />

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

              {/* Timestamps */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Timeline
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1">{formatDate(ticketData.createdAt)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">{formatDate(ticketData.updatedAt)}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Sección de mensajes del caso */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Mensajes del Caso
                </Typography>
                <Stack spacing={2}>
                  {messages.map((msg: TicketMessage) => {
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
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {msg.content}
                        </Typography>
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
    </>
  );
}
