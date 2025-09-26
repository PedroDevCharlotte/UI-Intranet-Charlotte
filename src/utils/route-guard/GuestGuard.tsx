import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { isLoggedIn, requires2FA, register2FA, isFirstLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // if (isLoggedIn) {
    console.log('GuestGuard - isLoggedIn:', isLoggedIn, 'requires2FA:', requires2FA, 'register2FA:', register2FA, 'isFirstLogin:', isFirstLogin, 'location.state:', location?.state);
    if (isLoggedIn && !requires2FA && !register2FA && !isFirstLogin) {
      navigate(location?.state?.from ? location?.state?.from : APP_DEFAULT_PATH, {
        state: { from: '' },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
}
