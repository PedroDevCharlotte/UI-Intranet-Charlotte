import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }: GuardProps) {

  const { isLoggedIn, requires2FA, register2FA, isFirstLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  console.log('AuthGuard isLoggedIn:', isLoggedIn);
  console.log('AuthGuard requires2FA:', requires2FA);
  console.log('AuthGuard register2FA:', register2FA);
  console.log('AuthGuard isFirstLogin:', isFirstLogin);
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    } else if (register2FA) {
      navigate('/setup-2fa', { replace: true });
    } else if (requires2FA && !isFirstLogin ) {
      navigate('/2fa', { replace: true });
    }else if (isLoggedIn &&isFirstLogin && !requires2FA && !register2FA) {
      navigate('/change-first-password', { replace: true });
    }

  }, [isLoggedIn, requires2FA, register2FA, navigate, location]);
    // isLoggedIn, navigate, location]);

  return children;
}
