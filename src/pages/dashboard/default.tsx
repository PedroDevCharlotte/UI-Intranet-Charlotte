// material-ui
import Grid from '@mui/material/Grid2';

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import WelcomeBanner from 'sections/dashboard/default/WelcomeBanner';
import BannersSlider from 'sections/dashboard/banners/BannersSlider';
import TicketsWidget from 'sections/dashboard/tickets/TicketsWidget';
import TicketsResponseTrafficLight from 'sections/dashboard/tickets/TicketsResponseTrafficLight';
import ClosedTicketsSurvey from 'sections/dashboard/tickets/ClosedTicketsSurvey';
import RequestFeedbackTable from 'sections/dashboard/tickets/RequestFeedbackTable';
import usePermissions from 'hooks/usePermissions';

// assets
// ...existing imports above

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const { hasPerm } = usePermissions();

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={{ xs: 12 }}>
        <BannersSlider />
      </Grid>
      {hasPerm('tickets.viewDashboardTicket') && (
        <Grid size={{ xs: 12 }}>
          <TicketsWidget />
        </Grid>
      )}
      {hasPerm('tickets.seeTrafficLight') && (
        <Grid size={{ xs: 4 }}>
          <TicketsResponseTrafficLight />
        </Grid>
      )}
      {hasPerm('tickets.viewDashboardTicket') && (
        <Grid size={{ xs: 4 }}>
          <ClosedTicketsSurvey />
        </Grid>
      )}
      {hasPerm('tickets.viewDashboardTicket') && (
        <Grid size={{ xs: 4 }}>
          <RequestFeedbackTable />
        </Grid>
      )}
    </Grid>
  );
}
