import useSWR from 'swr';
import axiosServices, { fetcher } from 'utils/axios';
import { mutate } from 'swr';

const endpointKey = 'non-conformities';
const endpoints = {
  key: endpointKey,
  base: '/non-conformities'
};

export function useGetNonConformities() {
  const { data, error, isLoading, mutate } = useSWR(endpoints.key, fetcher, {
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
    mutate(endpoints.key);
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

export async function updateNonConformity(id: number, payload: any) {
  try {
    const response = await axiosServices.put(`${endpoints.base}/${id}`, payload);
    mutate(endpoints.key);
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

export async function createNonConformityFromTicket(ticketId: number, motivo: string) {
  try {
    const response = await axiosServices.post(`/tickets/${ticketId}/non-conformity`, { motivo });
    mutate(endpoints.key);
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

export async function cancelNonConformity(id: number, reason: string) {
  try {
    const response = await axiosServices.post(`${endpoints.base}/${id}/cancel`, { reason });
    mutate(endpoints.key);
    mutate(`${endpoints.base}/${id}`);
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

export async function createNonConformityWithFormData(formData: FormData) {
  try {
    const response = await axiosServices.post(endpoints.base, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    mutate(endpoints.key);
    return response.data;
  } catch (err: any) {
    if (err.response?.data) throw err.response.data;
    throw err;
  }
}

export const getNonConformityById = async (id: string) => {
  try {
    const response = await axiosServices.get(`/non-conformities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching non-conformity by ID:', error);
    throw error;
  }
};

export const getNextConsecutiveNumber = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const response = await axiosServices.get(`/non-conformities/next-number/${currentYear}`);
    return response.data.nextNumber;
  } catch (error) {
    console.error('Error fetching next consecutive number:', error);
    // Fallback: generar número basado en el año actual
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    return `NC-${yearSuffix}-01`;
  }
};

export const generateNonConformityPdf = async (id: number): Promise<Blob> => {
  try {
    const response = await axiosServices.get(`/non-conformities/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
