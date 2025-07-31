// assets
import { handlerUserDialog } from 'api/user';
import { NavActionType } from 'config';
import { Add, I24Support, MessageProgramming, Profile2User } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  maintenance: MessageProgramming,
  contactus: I24Support,
  user: Profile2User,
  add: Add
};

// ==============================|| MENU ITEMS - PAGES ||============================== //


const users: NavItemType = {
  id: 'user-list',
  title: 'users',
  type: 'group',
  icon: icons.user,
  url: '/apps/user/user-list',
};

export default users;
