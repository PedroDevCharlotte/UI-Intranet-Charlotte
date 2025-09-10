// Reorder banners
export async function reorderBanners(order: { id: number; order: number }[]) {
  const res = await axiosServices.post('/banners/reorder', { order });
  mutate(endpoints.list);
  return res.data;
}
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
  const urlApi = import.meta.env.VITE_APP_API_URL || '';

  const bannersWithImageUrl =
    Array.isArray(data) && data.length > 0
      ? data.map((banner: any) => ({
          ...banner,
          imagePreviewUrl: banner.oneDriveFileId
            ? `${urlApi}/onedrive/file/${banner.oneDriveFileId}/content`
            : null,
          isPermanent: !banner.endDate
        }))
      : [];

  return {
    banners: bannersWithImageUrl || [],
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
