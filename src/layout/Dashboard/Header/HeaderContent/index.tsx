import { useMemo, useEffect, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import FullScreen from './FullScreen';
import Localization from './Localization';
import MegaMenuSection from './MegaMenuSection';
import Message from './Message';
import MobileSection from './MobileSection';
import Notification from './Notification';
import Profile from './Profile';
import Search from './Search';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';
import AddToFavoritesButton from 'components/AddToFavoritesButton';
import navigation from 'menu-items';
import { useLocation } from 'react-router-dom';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const localization = useMemo(() => <Localization />, []);
  const megaMenu = useMemo(() => <MegaMenuSection />, []);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    // Recursively search for the current item in the navigation tree
    function findTitle(items: Array<{ url?: string; title?: string; children?: any[] }>, pathname: string): string {
      for (const item of items) {
        // console.log("Item del menu", item)
        // console.log("pathname del menu", pathname)
        if (item.url === pathname) return item.title || '';
        if (item.children) {
          const found: string = findTitle(item.children, pathname);
          if (found) return found;
        }
      }
      return '';
    }
    setPageTitle(findTitle(navigation.items, location.pathname) || document.title || 'Favorito');
  }, [location.pathname]);
  console.log("Page title", pageTitle);
  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Search />}
      {/* {!downLG && megaMenu} */}
      {!downLG && localization}
      {downLG && <Box sx={{ width: 1, ml: 1 }} />}

      {/* <Notification /> */}
      {!downLG && <FullScreen />}

      {/* <Message /> */}
      {!downLG && (
        <>
          <AddToFavoritesButton
            title={pageTitle}
            url={typeof window !== 'undefined' ? window.location.href : ''}
            description={`Acceso directo a ${pageTitle}`}
          />
          <Profile />
        </>
      )}
      {downLG && <MobileSection />}
    </>
  );
}
