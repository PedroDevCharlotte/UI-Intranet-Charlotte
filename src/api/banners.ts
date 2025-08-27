import useSWR, { mutate } from 'swr';
import axiosServices, { fetcher } from 'utils/axios';

const endpoints = {
  key: 'banners',
  list: '/banners',
  single: (id: number | string) => `/banners/${id}`
};

export function useGetBanners() {
  const { data, isLoading, error } = useSWR(endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    banners: data || [],
    bannersLoading: isLoading,
    bannersError: error
  };
}

export async function getBannerById(id: number) {
  const res = await axiosServices.get(endpoints.single(id));
  return res.data;
}

export async function createBanner(banner: any) {
  // support FormData for image uploads
  const isFormData = banner instanceof FormData;
  const res = await axiosServices.post(endpoints.list, banner, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  mutate(endpoints.list);
  return res.data;
}

export async function updateBanner(id: number, banner: any) {
  const isFormData = banner instanceof FormData;
  const res = await axiosServices.put(endpoints.single(id), banner, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  mutate(endpoints.list);
  mutate(endpoints.single(id));
  return res.data;
}

export async function deleteBanner(id: number) {
  const res = await axiosServices.delete(endpoints.single(id));
  mutate(endpoints.list);
  return res.data;
}
