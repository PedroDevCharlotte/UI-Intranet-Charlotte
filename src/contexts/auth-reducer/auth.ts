// action - state management
import { REGISTER, LOGIN, LOGOUT } from './actions';

// types
import { AuthProps, AuthActionProps } from 'types/auth';

// initial state
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  register2FA: false,
  requires2FA: false,
  user: null
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state = initialState, action: AuthActionProps) => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload!;
      return {
        ...state,
        user
      };
    }
    case LOGIN: {
      const { user } = action.payload!;
      // console.log('AuthReducer LOGIN action payload:', action.payload);
      // console.log('AuthReducer LOGIN state before update:', state);
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        isFirstLogin: action.payload?.isFirstLogin || false,
        register2FA: action.payload?.register2FA || false,
        requires2FA: action.payload?.requires2FA || false,
        user
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        isFirstLogin: false,
        register2FA: false,
        requires2FA: false,
        user: null
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
