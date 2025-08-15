import { useGetUser } from 'api/user';

export function useResolverUsers() {
  // Aquí puedes filtrar usuarios según lógica de "pueden resolver el caso"
  // Por ahora, devolvemos todos los usuarios activos
  const { users } = useGetUser();
  // Filtra según lógica de negocio si es necesario
  return users.map(user => ({ id: user.id || 0, label: `${user.firstName} ${user.lastName}` }));
}
