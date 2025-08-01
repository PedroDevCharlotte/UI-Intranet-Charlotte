import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import Loader from 'components/Loader';
import axios from 'utils/axios';

// types
import { AuthProps, JWTContextType } from 'types/auth';
import { KeyedObject } from 'types/root';
import { r } from 'react-router/dist/development/fog-of-war-DLtn2OLr';


const chance = new Chance();

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  requires2FA: false,
  register2FA:  false,
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
          const { user } = response.data;
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
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

  const login = async (email: string, password: string)  => {
    const response = await axios.post('/auth/login', { email, password });
    const { access_token, user, register2FA, requires2FA } = response.data;
    // console.log('Login response serviceToken:', response);
    setSession(access_token);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        register2FA: register2FA,
        requires2FA: requires2FA,
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

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
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
    console.log('2FA verification response serviceToken:', access_token);
    setSession(access_token);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        register2FA: false,
        requires2FA: false,
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
    
      const tokenAutorization = axios.defaults.headers.common.Authorization ;
    console.log('Enabling 2FA with code:', token, tokenAutorization);
    console.log('Axios', axios.defaults);
    console.log('estate', state);
    let response;
    try {
      response = await axios.post('/auth/2fa/enable', { token, userId: state.user?.id });
      response = response.data;
      if (!response.isError) {
        console.log('2FA enabled successfully:', response);
        const { access_token, user, register2FA, requires2FA } = response;
        setSession(access_token);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            register2FA: false,
            requires2FA: false,
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

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, verifyPasswordReset, updateProfile, setup2FA, enable2FA, disable2FA, verify2FA }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
