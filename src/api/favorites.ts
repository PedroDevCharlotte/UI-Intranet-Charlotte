import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'utils/axios';
import { fetcher } from 'utils/axios';

const endpoints = {
  key: '/favorites',
  list: '/favorites',
  add: '/favorites/add',
  remove: '/favorites/remove'
};

export function useGetFavorites() {
  const {
    data,
    error,
    isLoading,
    mutate: swrMutate
  } = useSWR(endpoints.key, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      favorites: Array.isArray(data) ? data : [],
      favoritesLoading: isLoading,
      favoritesError: error,
      favoritesMutate: swrMutate
    }),
    [data, error, isLoading, swrMutate]
  );

  return memoizedValue;
}

export async function addFavorite(item: any) {
  try {
    const response = await axios.post(endpoints.key, item);
    if ([200, 201].indexOf(response.status) === -1) {
      throw new Error('Failed to add favorite');
    }
    mutate(endpoints.key);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error' };
  }
}

export async function removeFavorite(id: number | string) {
  try {
    const response = await axios.delete(`${endpoints.key}/${id}`);
    if ([200, 201, 204].indexOf(response.status) === -1) {
      throw new Error('Failed to remove favorite');
    }
    mutate(endpoints.key);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error' };
  }
}
