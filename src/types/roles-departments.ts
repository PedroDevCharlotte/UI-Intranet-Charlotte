// ==============================|| TYPES - ROLES & DEPARTMENTS ||============================== //

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RolesResponse {
  roles: string[];
  success: boolean;
  message?: string;
}

export interface DepartmentsResponse {
  departments: string[];
  success: boolean;
  message?: string;
}

// Para uso futuro si se necesita información más detallada
export interface DetailedRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  isActive: boolean;
  usersCount?: number;
}

export interface DetailedDepartment {
  id: string;
  name: string;
  description: string;
  managerId: string;
  managerName?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  isActive: boolean;
  usersCount?: number;
  subDepartments?: DetailedDepartment[];
}
