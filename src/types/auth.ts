import { ReactElement } from 'react';

// ==============================|| TYPES - AUTH  ||============================== //

export type GuardProps = {
  children: ReactElement | null;
};

type UserProfile = {
  id?: string;
  email?: string;
  avatar?: string;
  image?: string;
  name?: string;
  role?: string;
  department?: string;
  tier?: string;
};

export interface AuthProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  register2FA?: boolean;
  requires2FA?: boolean;
  isFirstLogin?: boolean;
  user?: UserProfile | null;
  token?: string | null;
}

export interface AuthActionProps {
  type: string;
  payload?: AuthProps;
}

type ResponseAuth = {
  requires2FA?: boolean;
  register2FA?: boolean;
  user?: UserProfile;
};

export type JWTContextType = {
  isLoggedIn: boolean;
  register2FA?: boolean;
  requires2FA?: boolean;
  isInitialized?: boolean;
  isFirstLogin?: boolean;
  user?: UserProfile | null | undefined;
  logout: () => void;
  login: (email: string, password: string) => Promise<ResponseAuth>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  updateProfile: VoidFunction;
  changeFirstPassword: (oldPassword: string, newPassword: string) => Promise<void>;
  setup2FA: () => Promise<any>;
  verify2FA: (code: string) => Promise<any>;
  enable2FA: (code: string) => Promise<any>;
  disable2FA: (code: string) => Promise<any>;
};
