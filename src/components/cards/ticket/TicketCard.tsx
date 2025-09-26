// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import { ArrowUp3, ProfileTick, FolderOpen, CloseCircle, BookSaved, Book1, TickCircle } from 'iconsax-react';
import Avatar from 'components/@extended/Avatar';

interface Props {
  title: string;
  count: string;
  percentage?: number;
  isLoss?: boolean;
  color?: any;
  children: any;
  ticket: string;
  status: string;
}

const getIcons = (status: string) => {
  switch (status) {
    case 'OPEN':
      return <FolderOpen style={{ fontSize: '20px' }} />;
    case 'IN_PROGRESS':
      return <Book1 style={{ fontSize: '20px' }} />;
    case 'CLOSED':
      return <BookSaved style={{ fontSize: '20px' }} />;
    case 'FOLLOW_UP':
      return <ArrowUp3 style={{ fontSize: '20px' }} />;
    case 'COMPLETED':
      return <TickCircle style={{ fontSize: '20px' }} />;
    case 'CANCELLED':
      return <CloseCircle style={{ fontSize: '20px' }} />;
    case 'NON_CONFORMITY':
      return <ProfileTick style={{ fontSize: '20px' }} />;
    default:
      return <ProfileTick style={{ fontSize: '20px' }} />;
  }
};

const getColorByStatus = (status: string): 'error' | 'warning' | 'success' | 'info' | 'default' => {
  switch (status) {
    case 'OPEN':
      return 'error';
    case 'IN_PROGRESS':
      return 'warning';
    case 'CLOSED':
      return 'success';
    case 'FOLLOW_UP':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'NON_CONFORMITY':
      return 'warning';
    default:
      return 'default';
  }
};

// ==============================|| TICKET - CARD  ||============================== //

export default function TicketCard({ color, title, count, percentage, isLoss, children, ticket, status }: Props) {
  return (
    <Grid container direction="row" spacing={2}>
      <Grid size={{ xs: 12, md: 12 }}>
        <Stack direction="row">
          <Avatar alt="Tickets" variant="rounded" type="filled" color={getColorByStatus(status)}>
            {getIcons(status)}
          </Avatar>
          <Stack direction="column" sx={{ ml: 1.25, gap: 0.25 }}>
            <Typography variant="subtitle1">{title}</Typography>
            <Stack direction="column" sx={{ gap: 1 }}>
              <Typography color="inherit">{count} tickets</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <Box sx={{ width: 1, height: 1 }}>{children}</Box>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
