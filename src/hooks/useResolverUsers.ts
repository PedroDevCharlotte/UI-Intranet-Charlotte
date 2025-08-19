import { useGetAttendantsByTicketType } from 'api/ticket';
import { useGetUser } from 'api/user';

export function useResolverUsers() {
  // Aquí puedes filtrar usuarios según lógica de "pueden resolver el caso"
  // Por ahora, devolvemos todos los usuarios activos
  
  const { users } = useGetUser();
  // Filtra según lógica de negocio si es necesario
  return users.map(user => ({ id: user.id || 0, label: `${user.firstName} ${user.lastName}` }));
}

export function useResolveUsersAttentsTiketByType(ticketType: number, CurrentUser: number) {
  console.log("ticketType:", ticketType, "CurrentUser:", CurrentUser);
  const { attendants } = useGetAttendantsByTicketType(ticketType);
  // Filtra según lógica de negocio si es necesario
  return attendants
    .filter((user: any) => user.id !== CurrentUser)
    .map((user: any) => ({ id: user.id || 0, label: `${user.firstName} ${user.lastName}` }));
}