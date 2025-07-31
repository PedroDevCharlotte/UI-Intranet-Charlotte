import { Gender } from 'config';

// ==============================|| TYPES - USER  ||============================== //

export interface UserProps {
  modal: boolean;
}

export interface UserList {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  isTwoFactorEnabled?: boolean;
  last2FAVerifiedAt?: Date | string | number;
  isActive?: boolean;
  isVerified?: boolean;
  isBlocked?: boolean;
  role: string;
  avatar?: number;
  name?: string;
  fatherName?: string;
  age?: number;
  gender?: Gender;
  orders?: number;
  progress?: number;
  status?: number;
  orderStatus?: string;
  contact?: string;
  country?: string;
  location?: string;
  about?: string;
  skills?: string[];
  time?: string[];
  CreatedAt?: Date | string | number;
}
