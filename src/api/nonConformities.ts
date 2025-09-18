import useSWR from 'swr';
import axiosServices, { fetcher } from 'utils/axios';
import { mutate } from 'swr';

const endpointKey = 'non-conformities';
const endpoints = {
  key: endpointKey,
  base: '/non-conformities'
};

export function useGetNonConformities() {
  const { data, error, isLoading, mutate } = useSWR(endpoints.key , fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    items: (data ?? []) as any[],
    loading: isLoading,
    error,
    mutate
  };
}

export async function createNonConformity(payload: any) {
  try {
    const response = await axiosServices.post(endpoints.base, payload);
    mutate(endpoints.key );
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

export async function updateNonConformity(id: number, payload: any) {
  try {
    const response = await axiosServices.put(`${endpoints.base}/${id}`, payload);
    mutate(endpoints.key );
    mutate(`${endpoints.base}/${id}`);
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

export async function deleteNonConformity(id: number) {
  try {
    const response = await axiosServices.delete(`${endpoints.base}/${id}`);
    mutate(endpoints.key + '?limit=1000');
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}
