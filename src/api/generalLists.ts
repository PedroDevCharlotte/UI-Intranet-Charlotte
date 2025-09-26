import useSWR from 'swr';
import axiosServices, { fetcher } from 'utils/axios';

// Endpoints para listas generales
const endpoints = {
  base: '/general-lists',
  byCode: (code: string) => `/general-lists/by-code/${code}`,
  options: (listId: number | string) => `/general-lists/${listId}/options`
};

// Hook para obtener opciones de una lista por ID
export function useGetListOptions(listId: number | string, enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? endpoints.options(listId) : null, 
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    options: (data ?? []) as any[],
    loading: isLoading,
    error,
    mutate
  };
}

// Hook para obtener opciones de una lista por código
export function useGetListOptionsByCode(code: string, enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? endpoints.byCode(code) + '/options' : null, 
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    options: (data ?? []) as any[],
    loading: isLoading,
    error,
    mutate
  };
}

// Función para obtener opciones de una lista específica
export async function getListOptions(listId: number | string) {
  try {
    const response = await axiosServices.get(endpoints.options(listId));
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

// Función para obtener opciones por código de lista
export async function getListOptionsByCode(code: string) {
  try {
    const response = await axiosServices.get(endpoints.byCode(code) + '/options');
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

// Constantes para los códigos de listas de no conformidades
export const NC_LIST_CODES = {
  TYPES: 'NC_TYPE',
  AREAS: 'NC_AREA_PROCESO', 
  STATUS: 'NC_STATUS'
} as const;

// IDs de las listas (para uso directo)
export const NC_LIST_IDS = {
  TYPES: 6,
  AREAS: 7,
  STATUS: 8
} as const;