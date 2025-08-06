import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';

// types
import { CountryType, TicketList, TicketProps } from 'types/ticket';

const countries: CountryType[] = [
  { code: 'US', label: 'United States Dollar', currency: 'Dollar', prefix: '$' },
  { code: 'GB', label: 'United Kingdom Pound', currency: 'Pound', prefix: '£' },
  { code: 'IN', label: 'India Rupee', currency: 'Rupee', prefix: '₹' },
  { code: 'JP', label: 'Japan Yun', currency: 'Yun', prefix: '¥' }
];

const initialState: TicketProps = {
  isOpen: false,
  isCustomerOpen: false,
  open: false,
  country: countries[2],
  countries: countries,
  alertPopup: false
};

// ==============================|| API - TICKET ||============================== //

const endpoints = {
  key: 'api/ticket',
  actions: 'actions',
  list: '/list', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetTicket() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      ticket: data?.ticket as TicketList[] || [],
      ticketLoading: isLoading,
      ticketError: error,
      ticketValidating: isValidating,
      ticketEmpty: !isLoading && !data?.ticket?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function insertTicket(newTicket: TicketList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentTicket: any) => {
      newTicket.id = currentTicket.ticket.length + 1;
      const addedTicket: TicketList[] = [...currentTicket.ticket, newTicket];

      return {
        ...currentTicket,
        ticket: addedTicket
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { newTicket };
  //   await axios.post(endpoints.key + endpoints.insert, data);
}

export async function updateTicket(ticketId: number, updatedTicket: TicketList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentTicket: any) => {
      const newTicket: TicketList[] = currentTicket.ticket.map((ticket: TicketList) =>
        ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
      );

      return {
        ...currentTicket,
        ticket: newTicket
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { list: updatedTicket };
  //   await axios.post(endpoints.key + endpoints.update, data);
}

export async function deleteTicket(ticketId: number) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentTicket: any) => {
      const nonDeletedTicket = currentTicket.ticket.filter((ticket: TicketList) => ticket.id !== ticketId);

      return {
        ...currentTicket,
        ticket: nonDeletedTicket
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { ticketId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
}

export function useGetTicketMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.actions, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      ticketMaster: data,
      ticketMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerCustomerTo(isCustomerOpen: boolean) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.actions,
    (currentTicketmaster: any) => {
      return { ...currentTicketmaster, isCustomerOpen };
    },
    false
  );
}

export function handlerCustomerFrom(open: boolean) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.actions,
    (currentTicketmaster: any) => {
      return { ...currentTicketmaster, open };
    },
    false
  );
}

export function selectCountry(country: CountryType | null) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.actions,
    (currentTicketmaster: any) => {
      return { ...currentTicketmaster, country };
    },
    false
  );
}

export function handlerPreview(isOpen: boolean) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.actions,
    (currentTicketmaster: any) => {
      return { ...currentTicketmaster, isOpen };
    },
    false
  );
}

export function handlerDelete(alertPopup: boolean) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.actions,
    (currentTicketmaster: any) => {
      return { ...currentTicketmaster, alertPopup };
    },
    false
  );
}
