// assets
import { Ticket, Add, Archive } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  tickets: Ticket,
  newTicket: Add,
  ticketList: Archive
};

// ==============================|| MENU ITEMS - TICKETS ||============================== //

const ticketsMenu: NavItemType = {
  id: 'group-tickets',
  title: 'tickets',
  type: 'group',
  children: [
    {
      id: 'tickets',
      title: 'tickets',
      type: 'collapse',
      icon: icons.tickets,
      children: [
        {
          id: 'new-ticket',
          title: 'create-ticket',
          type: 'item',
          url: '/apps/ticket/create',
          icon: icons.newTicket,
          target: false
        },
        {
          id: 'ticket-list',
          title: 'ticket-list',
          type: 'item',
          url: '/apps/ticket/list',
          icon: icons.ticketList,
          target: false
        },
        {
          id: 'ticket-dashboard',
          title: 'ticket-dashboard',
          type: 'item',
          url: '/apps/ticket/dashboard',
          icon: icons.tickets,
          target: false
        }
      ]
    }
  ]
};

export default ticketsMenu;
