import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

// third-party
import { FormattedMessage } from 'react-intl';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

// assets
import { Ticket, Clock, Check, CloseCircle } from 'iconsax-react';

// types
interface TicketStatsCard {
  title: string;
  count: number;
  color: 'primary' | 'warning' | 'error' | 'success' | 'info';
  icon: React.ReactNode;
  percentage?: number;
  isIncrease?: boolean;
}

// ==============================|| TICKET - DASHBOARD ||============================== //

export default function Dashboard() {
  const ticketStats: TicketStatsCard[] = [
    {
      title: 'total-tickets',
      count: 1247,
      color: 'primary',
      icon: <Ticket variant="Bold" />,
      percentage: 12.5,
      isIncrease: true
    },
    {
      title: 'open-tickets',
      count: 125,
      color: 'error',
      icon: <Clock variant="Bold" />,
      percentage: -5.2,
      isIncrease: false
    },
    {
      title: 'in-progress',
      count: 68,
      color: 'warning',
      icon: <Clock variant="Bold" />,
      percentage: 8.1,
      isIncrease: true
    },
    {
      title: 'resolved',
      count: 1054,
      color: 'success',
      icon: <Check variant="Bold" />,
      percentage: 15.3,
      isIncrease: true
    }
  ];

  const recentTickets = [
    { id: '#TK-001', subject: 'Login Issue', customer: 'John Doe', priority: 'High', status: 'Open' },
    { id: '#TK-002', subject: 'Payment Problem', customer: 'Jane Smith', priority: 'Medium', status: 'In Progress' },
    { id: '#TK-003', subject: 'Feature Request', customer: 'Mike Johnson', priority: 'Low', status: 'Open' },
    { id: '#TK-004', subject: 'Bug Report', customer: 'Sarah Wilson', priority: 'High', status: 'Resolved' },
    { id: '#TK-005', subject: 'Account Access', customer: 'David Brown', priority: 'Medium', status: 'Open' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <>
      {/* <Breadcrumbs custom heading="ticket-dashboard" links={breadcrumbLinks} /> */}
      <Grid container spacing={GRID_COMMON_SPACING}>
        {/* Stats Cards */}
        {ticketStats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <MainCard>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `${stat.color}.main`,
                    bgcolor: `${stat.color}.lighter`
                  }}
                >
                  {stat.icon}
                </Box>
                <Stack sx={{ flexGrow: 1 }}>
                  <Typography variant="h4">{stat.count.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id={stat.title} />
                  </Typography>
                  {stat.percentage && (
                    <Typography 
                      variant="caption" 
                      color={stat.isIncrease ? 'success.main' : 'error.main'}
                    >
                      {stat.isIncrease ? '+' : ''}{stat.percentage}% from last month
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </MainCard>
          </Grid>
        ))}

        {/* Recent Tickets */}
        <Grid size={12}>
          <MainCard title={<FormattedMessage id="recent-tickets" />}>
            <Stack spacing={2}>
              {recentTickets.map((ticket, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                      <Typography variant="subtitle2" color="primary">
                        {ticket.id}
                      </Typography>
                      <Typography variant="body1">
                        {ticket.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {ticket.customer}
                      </Typography>
                    </Stack>
                    <Stack direction="row" sx={{ gap: 1 }}>
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={getPriorityColor(ticket.priority) as any}
                        variant="outlined"
                      />
                      <Chip
                        label={ticket.status}
                        size="small"
                        color={getStatusColor(ticket.status) as any}
                        variant="filled"
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </MainCard>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title={<FormattedMessage id="quick-actions" />}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.lighter'
                    }
                  }}
                >
                  <Ticket variant="Bold" style={{ fontSize: '2rem', color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    <FormattedMessage id="create-new-ticket" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="support" />
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'success.main',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'success.lighter'
                    }
                  }}
                >
                  <Check variant="Bold" style={{ fontSize: '2rem', color: 'success.main' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    <FormattedMessage id="resolve-tickets" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="in-progress" />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* Performance Metrics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title={<FormattedMessage id="performance-metrics" />}>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2"><FormattedMessage id="resolution-rate" /></Typography>
                  <Typography variant="body2" color="success.main">84.5%</Typography>
                </Stack>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '84.5%', bgcolor: 'success.main', borderRadius: 1, height: 8 }} />
                </Box>
              </Box>
              
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2"><FormattedMessage id="average-response-time" /></Typography>
                  <Typography variant="body2" color="warning.main">2.3 hrs</Typography>
                </Stack>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '65%', bgcolor: 'warning.main', borderRadius: 1, height: 8 }} />
                </Box>
              </Box>

              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2"><FormattedMessage id="customer-satisfaction" /></Typography>
                  <Typography variant="body2" color="success.main">4.7/5</Typography>
                </Stack>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '94%', bgcolor: 'success.main', borderRadius: 1, height: 8 }} />
                </Box>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
