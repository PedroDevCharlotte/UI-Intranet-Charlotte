import { useEffect, useRef, useState } from 'react';

// material-ui
import AppBar from '@mui/material/AppBar';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project-imports
import Localization from './Localization';
import Profile from './Profile';
import AddToFavoritesButton from 'components/AddToFavoritesButton';
import navigation from 'menu-items';
import { useLocation } from 'react-router-dom';
import Search from './Search';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import { MoreSquare } from 'iconsax-react';

// ==============================|| HEADER CONTENT - MOBILE ||============================== //

export default function MobileSection() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    function findTitle(items: Array<{ url?: string; title?: string; children?: any[] }>, pathname: string): string {
      for (const item of items) {
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
  const anchorRef = useRef<any>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          aria-label="open more menu"
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          color="secondary"
          variant="light"
          size="large"
          sx={(theme) => ({
            p: 1,
            color: 'secondary.main',
            bgcolor: open ? 'secondary.200' : 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: open ? 'background.paper' : 'background.default' })
          })}
        >
          <MoreSquare variant="Bulk" style={{ transform: 'rotate(90deg)' }} />
        </IconButton>
      </Box>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        sx={{ width: '100%' }}
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1 })}>
              <ClickAwayListener onClickAway={handleClose}>
                <AppBar color="inherit">
                  <Toolbar>
                    <Search />
                    <Localization />
                    <Profile />
                    <AddToFavoritesButton
                      title={pageTitle}
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      description={`Acceso directo a ${pageTitle}`}
                    />
                  </Toolbar>
                </AppBar>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
}
