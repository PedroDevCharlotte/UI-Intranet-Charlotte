// project-imports
import { loadingMenu } from './dashboard';
import pages from './pages';
import samplePage from './sample-page';
import support from './support';
import roles from './roles';
import banners from './banners';

// types
import { NavItemType } from 'types/menu';
import users from './users';
import ticketsMenu from './tickets';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [loadingMenu, users, ticketsMenu, banners, roles]
};

export default menuItems;
