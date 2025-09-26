// material-ui
// import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import NavUser from './NavUser';
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  // local layout variables intentionally not needed here; Navigation handles its own layout logic
  // const { menuMaster } = useGetMenuMaster();

  return (
    <>
      <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
        <Navigation />
      </SimpleBar>
      <NavUser />
    </>
  );
}
