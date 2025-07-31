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
    const response = await axios.post(endpoints.key + endpoints.insert, newUser);
    console.log('insertUser response', response);
    if ([200, 201].indexOf(response.status) == -1) throw new Error('Failed to insert user');

    // Actualiza el caché local
    mutate(endpoints.key + endpoints.list);

    return response.data;
  } catch (error) {
    console.error('Error inserting user:', error);
    let errorMessage = 'Error al insertar el usuario';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message?: string }).message || errorMessage;
    }
    return { error: errorMessage };
  }
}


export async function updateUser(userId: number, updatedUser: Partial<UserList>) {
  try {
    const response = await axios.put(endpoints.key + endpoints.update, {
      id: userId,
      ...updatedUser
    });

    if ([200, 201].indexOf(response.status) == -1) throw new Error('Failed to update user');

    // Actualiza el caché local
    mutate(endpoints.key + endpoints.list);

    return response.data;
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    let errorMessage = 'Error al actualizar el usuario';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message?: string }).message || errorMessage;
    }
    return { error: errorMessage };
  }
}


export async function deleteUser(userId: number) {
  try {
    const response = await axios.delete(endpoints.key + endpoints.delete, {
      data: { id: userId }
    });
    if ([200, 201].indexOf(response.status) == -1) throw new Error('Failed to delete user');

    // Actualiza el caché local
    mutate(endpoints.key + endpoints.list);

    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    let errorMessage = 'Error al eliminar el usuario, por favor intente de nuevo o contacte al administrador';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message?: string }).message || errorMessage;
    }
    return { error: errorMessage };
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
