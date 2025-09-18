import { useContext, useCallback } from 'react';
import JWTContext from 'contexts/JWTContext';

export default function usePermissions() {
  const auth = useContext(JWTContext) as any;

  if (!auth) throw new Error('usePermissions must be used inside JWTProvider');

  const perms: string[] = Array.isArray(auth?.user?.permissions) ? auth.user.permissions : [];

  const hasPerm = useCallback(
    (p: string) => perms.includes(p),
    [perms]
  );

  const hasAny = useCallback(
    (ps: string[]) => ps.some((p) => perms.includes(p)),
    [perms]
  );

  const hasAll = useCallback(
    (ps: string[]) => ps.every((p) => perms.includes(p)),
    [perms]
  );

  return { perms, hasPerm, hasAny, hasAll };
}
