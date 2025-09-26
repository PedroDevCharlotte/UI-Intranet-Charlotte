import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from '../utils/axios';
import axios from '../utils/axios';

// types
import { UserList, UserProps } from 'types/user';
import { isArray } from 'lodash-es';

const initialState: UserProps = {
  modal: false
};

// ==============================|| API - USER ||============================== //

// NOTE: helper validators were removed to reduce unused-symbol lint noise.
// If needed, reintroduce small validators closer to the caller.

// Configuración común para requests
const getRequestConfig = () => ({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const endpoints = {
  key: 'user',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete', // server URL
  disable2fa: '/auth/2fa/disable', // server URL for disabling 2FA
  // Nuevos endpoints para historial
  auditHistory: '/audit/entity/User', // historial de cambios de una entidad
  userHistory: '/audit/user', // historial de cambios por usuario
  userSessions: '/audit/admin/sessions', // sesiones de usuario (admin)
  activeSessions: '/audit/sessions/active' // sesiones activas
};

export function useGetUser() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    refreshInterval: 0,
    revalidateOnMount: true,
    // revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  // console.log('useGetUser', data);

  const memoizedValue = useMemo(
    () => ({
      users: (data?.users as UserList[]) || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.users?.length
    }),
    [data, error, isLoading, isValidating]
  );
  // console.log('memoizedValue', memoizedValue);
  return memoizedValue;
}

// Obtener todos los usuarios que pueden atender tickets (técnicos)
export function useGetSupportUsers() {
  const { data, isLoading, error, isValidating } = useSWR('user/support-list', fetcher, {
    refreshInterval: 0,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return useMemo(
    () => ({
      supportUsers: data && isArray(data) ? data.map((user: any) => ({ ...user, fullName: `${user.firstName} ${user.lastName}` })) : [],
      supportUsersLoading: isLoading,
      supportUsersError: error,
      supportUsersValidating: isValidating,
      supportUsersEmpty: !isLoading && (!data || data.length === 0)
    }),
    [data, error, isLoading, isValidating]
  );
}

export async function insertUser(newUser: UserList) {
  try {
    // console.log('Iniciando inserción de usuario:', newUser);

    // Crear estructura simple sin id - usando los nombres correctos del tipo UserList
    // const userData = {
    //   name: newUser.firstName || newUser.name || '',
    //   lastname: newUser.lastName || '',
    //   rol: Array.isArray(newUser.role) ? [newUser.role] : [newUser.role || ''],
    //   email: newUser.email || '',
    //   password: (newUser as any).password || ''
    // };
    let userData = newUser;
    // console.log('Datos para enviar (INSERT):', userData);

    const response = await axios.post(endpoints.key + endpoints.insert, userData);

    // console.log('insertUser response:', response.status, response.data);

    if ([200, 201].indexOf(response.status) == -1) {
      throw new Error(`Failed to insert user. Status: ${response.status}`);
    }

    // console.log('Usuario insertado exitosamente, actualizando caché...');

    // Actualiza el caché local
    mutate(endpoints.key + endpoints.list);

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Usuario creado correctamente'
    };
  } catch (error: any) {
    console.error('Error inserting user:', error);
    console.error('Error details:', error.response?.data);

    let errorMessage = 'Error al crear el usuario, por favor intente de nuevo o contacte al administrador';

    // Manejo de errores simplificado
    if (error.response?.status === 400) {
      errorMessage = 'Datos inválidos. Verifique que todos los campos requeridos estén completos y sean válidos.';
      if (error.response?.data?.message) {
        errorMessage += ` Detalle: ${error.response.data.message}`;
      }
    } else if (error.response?.status === 401) {
      errorMessage = 'No tiene permisos para crear usuarios.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Acceso denegado. No tiene autorización para esta acción.';
    } else if (error.response?.status === 409) {
      errorMessage = 'El usuario ya existe. Verifique el email o nombre de usuario.';
    } else if (error.response?.status === 422) {
      errorMessage = 'Datos no válidos. Verifique el formato de los campos.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error interno del servidor. Por favor intente más tarde.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
      status: error.response?.status || 500,
      success: false
    };
  }
}

export async function updateUser(userId: number, updatedUser: Partial<UserList>) {
  try {
    // console.log(`Iniciando actualización del usuario con ID: ${userId}`, updatedUser);

    // Crear estructura simple con los campos necesarios
    const userData: any = {
      ...updatedUser,
      id: userId
    };

    // console.log('Datos para enviar (UPDATE):', userData);

    const response = await axios.put(endpoints.key + endpoints.update, userData);

    // console.log('updateUser response:', response.status, response.data);

    if ([200, 201, 204].indexOf(response.status) == -1) {
      throw new Error(`Failed to update user. Status: ${response.status}`);
    }

    // console.log('Usuario actualizado exitosamente, actualizando caché...');

    // Actualiza el caché local
    mutate(endpoints.key + endpoints.list);

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Usuario actualizado correctamente'
    };
  } catch (error: any) {
    console.error('Error al actualizar el usuario:', error);
    console.error('Error details:', error.response?.data);

    let errorMessage = 'Error al actualizar el usuario, por favor intente de nuevo o contacte al administrador';

    // Manejo de errores simplificado
    if (error.response?.status === 400) {
      errorMessage = 'Datos inválidos. Verifique que todos los campos sean válidos.';
      if (error.response?.data?.message) {
        errorMessage += ` Detalle: ${error.response.data.message}`;
      }
    } else if (error.response?.status === 401) {
      errorMessage = 'No tiene permisos para actualizar este usuario.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Acceso denegado. No tiene autorización para esta acción.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Usuario no encontrado. Es posible que haya sido eliminado.';
    } else if (error.response?.status === 409) {
      errorMessage = 'Conflicto: El email o nombre de usuario ya está en uso.';
    } else if (error.response?.status === 422) {
      errorMessage = 'Datos no válidos. Verifique el formato de los campos.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error interno del servidor. Por favor intente más tarde.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
      status: error.response?.status || 500,
      success: false
    };
  }
}

export async function deleteUser(userId: number) {
  try {
    // console.log(`Iniciando eliminación del usuario con ID: ${userId}`);

    // Validación de parámetros
    if (!userId || userId <= 0) {
      throw new Error('ID de usuario inválido');
    }

    // Opción alternativa: usar POST si el servidor lo requiere
    // const response = await axios.post(endpoints.key + endpoints.delete, { id: userId }, getRequestConfig());

    // Opción principal: DELETE con parámetro en URL
    const response = await axios.delete(`${endpoints.key}${endpoints.delete}/${userId}`, getRequestConfig());

    // console.log(`Respuesta del servidor:`, response.status, response.data);

    if ([200, 201, 204].indexOf(response.status) == -1) {
      throw new Error(`Failed to delete user. Status: ${response.status}`);
    }

    // console.log('Usuario eliminado exitosamente, actualizando caché...');

    // Actualiza el caché local
    mutate(endpoints.key + endpoints.list);

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Usuario eliminado correctamente'
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    let errorMessage = 'Error al eliminar el usuario, por favor intente de nuevo o contacte al administrador';

    // Mejor manejo de errores con más detalles
    if (error.message === 'ID de usuario inválido') {
      errorMessage = 'ID de usuario inválido. No se puede eliminar el usuario.';
    } else if (error.response?.status === 400) {
      errorMessage = 'Solicitud inválida. Verifique que el usuario existe y puede ser eliminado.';
    } else if (error.response?.status === 401) {
      errorMessage = 'No tiene permisos para eliminar este usuario.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Acceso denegado. No tiene autorización para esta acción.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Usuario no encontrado. Es posible que ya haya sido eliminado.';
    } else if (error.response?.status === 409) {
      errorMessage = 'No se puede eliminar el usuario porque tiene dependencias activas.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Por favor espere un momento antes de intentar nuevamente.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error interno del servidor. Por favor intente más tarde.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message && !error.message.includes('Failed to delete')) {
      errorMessage = error.message;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tiempo de espera agotado. Verifique su conexión a internet.';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Error de red. Verifique su conexión a internet.';
    }

    return {
      error: errorMessage,
      status: error.response?.status || 500,
      success: false
    };
  }
}

export function useGetUserMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      userMaster: data,
      userMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

// Asignar tipos de soporte a un usuario
export async function assignSupportTypes(userId: number, supportTypeIds: number[]) {
  try {
    if (!userId || userId <= 0) {
      throw new Error('ID de usuario inválido');
    }

    const response = await axios.put(`/user/${userId}/support-types`, { supportTypeIds }, getRequestConfig());

    if ([200, 201, 204].indexOf(response.status) === -1) {
      throw new Error(`Failed to assign support types. Status: ${response.status}`);
    }

    // Invalidar/actualizar cache de usuarios
    mutate(endpoints.key + endpoints.list);
    mutate(endpoints.key);

    return { success: true, status: response.status, data: response.data };
  } catch (error: any) {
    console.error('Error assigning support types:', error);
    return { success: false, status: error.response?.status || 500, error: error.message || 'Error desconocido' };
  }
}

export function handlerUserDialog(modal: boolean) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentUserMaster: any) => {
      return { ...currentUserMaster, modal };
    },
    true
  );
}

