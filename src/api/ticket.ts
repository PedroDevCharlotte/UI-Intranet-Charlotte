import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// types
import { CountryType, TicketList, TicketProps, TicketType, DynamicField, DynamicFieldResponse } from 'types/ticket';

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
  key: 'tickets',
  actions: 'actions',
  list: '/list',
  insert: '/tickets/complete', // endpoint real para crear ticket completo
  update: '/update',
  delete: '/delete',
  getTicketTypes: '/ticket-types',
  getDynamicFields: '/general-lists/by-entity/tickets'
};

export function useGetTicket() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      ticket: (data?.tickets as TicketList[]) || [],
      ticketLoading: isLoading,
      ticketError: error,
      ticketValidating: isValidating,
      ticketEmpty: !isLoading && !data?.ticket?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetTicketById(ticketId: number | string | null) {
  const url = ticketId ? `/tickets/${ticketId}` : null;
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  console.log('Ticket data by ID:', data);

  const memoizedValue = useMemo(
    () => ({
      ticketDetail: data as TicketList | undefined,
      ticketDetailLoading: isLoading,
      ticketDetailError: error,
      ticketDetailValidating: isValidating,
      ticketDetailEmpty: !isLoading && !data
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
// Descarga un adjunto de ticket por ID
export async function downloadTicketAttachment(attachmentId: string | number) {
  try {
    const response = await axiosServices.get(`/tickets/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

// Inserta un ticket usando el endpoint real y retorna la respuesta o lanza error
export async function insertTicket(newTicket: any) {
  try {
    const formData = new FormData();
    Object.entries(newTicket).forEach(([key, value]) => {
      // Si el valor es un array, agregar cada elemento individualmente
      if (Array.isArray(value)) {
        if (key === 'files') {
          value.forEach((item, idx) => {
            formData.append(`${key}`, item);
          });
        } else {
          value.forEach((item, idx) => {
            formData.append(`${key}[${idx}]`, item);
          });
        }
      } else {
        // Ensure value is string or Blob
        if (value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, value != null ? String(value) : '');
        }
      }
    });

    const response = await axiosServices.post(endpoints.insert, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    mutate(endpoints.key);

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
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

export function useGetTicketTypes(includeInactive: boolean = false) {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.getTicketTypes + `?includeInactive=${includeInactive}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    onError: (error) => {
      console.error('Error fetching ticket types:', error);
    }
  });

  // console.log('Ticket Types:', data);
  const memoizedValue = useMemo(
    () => ({
      ticketTypes: (data as TicketType[]) || [],
      ticketTypesLoading: isLoading,
      ticketTypesError: error,
      ticketTypesValidating: isValidating,
      ticketTypesEmpty: !isLoading && !data.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ticketTypeId es el ID numérico del tipo de ticket
export function useGetDynamicFields(ticketTypeCode: string | null) {
  console.log('Fetching dynamic fields for ticket type code:', ticketTypeCode);
  const url = ticketTypeCode ? `${endpoints.getDynamicFields}/${ticketTypeCode}?includeOptions=true` : null;
  console.log('Dynamic fields URL:', url);
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    onError: (error) => {
      console.error('❌ Error fetching dynamic fields:', error);
    }
  });
  console.log('Dynamic fields data:', data);
  // Use the actual API response data
  const responseData = data || [];

  // Transform API response to expected format
  const transformedFields = useMemo(() => {
    if (!responseData || !Array.isArray(responseData)) return [];

    return responseData
      .map((item: any) => {
        // Use any type to avoid strict typing issues
        const { fieldDefinition, list } = item;

        // Map field type from API format to component format
        const getFieldType = (apiType: string): 'text' | 'select' | 'textarea' | 'number' | 'date' => {
          switch (apiType.toUpperCase()) {
            case 'SELECT':
              return 'select';
            case 'TEXTAREA':
              return 'textarea';
            case 'NUMBER':
              return 'number';
            case 'DATE':
              return 'date';
            case 'TEXT':
            default:
              return 'text';
          }
        };

        // Transform to DynamicField format
        const transformedField: DynamicField = {
          id: fieldDefinition.id,
          name: fieldDefinition.fieldName,
          label: fieldDefinition.displayName,
          type: getFieldType(fieldDefinition.fieldType),
          required: fieldDefinition.isRequired,
          description: fieldDefinition.helpText,
          options: list?.options?.filter((option: any) => option.isActive) || [],
          validation: {}
        };

        return transformedField;
      })
      .sort((a, b) => {
        // Sort by field definition sortOrder if available
        const aOrder = responseData.find((item: any) => item.fieldDefinition.id === a.id)?.fieldDefinition.sortOrder || 0;
        const bOrder = responseData.find((item: any) => item.fieldDefinition.id === b.id)?.fieldDefinition.sortOrder || 0;
        return aOrder - bOrder;
      });
  }, [responseData]);

  const memoizedValue = useMemo(
    () => ({
      dynamicFields: transformedFields,
      dynamicFieldsLoading: isLoading,
      dynamicFieldsError: error,
      dynamicFieldsValidating: isValidating,
      dynamicFieldsEmpty: !isLoading && !transformedFields?.length
    }),
    [transformedFields, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetAttendantsByTicketType(ticketTypeCode: number | null) {
  const url = ticketTypeCode ? `/tickets/available-by-type/${ticketTypeCode}` : null;
  console.log('Fetching attendants by ticket type:', url);
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  // console.log('Attendants data:', data);
  // Validar que la respuesta tenga la estructura esperada
  const attendants = data && Array.isArray(data.users) ? data.users : [];

  const memoizedValue = useMemo(
    () => ({
      attendants,
      attendantsLoading: isLoading,
      attendantsError: error,
      attendantsValidating: isValidating,
      attendantsEmpty: !isLoading && attendants.length === 0
    }),
    [attendants, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// Reasigna el técnico de un ticket
export async function reassignTechnician(ticketId: number | string, assigneeId: number | string) {
  try {
    const response = await axiosServices.patch(`/tickets/${ticketId}/assign`, {
      assigneeId
    });
    console.log('Reassign technician response:', response.data);
    // Opcional: refresca la lista de tickets
    mutate(endpoints.key);
    mutate(`/tickets/${ticketId}`);

    

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}
