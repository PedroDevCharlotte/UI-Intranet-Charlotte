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
  active?: boolean;
  isVerified?: boolean;
  daysToPasswordExpiration?: number;
  isBlocked?: boolean;
  role: string;
  // avatar can be a legacy numeric id referencing an asset, or a serialized string (dataURL/JSON) produced by the new avatar editor
  avatar?: number | string;
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
  emoji?: string;
  /**
   * Jefe directo del usuario (puede ser null o un objeto UserList reducido)
   */
  manager?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  } | null;
supportTypes?: { id: number; name: string }[];
  /**
   * Subordinados directos del usuario (lista de objetos UserList reducidos)
   */
  subordinates?: Array<{
    id: number;
    name: string;
    email: string;
    role?: string;
  }>;
}
