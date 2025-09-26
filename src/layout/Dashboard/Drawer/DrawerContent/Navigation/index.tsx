import { Fragment, useState, useContext } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import NavGroup from './NavGroup';
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';
import { MenuOrientation, HORIZONTAL_MAX_ITEM } from 'config';
import useConfig from 'hooks/useConfig';
import menuItem from 'menu-items';
// dashboard menu from API is currently unused; implementation kept commented
import JWTContext from 'contexts/JWTContext';

// types
import { NavItemType } from 'types/menu';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  // const { menuLoading } = useGetMenu();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;

  const [selectedID, setSelectedID] = useState<string | undefined>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  // selectedItems is referenced when rendering NavGroup/NavCollapse; use a single selected id string
  const [selectedItems, setSelectedItems] = useState<string | undefined>('');

  // Get allowed menu paths from user context (set by /account/me)
  const auth = useContext(JWTContext);
  // make a shallow copy to avoid mutating arrays that may come from context
  const allowedMenus: string[] = [...(auth?.user?.menus ?? [])];
  allowedMenus.push('/dashboard/default'); // Always allow dashboard

  // dashboard menu from API is currently unused; keep implementation commented

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItem.items.length - 1;
  let remItems: NavItemType[] = [];
  let lastItemId: string | undefined;
  // console.log('menuItem.items', menuItem.items);
  // console.log('lastItem', lastItem);
  if (lastItem && lastItem < menuItem.items.length) {
    lastItemId = menuItem.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItem.items.slice(lastItem - 1, menuItem.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  // Filter menuItem.items by allowedMenus if provided (match by item.url or children urls)
  const filteredItems =
    allowedMenus && allowedMenus.length > 0
      ? menuItem.items.filter((it) => {
          // If group has a url, allow only if its url is in allowedMenus
          if (it.url) return allowedMenus.includes(it.url);
          // If group has children, allow group if any child url is allowed
          if (Array.isArray(it.children) && it.children.length > 0) {
            return it.children.some((child: any) => {
              if (child.url && allowedMenus.includes(child.url)) return true;
              if (Array.isArray(child.children)) {
                return child.children.some((sub: any) => sub.url && allowedMenus.includes(sub.url));
              }
              return false;
            });
          }
          // Default: keep item (e.g., non-url groups)
          return true;
        })
      : menuItem.items;

  const navGroups = filteredItems.slice(0, lastItemIndex + 1).map((item) => {
    // console.log('item', item);
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <Fragment key={item.id}>
              {menuOrientation !== MenuOrientation.HORIZONTAL && <Divider sx={{ my: 0.5 }} />}
              <NavItem item={item} level={1} isParents setSelectedID={setSelectedID} />
            </Fragment>
          );
        }
        return (
          <NavGroup
            key={item.id}
            selectedID={selectedID}
            setSelectedID={setSelectedID}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem!}
            remItems={remItems}
            lastItemId={lastItemId || ''}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  // console.log('navGroups', navGroups);

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block',
        alignItems: 'center'
      }}
    >
      {navGroups}
    </Box>
  );
}
