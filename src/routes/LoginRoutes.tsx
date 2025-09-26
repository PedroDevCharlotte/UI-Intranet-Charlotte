import { lazy } from 'react';

// project-imports
import AuthLayout from '../layout/Auth';
import Loadable from '../components/Loadable';
import path from 'path';

// render - login
const AuthLogin = Loadable(lazy(() => import('../pages/auth/login')));
const AuthRegister = Loadable(lazy(() => import('../pages/auth/register')));
const AuthForgotPassword = Loadable(lazy(() => import('../pages/auth/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('../pages/auth/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('../pages/auth/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('../pages/auth/code-verification')));
const Auth2FA = Loadable(lazy(() => import('../pages/auth/code2FA')));
const AuthSetup2FA = Loadable(lazy(() => import('../pages/auth/config2FA')));
const FirstLogin = Loadable(lazy(() => import('../pages/auth/change-first-login')));

// ==============================|| AUTH ROUTES ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: '/',
          element: <AuthLogin />
        },
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'register',
          element: <AuthRegister />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'check-mail',
          element: <AuthCheckMail />
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />
        },
        {
          path: 'verify-2fa',
          element: <Auth2FA />
        },
        {
          path: 'setup-2fa',
          element: <AuthSetup2FA />
        },
        {
          path: 'change-first-password',
          element: <FirstLogin />
        }
      ]
    }
  ]
};

export default LoginRoutes;