// ==============================|| API - ROLES ||============================== //

export function useGetRoles() {
  const { data, error, isLoading, mutate } = useSWR('/roles?includeInactive=false', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      roles: Array.isArray(data) ? data : [],
      rolesLoading: isLoading,
      rolesError: error,
      rolesEmpty: !isLoading && (!Array.isArray(data) || !data.length),
      rolesValidating: isLoading,
      rolesMutate: mutate
    }),
    [data, error, isLoading, mutate]
  );

  // console.log('useGetRoles - memoizedValue:', memoizedValue);
  return memoizedValue;
}

// Obtener tipos de soporte disponibles
export function useGetSupportTypes() {
  const { data, error, isLoading, mutate } = useSWR('/ticket-types', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  let supportTypes: any = [];
  if (Array.isArray(data)) {
    // Do something with the array
    supportTypes = data.map((type) => ({
      id: type.id,
      name: type.name,
      description: type.description
    }));
  }

  const memoizedValue = useMemo(
    () => ({
      supportTypes: Array.isArray(supportTypes) ? supportTypes : [],
      supportTypesLoading: isLoading,
      supportTypesError: error,
      supportTypesMutate: mutate
    }),
    [data, error, isLoading, mutate]
  );

  return memoizedValue;
}

// ==============================|| API - 2FA ||============================== //

export async function disable2FA(userId: number, authCode?: string, from: boolean = false) {
  try {
    // console.log(`Iniciando deshabilitación de 2FA para usuario con ID: ${userId}`);

    // Validación de parámetros
    if (!userId || userId <= 0) {
      throw new Error('ID de usuario inválido');
    }

    // Validación del código de autenticación si se proporciona
    if (authCode && !/^\d{6}$/.test(authCode)) {
      throw new Error('Código de autenticación debe tener 6 dígitos');
    }

    const requestData = authCode ? { userId, token: authCode, from } : { userId, from };
    const response = await axios.post(endpoints.disable2fa, requestData, getRequestConfig());

    // console.log(`Respuesta del servidor (disable2FA):`, response.status, response.data);

    if ([200, 201, 204].indexOf(response.status) === -1) {
      throw new Error(`Failed to disable 2FA. Status: ${response.status}`);
    }

    // console.log('2FA deshabilitado exitosamente, actualizando caché...');

    // Actualiza el caché local para reflejar el cambio
    mutate(endpoints.key + endpoints.list);

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Autenticación de dos factores deshabilitada correctamente'
    };
  } catch (error: any) {
    console.error('Error disabling 2FA:', error);
    let errorMessage = 'Error al deshabilitar 2FA, por favor intente de nuevo o contacte al administrador';

    // Manejo de errores específicos
    if (error.message === 'ID de usuario inválido') {
      errorMessage = 'ID de usuario inválido. No se puede deshabilitar 2FA.';
    } else if (error.response?.status === 400) {
      errorMessage = 'Solicitud inválida. Verifique que el usuario tiene 2FA habilitado.';
      if (error.response?.data?.message) {
        errorMessage += ` Detalle: ${error.response.data.message}`;
      }
    } else if (error.response?.status === 401) {
      errorMessage = 'No tiene permisos para deshabilitar 2FA para este usuario.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Acceso denegado. No tiene autorización para esta acción.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Usuario no encontrado o no tiene 2FA habilitado.';
    } else if (error.response?.status === 409) {
      errorMessage = 'Conflicto: El usuario no tiene 2FA habilitado actualmente.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error interno del servidor. Por favor intente más tarde.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
      status: error.response?.status || 500,
      success: false
    };
  }
}

