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
