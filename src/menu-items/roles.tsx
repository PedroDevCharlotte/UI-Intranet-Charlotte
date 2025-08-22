// assets
import { ProfileTick, Add } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  roles: ProfileTick,
  add: Add
};

// ==============================|| MENU ITEMS - ROLES ||============================== //

const rolesMenu: NavItemType = {
  id: 'group-roles',
  title: 'Roles',
  type: 'group',
  children: [
    {
      id: 'roles',
      title: 'Roles',
      type: 'collapse',
      icon: icons.roles,
      children: [
        {
          id: 'role-list',
          title: 'role-list',
          type: 'item',
          url: '/apps/role-types/list',
          icon: icons.add,
          target: false
        }
      ]
    }
  ]
};

export default rolesMenu;
