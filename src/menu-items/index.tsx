// project-imports
import { loadingMenu } from './dashboard';
import pages from './pages';
import samplePage from './sample-page';
import support from './support';

// types
import { NavItemType } from 'types/menu';
import users from './users';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [loadingMenu , users,samplePage, pages, support]
};

export default menuItems;
