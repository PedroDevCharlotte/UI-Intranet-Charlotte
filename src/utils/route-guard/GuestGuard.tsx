import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { isLoggedIn, requires2FA, register2FA  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    
    // if (isLoggedIn) {
    if (isLoggedIn && !requires2FA && !register2FA) {

      console.log('User is logged in, redirecting to default path', APP_DEFAULT_PATH, location?.state?.from);
      navigate(location?.state?.from ? location?.state?.from : APP_DEFAULT_PATH, {
        state: { from: '' },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
}
