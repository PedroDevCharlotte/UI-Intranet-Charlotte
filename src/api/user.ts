import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher  }  from 'utils/axios';
import axios  from 'utils/axios';

// types
import { UserList, UserProps } from 'types/user';

const initialState: UserProps = {
  modal: false
};

// ==============================|| API - USER ||============================== //

// Función para validar y limpiar la estructura de datos del usuario para INSERT (sin id)
const validateUserStructureForInsert = (userData: any): {
  name: string;
  lastname: string;
  rol: string[];
  email: string;
  password: string;
} => {
  const validatedUser: any = {};
  
  // Para INSERT no incluimos el id - Solo copiamos los campos necesarios
  validatedUser.name = userData.name || '';
  validatedUser.lastname = userData.lastname || '';
  validatedUser.email = userData.email || '';
  validatedUser.password = userData.password || '';
  
  // Manejar rol como array
  if (userData.rol) {
    if (Array.isArray(userData.rol)) {
      validatedUser.rol = userData.rol;
    } else {
      validatedUser.rol = [userData.rol];
    }
  } else {
    validatedUser.rol = [];
  }
  
  return validatedUser;
};

// Función para validar y limpiar la estructura de datos del usuario para UPDATE (con id opcional)
const validateUserStructureForUpdate = (userData: any): any => {
  const validatedUser: any = {};
  
  // Para UPDATE solo incluir campos que existen
  if (userData.name !== undefined) validatedUser.name = userData.name;
  if (userData.lastname !== undefined) validatedUser.lastname = userData.lastname;
  if (userData.email !== undefined) validatedUser.email = userData.email;
  if (userData.password !== undefined) validatedUser.password = userData.password;
  
  if (userData.rol !== undefined) {
    if (Array.isArray(userData.rol)) {
      validatedUser.rol = userData.rol;
    } else {
      validatedUser.rol = [userData.rol];
    }
  }
  
  return validatedUser;
};

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
  delete: '/delete' // server URL
};

export function useGetUser() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    refreshInterval: 0,
    revalidateOnMount: true,
    // revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  console.log('useGetUser', data);

  const memoizedValue = useMemo(
    () => ({
      users: data?.users as UserList[] || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.users?.length
    }),
    [data, error, isLoading, isValidating]
  );
  console.log('memoizedValue', memoizedValue);
  return memoizedValue;
}
export async function insertUser(newUser: UserList) {
  try {
    console.log('Iniciando inserción de usuario:', newUser);
    
    // Crear estructura simple sin id - usando los nombres correctos del tipo UserList
    const userData = {
      name: newUser.firstName || newUser.name || '',
      lastname: newUser.lastName || '',
      rol: Array.isArray(newUser.role) ? [newUser.role] : [newUser.role || ''],
      email: newUser.email || '',
      password: (newUser as any).password || ''
    };
    
    console.log('Datos para enviar (INSERT):', userData);
    
    const response = await axios.post(endpoints.key + endpoints.insert, userData);
    
    console.log('insertUser response:', response.status, response.data);
    
    if ([200, 201].indexOf(response.status) == -1) {
      throw new Error(`Failed to insert user. Status: ${response.status}`);
    }

    console.log('Usuario insertado exitosamente, actualizando caché...');

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
    console.log(`Iniciando actualización del usuario con ID: ${userId}`, updatedUser);
    
    // Crear estructura simple con los campos necesarios
    const userData: any = {
      id: userId
    };
    
    // Solo agregar campos que existen
    if (updatedUser.firstName || updatedUser.name) {
      userData.name = updatedUser.firstName || updatedUser.name;
    }
    if (updatedUser.lastName) {
      userData.lastname = updatedUser.lastName;
    }
    if (updatedUser.email) {
      userData.email = updatedUser.email;
    }
    if (updatedUser.role) {
      userData.rol = [updatedUser.role];
    }
    if ((updatedUser as any).password) {
      userData.password = (updatedUser as any).password;
    }
    
    console.log('Datos para enviar (UPDATE):', userData);
    
    const response = await axios.put(endpoints.key + endpoints.update, userData);

    console.log('updateUser response:', response.status, response.data);

    if ([200, 201, 204].indexOf(response.status) == -1) {
      throw new Error(`Failed to update user. Status: ${response.status}`);
    }

    console.log('Usuario actualizado exitosamente, actualizando caché...');

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
    console.log(`Iniciando eliminación del usuario con ID: ${userId}`);
    
    // Validación de parámetros
    if (!userId || userId <= 0) {
      throw new Error('ID de usuario inválido');
    }
    
    // Opción alternativa: usar POST si el servidor lo requiere
    // const response = await axios.post(endpoints.key + endpoints.delete, { id: userId }, getRequestConfig());
    
    // Opción principal: DELETE con parámetro en URL
    const response = await axios.delete(`${endpoints.key}${endpoints.delete}/${userId}`, getRequestConfig());
    
    console.log(`Respuesta del servidor:`, response.status, response.data);
    
    if ([200, 201, 204].indexOf(response.status) == -1) {
      throw new Error(`Failed to delete user. Status: ${response.status}`);
    }

    console.log('Usuario eliminado exitosamente, actualizando caché...');
    
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

  console.log('useGetRoles - data:', data);
  console.log('useGetRoles - error:', error);
  console.log('useGetRoles - isLoading:', isLoading);

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

  console.log('useGetRoles - memoizedValue:', memoizedValue);
  return memoizedValue;
}

// ==============================|| API - DEPARTMENTS ||============================== //

export function useGetDepartments() {
  const { data, error, isLoading, mutate } = useSWR('/departments?includeInactive=false', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  console.log('useGetDepartments - data:', data);
  console.log('useGetDepartments - error:', error);
  console.log('useGetDepartments - isLoading:', isLoading);

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

  console.log('useGetDepartments - memoizedValue:', memoizedValue);
  return memoizedValue;
}