// ==============================|| API - DEPARTMENTS ||============================== //

export function useGetDepartments() {
  const { data, error, isLoading, mutate } = useSWR('/departments?includeInactive=false', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      departments: Array.isArray(data) ? data : [],
      departmentsLoading: isLoading,
      departmentsError: error,
      departmentsEmpty: !isLoading && (!Array.isArray(data) || !data.length),
      departmentsValidating: isLoading,
      departmentsMutate: mutate
    }),
    [data, error, isLoading, mutate]
  );

  return memoizedValue;
}

// ==============================|| API - USER HISTORY ||============================== //

export async function getUserHistory(userId: number, limit: number = 50) {
  try {
    // console.log(`Obteniendo historial de cambios para usuario con ID: ${userId}`);

    if (!userId || userId <= 0) {
      throw new Error('ID de usuario inválido');
    }

    const response = await axios.get(`${endpoints.auditHistory}/${userId}?limit=${limit}`, getRequestConfig());

    // console.log(`Respuesta del servidor (getUserHistory):`, response.status, response.data);

    if ([200, 201].indexOf(response.status) === -1) {
      throw new Error(`Error al obtener historial. Status: ${response.status}`);
    }

    return {
      status: response.status,
      data: response.data || [],
      success: true,
      message: 'Historial obtenido correctamente'
    };
  } catch (error: any) {
    console.error('Error al obtener historial de usuario:', error);

    return {
      status: error.response?.status || 500,
      data: [],
      success: false,
      error: error.response?.data?.message || error.message || 'Error inesperado al obtener historial'
    };
  }
}

