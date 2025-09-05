import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/axios';

export function useGetTicketStatisticsAdvisors() {
  const { data, isLoading, error } = useSWR('/tickets/statistics/advisors', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      advisors: Array.isArray(data?.advisors) ? data.advisors : [],
      advisorsLoading: isLoading,
      advisorsError: error
    }),
    [data, isLoading, error]
  );

  return memoizedValue;
}
