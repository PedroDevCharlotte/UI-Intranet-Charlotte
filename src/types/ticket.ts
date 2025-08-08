// ==============================|| TYPES - TICKET ||============================== //

interface InfoType {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface CountryType {
  code: string;
  label: string;
  currency: string;
  prefix: string;
}

export interface TicketType {
  id: number;
  name: string;
  description: string;
  code: string;
  color: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicFieldOption {
  id: number;
  listId: number;
  code: string;
  value: string;
  displayText: string;
  description: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  parentOptionId?: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FieldDefinition {
  id: number;
  fieldName: string;
  displayName: string;
  fieldType: 'TEXT' | 'SELECT' | 'TEXTAREA' | 'NUMBER' | 'DATE';
  isRequired: boolean;
  helpText?: string;
  sortOrder: number;
}

export interface FieldList {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  options: DynamicFieldOption[];
}

export interface DynamicFieldResponse {
  fieldDefinition: FieldDefinition;
  list: FieldList;
}

export interface DynamicField {
  id: number;
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'date';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: DynamicFieldOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface Items {
  id: string | number;
  name: string;
  description: string;
  qty: number;
  price: string | number;
}

export interface TicketProps {
  isOpen: boolean;
  isCustomerOpen: boolean;
  open: boolean;
  country: CountryType | null;
  countries: CountryType[];
  alertPopup: boolean;
}

export interface TicketList {
  id: number;
  ticket_id: number;
  customer_name: string;
  email: string;
  avatar: number;
  date: Date | string | number;
  due_date: Date | string | number;
  quantity: number;
  status: string;
  priority: string;
  category: string;
  ticket_detail: Items[];
  assignedInfo: InfoType;
  discount: number | null;
  tax: number | null;
  customerInfo: InfoType;
  notes: string;
  subject: string;
  description: string;
}
