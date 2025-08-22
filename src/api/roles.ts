import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

const endpoints = {
  key: 'roles',
  base: '/roles'
};

export function useGetRoles(includeInactive: boolean = false) {
  const url = `${endpoints.base}?includeInactive=${includeInactive}`;
  const { data, error, isLoading, isValidating, mutate: rolesMutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      roles: Array.isArray(data) ? data : [],
      rolesLoading: isLoading,
      rolesError: error,
      rolesEmpty: !isLoading && (!Array.isArray(data) || data.length === 0),
      rolesValidating: isValidating,
      rolesMutate
    }),
    [data, error, isLoading, isValidating, rolesMutate]
  );

  return memoizedValue;
}

export async function getRoleById(id: number) {
  try {
    const response = await axiosServices.get(`${endpoints.base}/${id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('getRoleById error', error);
    return { success: false, status: error.response?.status || 500, error: error.message };
  }
}

export async function createRole(payload: any) {
  try {
    const response = await axiosServices.post(endpoints.base, payload);
    mutate(`${endpoints.base}`);
    return { success: true, status: response.status, data: response.data, message: 'Rol creado correctamente' };
  } catch (error: any) {
    console.error('createRole error', error);
    return { success: false, status: error.response?.status || 500, error: error.response?.data || error.message };
  }
}

export async function updateRole(roleId: number, payload: any) {
  try {
    const response = await axiosServices.patch(`${endpoints.base}/${roleId}`, payload);
    mutate(`${endpoints.base}`);
    mutate(`${endpoints.base}/${roleId}`);
    return { success: true, status: response.status, data: response.data, message: 'Rol actualizado correctamente' };
  } catch (error: any) {
    console.error('updateRole error', error);
    return { success: false, status: error.response?.status || 500, error: error.response?.data || error.message };
  }
}

export async function deleteRole(roleId: number) {
  try {
    const response = await axiosServices.delete(`${endpoints.base}/${roleId}`);
    mutate(`${endpoints.base}`);
    return { success: true, status: response.status, data: response.data, message: 'Rol eliminado correctamente' };
  } catch (error: any) {
    console.error('deleteRole error', error);
    return { success: false, status: error.response?.status || 500, error: error.response?.data || error.message };
  }
}

export async function updateRolePermissions(roleId: number, permissions: string[]) {
  try {
    const response = await axiosServices.patch(`${endpoints.base}/${roleId}/permissions`, { permissions });
    mutate(`${endpoints.base}`);
    mutate(`${endpoints.base}/${roleId}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error: any) {
    console.error('updateRolePermissions error', error);
    return { success: false, status: error.response?.status || 500, error: error.response?.data || error.message };
  }
}

export async function activateRole(roleId: number) {
  try {
    const response = await axiosServices.patch(`${endpoints.base}/${roleId}/activate`);
    mutate(`${endpoints.base}`);
    mutate(`${endpoints.base}/${roleId}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error: any) {
    console.error('activateRole error', error);
    return { success: false, status: error.response?.status || 500, error: error.response?.data || error.message };
  }
}

export async function deactivateRole(roleId: number) {
  try {
    const response = await axiosServices.patch(`${endpoints.base}/${roleId}/deactivate`);
    mutate(`${endpoints.base}`);
    mutate(`${endpoints.base}/${roleId}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error: any) {
    console.error('deactivateRole error', error);
    return { success: false, status: error.response?.status || 500, error: error.response?.data || error.message };
  }
}
