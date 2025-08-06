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
import { getUserHistory } from 'api/user';

// assets
import { Calendar, Edit, User, Clock, CloseCircle } from 'iconsax-react';

// types
interface UserHistoryItem {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  changes?: any;
  userId: number;
  userEmail?: string;
  createdAt: string;
  description?: string;
  // Nuevos campos del formato de la API
  oldValues?: string;
  newValues?: string;
  changedFields?: string;
}

interface ChangeDetail {
  field: string;
  from: string | null;
  to: string;
  displayText: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

// ==============================|| USER HISTORY MODAL ||============================== //

export default function UserHistoryModal({ open, onClose, userId, userName }: Props) {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<UserHistoryItem[]>([]);

  // Función para obtener el historial del usuario
  const fetchUserHistory = async () => {
    setLoading(true);
    try {
      const response = await getUserHistory(userId, 50);
      
      if (response.success) {
        setHistoryData(response.data);
      } else {
        console.error('Error al cargar historial:', response.error);
        setHistoryData([]);
      }
    } catch (error) {
      console.error('Error al cargar el historial:', error);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      fetchUserHistory();
    }
  }, [open, userId]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el color del chip según la acción
  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'primary';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  // Función para obtener el icono según la acción
  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <User size={20} />;
      case 'UPDATE':
        return <Edit size={20} />;
      case 'DELETE':
        return <Edit size={20} />;
      default:
        return <Edit size={20} />;
    }
  };

  // Función para obtener la descripción del cambio
  const getChangeDescription = (item: UserHistoryItem) => {
    if (item.description) {
      return item.description;
    }
    
    // Generar descripción basada en la acción
    switch (item.action.toUpperCase()) {
      case 'CREATE':
        return 'Usuario creado en el sistema';
      case 'UPDATE':
        return 'Información del usuario actualizada';
      case 'DELETE':
        return 'Usuario eliminado del sistema';
      default:
        return `Acción ${item.action} realizada`;
    }
  };

  // Función para obtener los detalles de los cambios con formato mejorado
  const getChangeDetails = (item: UserHistoryItem) => {
    // Nuevo formato de la API con oldValues, newValues y changedFields
    if (item.oldValues && item.newValues && item.changedFields) {
      try {
        const oldData = JSON.parse(item.oldValues);
        const newData = JSON.parse(item.newValues);
        const changedFieldsList = JSON.parse(item.changedFields);
        
        return changedFieldsList.map((field: string) => {
          const fieldName = getFieldDisplayName(field);
          const oldValue = oldData[field];
          const newValue = newData[field];
          
          return {
            field: fieldName,
            from: oldValue !== undefined ? formatValue(oldValue) : 'Sin valor',
            to: formatValue(newValue),
            displayText: `${fieldName}: "${formatValue(oldValue)}" → "${formatValue(newValue)}"`
          };
        });
      } catch (error) {
        console.error('Error parsing change data:', error);
        return null;
      }
    }
    
    // Formato anterior con changes (mantener compatibilidad)
    if (!item.changes || typeof item.changes !== 'object') {
      return null;
    }
    
    // Manejar diferentes formatos de datos de cambios
    let changesData = item.changes;
    
    // Si changes tiene una propiedad 'changes' anidada (formato de algunos APIs)
    if (changesData.changes && typeof changesData.changes === 'object') {
      changesData = changesData.changes;
    }
    
    // Si changes es un array de cambios
    if (Array.isArray(changesData)) {
      return changesData.map((change: any, index: number) => {
        if (change && typeof change === 'object') {
          if (change.field && ('oldValue' in change || 'newValue' in change)) {
            // Formato: { field: 'nombre', oldValue: 'valor_anterior', newValue: 'valor_nuevo' }
            return {
              field: getFieldDisplayName(change.field),
              from: change.oldValue !== undefined ? formatValue(change.oldValue) : null,
              to: formatValue(change.newValue),
              displayText: `${getFieldDisplayName(change.field)}: "${formatValue(change.oldValue)}" → "${formatValue(change.newValue)}"`
            };
          } else if (change.field && ('from' in change || 'to' in change)) {
            // Formato: { field: 'nombre', from: 'valor_anterior', to: 'valor_nuevo' }
            return {
              field: getFieldDisplayName(change.field),
              from: change.from !== undefined ? formatValue(change.from) : null,
              to: formatValue(change.to),
              displayText: `${getFieldDisplayName(change.field)}: "${formatValue(change.from)}" → "${formatValue(change.to)}"`
            };
          }
        }
        return {
          field: `Campo ${index + 1}`,
          from: null,
          to: formatValue(change),
          displayText: `Campo ${index + 1}: ${formatValue(change)}`
        };
      });
    }
    
    // Si changes es un objeto con propiedades
    const changes = Object.entries(changesData);
    if (changes.length === 0) {
      return null;
    }
    
    return changes.map(([field, change]: [string, any]) => {
      const fieldName = getFieldDisplayName(field);
      
      // Formato: { campo: { from: 'valor_anterior', to: 'valor_nuevo' } }
      if (change && typeof change === 'object' && 'from' in change && 'to' in change) {
        const fromValue = formatValue(change.from);
        const toValue = formatValue(change.to);
        return {
          field: fieldName,
          from: fromValue,
          to: toValue,
          displayText: `${fieldName}: "${fromValue}" → "${toValue}"`
        };
      }
      
      // Formato: { campo: { oldValue: 'valor_anterior', newValue: 'valor_nuevo' } }
      if (change && typeof change === 'object' && ('oldValue' in change || 'newValue' in change)) {
        const fromValue = change.oldValue !== undefined ? formatValue(change.oldValue) : null;
        const toValue = formatValue(change.newValue);
        return {
          field: fieldName,
          from: fromValue,
          to: toValue,
          displayText: fromValue ? `${fieldName}: "${fromValue}" → "${toValue}"` : `${fieldName}: ${toValue}`
        };
      }
      
      // Formato: { campo: 'valor_nuevo' } (sin valor anterior)
      return {
        field: fieldName,
        from: null,
        to: formatValue(change),
        displayText: `${fieldName}: ${formatValue(change)}`
      };
    });
  };

  // Función para obtener nombres de campo más amigables
  const getFieldDisplayName = (field: string): string => {
    const fieldNames: { [key: string]: string } = {
      'id': 'ID',
      'firstName': 'Nombre',
      'lastName': 'Apellido',
      'fullName': 'Nombre Completo',
      'name': 'Nombre',
      'email': 'Correo Electrónico',
      'role': 'Rol',
      'roleId': 'ID del Rol',
      'roleName': 'Nombre del Rol',
      'department': 'Departamento',
      'departmentId': 'ID del Departamento',
      'departmentName': 'Nombre del Departamento',
      'active': 'Estado Activo',
      'status': 'Estado',
      'isActive': 'Activo',
      'isBlocked': 'Bloqueado',
      'blocked': 'Bloqueado',
      'isTwoFactorEnabled': 'Autenticación 2FA',
      'twoFactorEnabled': 'Autenticación 2FA',
      'password': 'Contraseña',
      'passwordChanged': 'Contraseña Cambiada',
      'daysToPasswordExpiration': 'Días para Expiración de Contraseña',
      'lastLogin': 'Último Acceso',
      'loginAttempts': 'Intentos de Acceso',
      'phone': 'Teléfono',
      'phoneNumber': 'Número de Teléfono',
      'position': 'Posición',
      'jobTitle': 'Título del Trabajo',
      'createdAt': 'Fecha de Creación',
      'updatedAt': 'Fecha de Actualización',
      'createdBy': 'Creado Por',
      'updatedBy': 'Actualizado Por'
    };
    
    return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Función para formatear valores
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'Sin valor';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Activo' : 'Inactivo';
    }
    
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return 'Vacío';
      }
      
      // Formatear fechas si parece ser una fecha ISO
      if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        try {
          const date = new Date(value);
          return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return value;
        }
      }
      
      return value;
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    if (typeof value === 'object' && value !== null) {
      // Si es un objeto con propiedades name o title, mostrar eso
      if (value.name) {
        return value.name;
      }
      if (value.title) {
        return value.title;
      }
      if (value.label) {
        return value.label;
      }
      
      // Si no, convertir a JSON de forma más legible
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Objeto]';
      }
    }
    
    return String(value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={PopupTransition}
      maxWidth="md"
      fullWidth
      aria-labelledby="user-history-title"
    >
      <DialogTitle id="user-history-title">
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
            <Avatar color="primary" sx={{ width: 40, height: 40 }}>
              <Calendar />
            </Avatar>
            <Stack>
              <Typography variant="h5">Historial de Cambios</Typography>
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
            {historyData.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No hay historial disponible"
                  secondary="Este usuario no tiene cambios registrados"
                />
              </ListItem>
            ) : (
              historyData.map((item, index) => (
                <Box key={item.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar color={getActionColor(item.action)} sx={{ width: 32, height: 32 }}>
                        {getActionIcon(item.action)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1">{getChangeDescription(item)}</Typography>
                          <Chip 
                            label={item.action.toUpperCase()} 
                            size="small" 
                            color={getActionColor(item.action)}
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack sx={{ gap: 1 }}>
                          {(() => {
                            const changeDetails = getChangeDetails(item);
                            if (changeDetails && changeDetails.length > 0) {
                              return (
                                <Stack sx={{ gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Cambios realizados:</strong>
                                  </Typography>
                                  {changeDetails.map((change: ChangeDetail, idx: number) => (
                                    <Stack
                                      key={idx}
                                      sx={{
                                        bgcolor: 'grey.50',
                                        p: 1,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'grey.200'
                                      }}
                                    >
                                      <Typography variant="body2" color="text.primary">
                                        <strong>{change.field}</strong>
                                      </Typography>
                                      {change.from !== null ? (
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              bgcolor: 'error.lighter',
                                              color: 'error.main',
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: 0.5,
                                              fontFamily: 'monospace'
                                            }}
                                          >
                                            Anterior: {change.from}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            →
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              bgcolor: 'success.lighter',
                                              color: 'success.main',
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: 0.5,
                                              fontFamily: 'monospace'
                                            }}
                                          >
                                            Nuevo: {change.to}
                                          </Typography>
                                        </Stack>
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            bgcolor: 'info.lighter',
                                            color: 'info.main',
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 0.5,
                                            fontFamily: 'monospace'
                                          }}
                                        >
                                          Valor: {change.to}
                                        </Typography>
                                      )}
                                    </Stack>
                                  ))}
                                </Stack>
                              );
                            }
                            return null;
                          })()}
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                              <User size={14} />
                              <Typography variant="caption">
                                {item.userEmail || `Usuario ID: ${item.userId}`}
                              </Typography>
                            </Stack>
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                              <Clock size={14} />
                              <Typography variant="caption">
                                {formatDate(item.createdAt)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < historyData.length - 1 && <Divider />}
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