// ==============================|| API - USER SESSIONS ||============================== //

export async function getUserSessions(userId: number, limit: number = 20) {
  try {
    // console.log(`Obteniendo historial de sesiones para usuario con ID: ${userId}`);

    if (!userId || userId <= 0) {
      throw new Error('ID de usuario inválido');
    }

    const response = await axios.get(`${endpoints.userSessions}/${userId}?limit=${limit}`, getRequestConfig());

    // console.log(`Respuesta del servidor (getUserSessions):`, response.status, response.data);

    if ([200, 201].indexOf(response.status) === -1) {
      throw new Error(`Error al obtener sesiones. Status: ${response.status}`);
    }

    return {
      status: response.status,
      data: response.data || [],
      success: true,
      message: 'Sesiones obtenidas correctamente'
    };
  } catch (error: any) {
    console.error('Error al obtener sesiones de usuario:', error);

    return {
      status: error.response?.status || 500,
      data: [],
      success: false,
      error: error.response?.data?.message || error.message || 'Error inesperado al obtener sesiones'
    };
  }
}

// ==============================|| API - ACTIVE SESSIONS ||============================== //

export async function getActiveSessions() {
  try {
    const response = await axios.get(endpoints.activeSessions, getRequestConfig());
    if ([200, 201].indexOf(response.status) === -1) {
      throw new Error(`Error al obtener sesiones activas. Status: ${response.status}`);
    }

    return {
      status: response.status,
      data: response.data || [],
      success: true,
      message: 'Sesiones activas obtenidas correctamente'
    };
  } catch (error: any) {
    console.error('Error al obtener sesiones activas:', error);

    return {
      status: error.response?.status || 500,
      data: [],
      success: false,
      error: error.response?.data?.message || error.message || 'Error inesperado al obtener sesiones activas'
    };
  }
}

// ==============================|| LOGOUT FUNCTION ||============================== //

export async function logoutUser() {
  try {
    const config = getRequestConfig();
    const response = await axios.post('/auth/logout', {}, config);

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Sesión cerrada correctamente'
    };
  } catch (error: any) {
    console.error('Error en logout:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error inesperado al cerrar sesión'
    };
  }
}
