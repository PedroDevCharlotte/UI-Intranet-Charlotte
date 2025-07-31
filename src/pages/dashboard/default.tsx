// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import EcommerceDataCard from 'components/cards/statistics/EcommerceDataCard';
import { GRID_COMMON_SPACING } from 'config';

import WelcomeBanner from 'sections/dashboard/default/WelcomeBanner';
import ProjectRelease from 'sections/dashboard/default/ProjectRelease';
import EcommerceDataChart from 'sections/widget/chart/EcommerceDataChart';
import TotalIncome from 'sections/widget/chart/TotalIncome';
import RepeatCustomerRate from 'sections/widget/chart/RepeatCustomerRate';
import ProjectOverview from 'sections/widget/chart/ProjectOverview';
import Transactions from 'sections/widget/data/Transactions';
import AssignUsers from 'sections/widget/statistics/AssignUsers';

// assets
import { ArrowDown, ArrowUp, Book, Calendar, CloudChange, Wallet3 } from 'iconsax-react';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const theme = useTheme();

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      
    </Grid>
  );
}
