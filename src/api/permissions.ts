import useSWR from 'swr';
import { fetcher } from 'utils/axios';
import axios from 'utils/axios';

const base = '/permissions';

export function useGetPermissions() {
  const { data, error, isLoading, mutate } = useSWR(base, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    permissions: Array.isArray(data) ? data : [],
    permissionsLoading: isLoading,
    permissionsError: error,
    permissionsMutate: mutate
  };
}

export async function getAllPermissions() {
  try {
    const res = await axios.get(base);
    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('getAllPermissions error', error);
    return { success: false, status: error.response?.status || 500, error: error.message };
  }
}
