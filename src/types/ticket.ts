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

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId?: number;
  departmentId?: number;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  code: string;
  managerId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketParticipant {
  id: number;
  ticketId?: number;
  user: User;
  userId?: number;
  role?: string;
  canComment?: boolean;
  canEdit: boolean;
  canClose: boolean;
  canAssign: boolean;
  receiveNotifications: boolean;
  joinedAt: string;
  removedAt: string | null;
  addedBy: number | null;
}

export interface TicketList {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  ticketTypeId: number;
  createdBy: number;
  assignedTo: number;
  departmentId: number;
  dueDate: string;
  resolvedAt: string | null;
  closedAt: string | null;
  estimatedHours: number | null;
  messages: TicketMessage[];
  actualHours: number | null;
  tags: string[] | null;
  notificationsEnabled: boolean;
  isUrgent: boolean;
  isInternal: boolean;
  customFields: any | null;
  createdAt: string;
  updatedAt: string;
  ticketType: TicketType;
  creator: User;
  assignee: User;
  department: Department;
  participants: TicketParticipant[];
  parentTicketId: number | null;
  attachments?: TicketAttachment[];
  history?: TicketHistory[];
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  sender: User;
  senderId: number;
  content: string;
  type: string;
  metadata: any;
  isInternal: boolean;
  isEdited: boolean;
  replyTo: TicketMessage | null;
  replyToId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  editedBy: User | null;
  editedAt: string | null;
}

export interface TicketAttachment {
  id: number;
  ticketId: number;
  messageId: number;
  uploadedBy: User;
  uploadedById: number;
  fileName: string;
  originalFileName: string;
  filePath: string;
  mimeType: string;
  fileSize: string;
  fileHash: string | null;
  isPublic: boolean;
  description: string;
  uploadedAt: string;
  deletedAt: string | null;
}

export interface TicketHistory {
  id: number;
  ticketId: number;
  user: User;
  userId: number;
  action: string;
  oldValues: any;
  newValues: any;
  description: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}