import { useState, useEffect } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

// project-imports
import { PopupTransition } from 'components/@extended/Transitions';
import Avatar from 'components/@extended/Avatar';
import { getUserSessions } from 'api/user';

// assets
import { Monitor, Mobile, Clock, Location, CloseCircle } from 'iconsax-react';

// types
interface SessionItem {
  id: number;
  userId: number;
  userAgent: string;
  ipAddress: string;
  location?: string;
  loginAt: string;
  logoutAt?: string;
  isActive: boolean;
  expiresAt?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

// ==============================|| USER SESSIONS MODAL ||============================== //

export default function UserSessionsModal({ open, onClose, userId, userName }: Props) {
  const [loading, setLoading] = useState(false);
  const [sessionsData, setSessionsData] = useState<SessionItem[]>([]);

  // Función para obtener las sesiones del usuario
  const fetchUserSessions = async () => {
    setLoading(true);
    try {
      const response = await getUserSessions(userId, 20);

      if (response.success) {
        setSessionsData(response.data);
      } else {
        console.error('Error al cargar sesiones:', response.error);
        setSessionsData([]);
      }
    } catch (error) {
      console.error('Error al cargar las sesiones:', error);
      setSessionsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      fetchUserSessions();
    }
  }, [open, userId]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el icono según el user agent
  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Mobile size={20} />;
    }
    return <Monitor size={20} />;
  };

  // Función para obtener información del dispositivo desde user agent
  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return 'Dispositivo desconocido';

    const ua = userAgent.toLowerCase();
    let device = 'Escritorio';
    let browser = 'Navegador desconocido';

    // Detectar dispositivo
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      device = 'Móvil';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      device = 'Tablet';
    }

    // Detectar navegador
    if (ua.includes('chrome')) {
      browser = 'Chrome';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('safari')) {
      browser = 'Safari';
    } else if (ua.includes('edge')) {
      browser = 'Edge';
    }

    return `${device} - ${browser}`;
  };

  // Función para obtener el color del chip según el estado
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  // Función para calcular la duración de la sesión
  const getSessionDuration = (loginAt: string, logoutAt?: string) => {
    const login = new Date(loginAt);
    const logout = logoutAt ? new Date(logoutAt) : new Date();
    const diff = logout.getTime() - login.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={PopupTransition}
      maxWidth="md"
      fullWidth
      aria-labelledby="user-sessions-title"
    >
      <DialogTitle id="user-sessions-title">
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
            <Avatar color="info" sx={{ width: 40, height: 40 }}>
              <Monitor />
            </Avatar>
            <Stack>
              <Typography variant="h5">Historial de Sesiones</Typography>
              <Typography variant="body2" color="text.secondary">
                Usuario: {userName}
              </Typography>
            </Stack>
          </Stack>
          <IconButton onClick={onClose} color="secondary">
            <CloseCircle />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {sessionsData.length === 0 ? (
              <ListItem>
                <ListItemText primary="No hay sesiones disponibles" secondary="Este usuario no tiene sesiones registradas" />
              </ListItem>
            ) : (
              sessionsData.map((session, index) => (
                <Box key={session.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar color={getStatusColor(session.isActive)} sx={{ width: 32, height: 32 }}>
                        {getDeviceIcon(session.userAgent)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1">{getDeviceInfo(session.userAgent)}</Typography>
                          <Chip
                            label={session.isActive ? 'Activa' : 'Finalizada'}
                            size="small"
                            color={getStatusColor(session.isActive)}
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack sx={{ gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>User Agent:</strong> {session.userAgent}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>IP:</strong> {session.ipAddress}
                          </Typography>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {session.location && (
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                                <Location size={14} />
                                <Typography variant="caption">{session.location}</Typography>
                              </Stack>
                            )}
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                              <Clock size={14} />
                              <Typography variant="caption">Inicio: {formatDate(session.loginAt)}</Typography>
                            </Stack>
                            {session.logoutAt && (
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                                <Clock size={14} />
                                <Typography variant="caption">Fin: {formatDate(session.logoutAt)}</Typography>
                              </Stack>
                            )}
                            <Typography variant="caption" color="primary.main">
                              Duración: {getSessionDuration(session.loginAt, session.logoutAt)}
                            </Typography>
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < sessionsData.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </List>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
