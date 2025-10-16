import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
// project-imports
import { LOGIN, LOGOUT } from '../contexts/auth-reducer/actions';
import authReducer from '../contexts/auth-reducer/auth';

// project-imports
import Loader from '../components/Loader';
import axios from '../utils/axios';
import { logoutUser } from '../api/user';

// types
import { AuthProps, JWTContextType } from '../types/auth';
import { KeyedObject } from '../types/root';
import { r } from 'react-router/dist/development/fog-of-war-DLtn2OLr';

const chance = new Chance();

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  requires2FA: false,
  register2FA: false,
  isFirstLogin: false,
  user: null
};

const verifyToken: (st: string) => boolean = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded: KeyedObject = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/account/me');
          const { user, register2FA, requires2FA, isFirstLogin } = response.data;
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              register2FA,
              requires2FA,
              isFirstLogin,
              user
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    setSession('');

    const response = await axios.post('/auth/login', { email, password });
    const { access_token, user, register2FA, requires2FA, isFirstLogin } = response.data;
    // console.log('Login response serviceToken:', response);
    setSession(access_token);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        register2FA: register2FA,
        requires2FA: requires2FA,
        isFirstLogin: isFirstLogin, // Assuming first login is false here, adjust as needed
        user
      }
    });
    return { requires2FA, register2FA };
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    const response = await axios.post('/api/account/register', {
      id,
      email,
      password,
      firstName,
      lastName
    });
    let users = response.data;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      const localUsers = window.localStorage.getItem('users');
      users = [
        ...JSON.parse(localUsers!),
        {
          id,
          email,
          password,
          name: `${firstName} ${lastName}`
        }
      ];
    }

    window.localStorage.setItem('users', JSON.stringify(users));
  };

  const logout = async () => {
    try {
      // Llamar a la API para cerrar sesión en el servidor
      const response = await logoutUser();
      
      if (response.success) {
        console.log('Logout exitoso:', response.message);
      } else {
        console.error('Error en logout del servidor:', response.error);
        // Continuar con el logout local incluso si falla el servidor
      }
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
      // Continuar con el logout local incluso si falla el servidor
    } finally {
      // Siempre limpiar el estado local
      setSession(null);
      dispatch({ type: LOGOUT });
    }
  };
  const resetPassword = async (email: string) => {
    try {
      const response = await axios.post('/user/request-password-reset', { email });
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  const verify2FA = async (code: string) => {
    const response = await axios.post('/auth/2fa/verify', { userId: state?.user?.id, token: code });
    const { access_token, user, register2FA, requires2FA } = response.data;
    setSession(access_token);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        register2FA: false,
        requires2FA: false,
        isFirstLogin: false, // Assuming first login is false here, adjust as needed
        user
      }
    });
    return response.data;
  };

  const setup2FA = async () => {
    const { user } = state;
    let response;
    try {
      const serviceToken = window.localStorage.getItem('serviceToken');

      const token = axios.defaults.headers.common.Authorization;
      if (!user || !user.id) {
        throw new Error('User is not defined');
      }
      response = await axios.post('/auth/2fa/setup', { userId: user.id });
      if ([200, 201].indexOf(response.status) === -1) {
        throw new Error('Failed to set up 2FA');
      }
      response = response.data;
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error; // Re-throw the error to be handled by the caller
    }

    return response;
  };

  const enable2FA = async (token: string) => {
    const tokenAutorization = axios.defaults.headers.common.Authorization;

    let response;
    try {
      response = await axios.post('/auth/2fa/enable', { token, userId: state.user?.id });
      response = response.data;
      if (!response.isError) {
        const { access_token, user, register2FA, requires2FA, isFirstLogin } = response;
        setSession(access_token);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            register2FA: false,
            requires2FA: false,
            isFirstLogin: isFirstLogin,
            user
          }
        });
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      // throw error; // Re-throw the error to be handled by the caller
    }
    return response;
    //
    // const { serviceToken, user, register2FA, requires2FA } = response.data;
    // setSession(serviceToken);
    // dispatch({
    //   type: LOGIN,
    //   payload: {
    //     isLoggedIn: true,
    //     register2FA,
    //     requires2FA,
    //     user
    //   }
    // });
    return {};
  };

  const disable2FA = async () => {
    const response = await axios.post('/auth/2fa/disable');
    const { serviceToken, user, register2FA, requires2FA } = response.data;
    setSession(serviceToken);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        register2FA,
        requires2FA,
        user
      }
    });
    return response.data;
  };

  const verifyPasswordReset = async (email: string, code: string, newPassword: string) => {
    try {
      const response = await axios.post('/user/verify-password-reset', { email, code, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error verifying password reset:', error);
      throw error;
    }
  };

  const changeFirstPassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await axios.post('/auth/change-first-password', {
        currentPassword,
        newPassword
      });
      const { access_token, user, register2FA, requires2FA } = response.data;
      if (!access_token) {
        throw new Error('No se recibió el token de acceso');
      }
      setSession(access_token);
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          register2FA: false,
          requires2FA: false,
          isFirstLogin: false, // Assuming first login is false here, adjust as needed
          user
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error changing first password:', error);
      throw error;
    }
  };

  return (
    <JWTContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        resetPassword,
        verifyPasswordReset,
        updateProfile,
        setup2FA,
        enable2FA,
        disable2FA,
        verify2FA,
        changeFirstPassword
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
