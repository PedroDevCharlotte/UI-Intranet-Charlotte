import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// types
import { TicketList, TicketProps, TicketType, DynamicField, DynamicFieldResponse } from 'types/ticket';


/**
 * Módulo: API - Tickets
 * Descripción: Helpers y hooks para interactuar con el API de tickets.
 * - Utiliza `useSWR` para lecturas (listas y detalles).
 * - Exporta funciones para crear tickets, mensajes, descargar adjuntos,
 *   reasignar técnicos y actualizar estados.
 * - Todas las funciones que llaman al servidor usan `axiosServices` y
 *   llaman a `mutate()` para invalidar/actualizar la cache SWR cuando procede.
 *
 * Nota: Los comentarios junto a cada función describen inputs, outputs y
 * posibles errores esperados.
 */

const initialState: TicketProps = {
  isOpen: false,
  isCustomerOpen: false,
  open: false,
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
  newMessage: '/messages',
  getTicketTypes: '/ticket-types',
  getDynamicFields: '/general-lists/by-entity/tickets',
  statistics: '/statistics'
};

export function useGetTicket() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + '?limit=1000', fetcher, {
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

/**
 * useGetTicket
 * Obtiene un ticket utilizando SWR.
 * @returns { ticket, ticketLoading, ticketError, ticketValidating, ticketEmpty }
 */

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

/**
 * useGetTicketById
 * Obtiene los detalles de un ticket por su ID. Devuelve un objeto memoizado
 * con la respuesta del fetcher y estados de carga/errores para integrar en componentes.
 * @param ticketId - ID del ticket (number | string | null)
 * @returns { ticketDetail, ticketDetailLoading, ticketDetailError, ticketDetailValidating }
 */
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

/**
 * downloadTicketAttachment
 * Descarga un adjunto (blob) por su ID.
 * @param attachmentId - ID del adjunto
 * @returns Blob del archivo descargado
 * @throws Error personalizado si la petición falla
 */
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
    mutate(endpoints.key + "?limit=1000");
    mutate(endpoints.key + endpoints.statistics);

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;

/**
 * insertTicket
 * Inserta/crea un ticket usando FormData (soporta archivos y arrays).
 * Construye un FormData a partir del objeto `newTicket` y realiza POST al
 * endpoint `/tickets/complete`.
 * @param newTicket - Objeto con campos y archivos (arrays o valores simples)
 * @returns Response.data del servidor
 * @throws error si la petición falla
 */
    }
    throw error;
  }
}

// Crea un mensaje asociado a tickets (o mensajes del sistema)
export async function createMessage(formData: FormData, idTicket: number) {
  try {
    if (!idTicket) {
      throw new Error('ID de ticket no válido');
    }
    const response = await axiosServices.post(endpoints.key + '/' + idTicket + endpoints.newMessage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // opcional: podríamos invalidar cache relacionado si existe
    mutate(`/tickets/${idTicket}`);

    return response.data;
  } catch (error: any) {

/**
 * createMessage
 * Crea un mensaje asociado a un ticket (multipart/form-data).
 * Centraliza la llamada POST a `/tickets/{id}/messages`.
 * @param formData - FormData con campos: content, files, isInternal, etc.
 * @param idTicket - ID del ticket al que pertenece el mensaje
 * @returns response.data del servidor
 */
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export async function updateTicket(ticketId: number, updatedTicket: Partial<TicketList>) {
  // optimistic local update
  try {
    mutate(
      endpoints.key + endpoints.list,
      (currentTicket: any) => {
        if (!currentTicket || !currentTicket.ticket) return currentTicket;
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

    // hit server
    const response = await axiosServices.patch(`/tickets/${ticketId}`, updatedTicket);

    // refresh related caches
    mutate(endpoints.key);
    mutate(`/tickets/${ticketId}`);

    return response.data;
  } catch (error: any) {
    // rollback: refetch server state
    mutate(endpoints.key);
    mutate(`/tickets/${ticketId}`);
    if (error && error.response && error.response.data) throw error.response.data;
    throw error;
  }
}

export async function closeTicket(ticketId: number, content: string) {
  try {
    const response = await axiosServices.patch(`/tickets/${ticketId}/close`, { content });
    // refrescar caches relacionadas
    mutate(endpoints.key);
    mutate(`/tickets/${ticketId}`);

/**
 * closeTicket
 * Cierra un ticket llamando al endpoint `/tickets/{id}/close` con un
 * cuerpo que puede incluir `content` (comentario de cierre).
 * @param ticketId - ID del ticket a cerrar
 * @param content - Comentario opcional al cerrar
 * @returns response.data del servidor
 */
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
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


/**
 * useGetTicketTypes
 * Obtiene los tipos de tickets disponibles.
 * @param includeInactive - Indica si se deben incluir tipos inactivos
 * @returns { ticketTypes, ticketTypesLoading, ticketTypesError, ticketTypesValidating, ticketTypesEmpty }
 */
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

/**
 * useGetDynamicFields
 * Obtiene y transforma campos dinámicos relacionados a un tipo de ticket.
 * Esto permite renderizar formularios dinámicos basados en la configuración
 * proveniente del API.
 * @param ticketTypeCode - Código del tipo de ticket (ej: 'SUPPORT')
 * @returns { dynamicFields, dynamicFieldsLoading, ... }
 */
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

/**
 * useGetAttendantsByTicketType
 * Obtiene usuarios disponibles para atender un tipo de ticket específico.
 * @param ticketTypeCode - ID numérico del tipo de ticket
 * @returns { attendants, attendantsLoading, ... }
 */
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

/**
 * reassignTechnician
 * Reasigna (asigna) un ticket a otro técnico/usuario.
 * Actualiza caches relacionadas tras la operación.
 * @param ticketId - ID del ticket
 * @param assigneeId - ID del usuario que será asignado
 */
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

/**
 * updateTicketStatus
 * Actualiza el estado (status) de un ticket mediante PATCH a `/tickets/{id}`.
 * Llama a `mutate()` para invalidar la caché de lista y detalle.
 * @param ticketId - ID del ticket
 * @param status - Nuevo estado (OPEN, IN_PROGRESS, CLOSED, ...)
 * @returns response.data del servidor
 */
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


/**
 * getTicketStatistics
 * Obtiene estadísticas de tickets.
 * @returns { dataStatistics, dataStatisticsLoading }
 */
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

// Actualiza el estado de un ticket
export async function updateTicketStatus(ticketId: number | string, status: string) {
  try {
  // According to backend contract the update is performed on /tickets/{id}
  const response = await axiosServices.patch(`/tickets/${ticketId}`, { status });
    // refrescar caches relacionadas
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

export function getTicketStatistics() {
  try {
      const { data, isLoading } = useSWR(endpoints.key + endpoints.statistics, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      dataStatistics: (data as any) || {},
      dataStatisticsLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;

  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}
