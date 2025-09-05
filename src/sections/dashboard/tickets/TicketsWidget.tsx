import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { ArrowRight } from 'iconsax-react';
import Grid from '@mui/material/Grid2';
import MainCard from 'components/MainCard';
import TicketCard from 'components/cards/ticket/TicketCard';
import TicketChart from 'components/cards/ticket/TicketChart';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from 'components/@extended/Avatar';
import Typography from '@mui/material/Typography';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import { ProfileTick, InfoCircle } from 'iconsax-react';
import { useTheme } from '@mui/material/styles';
import { getTicketStatistics } from 'api/ticket';
import { useGetTicketStatisticsAdvisors } from 'api/ticketStatisticsAdvisors';
import useAuth from 'hooks/useAuth';
import { TicketStatsByStatus } from 'types/ticket';

interface TicketWidgets {
  title: string;
  count: string;
  percentage: number;
  isLoss: boolean;
  ticket: string;
  color: any;
  chartData: number[];
  status?: string;
}

function LinearWithLabel({ value, ...others }: LinearProgressProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress color="warning" variant="determinate" value={value} {...others} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${Math.round(value!)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function TicketsWidget() {
  const theme = useTheme();
  const { dataStatistics, dataStatisticsLoading } = getTicketStatistics();
  const { advisors, advisorsLoading } = useGetTicketStatisticsAdvisors();
  const { user } = useAuth();

  const navigate = useNavigate();

  // Helper para saber si el usuario es admin del sistema
  const isAdmin = user?.role === 'Administrador del Sistema';

  const totalClosed: number = (dataStatistics?.byStatus as TicketStatsByStatus[] | undefined)?.find((e: TicketStatsByStatus) => e.status === 'CLOSED')?.count || 0;
  // helper: map status codes to display label and theme color
  const statusLabel = (status: string) =>
    status === 'OPEN'
      ? 'Abierto'
      : status === 'IN_PROGRESS'
      ? 'En Proceso'
      : status === 'FOLLOW_UP'
      ? 'En Seguimiento'
      : status === 'COMPLETED'
      ? 'Finalizado'
      : status === 'CLOSED'
      ? 'Cerrado'
      : status === 'NON_CONFORMITY'
      ? 'No Conformidad'
      : status === 'CANCELLED'
      ? 'Cancelado'
      : status;

  const statusColor = (status: string) =>
    status === 'OPEN'
      ? theme.palette.error
      : status === 'IN_PROGRESS'
      ? theme.palette.warning
      : status === 'FOLLOW_UP'
      ? theme.palette.info
      : status === 'COMPLETED'
      ? theme.palette.success
      : status === 'NON_CONFORMITY'
      ? theme.palette.secondary
      : theme.palette.primary;

  const total = Number(dataStatistics?.total ?? 0);

  const widgetsData: TicketWidgets[] = (dataStatistics?.byStatus ?? []).map((s: any) => {
    const countNumber = Number(s.count) || 0;
    const percentage = total > 0 ? (countNumber / total) * 100 : 0;
    return {
      title: statusLabel(s.status),
      count: String(countNumber),
      percentage: Math.round(percentage * 10) / 10,
      isLoss: s.status === 'OPEN',
      ticket: String(countNumber),
      color: statusColor(s.status),
      chartData: [],
      status: s.status
    } as TicketWidgets;
  });

  // Fallback if API returns nothing yet (show some placeholders)
  const displayWidgets = widgetsData.length ? widgetsData : [
    { title: 'Abierto', count: '0', percentage: 0, isLoss: true, ticket: '0', color: theme.palette.error, chartData: [] },
    { title: 'En Proceso', count: '0', percentage: 0, isLoss: false, ticket: '0', color: theme.palette.warning, chartData: [] },
    { title: 'Resuelto', count: '0', percentage: 0, isLoss: false, ticket: '0', color: theme.palette.success, chartData: [] }
  ];

  if (isAdmin) {
    // Mostrar un TicketCard por cada advisor
    return (
      <Grid size={{ xs: 12, md: 12 }}>
        <Grid container direction="row" spacing={2}>
          {advisors.map((advisor: any) => {
            // Color para avgResolutionHours
            let avgColor = 'success.main';
            if (advisor.avgResolutionHours > 48) avgColor = 'error.main';
            else if (advisor.avgResolutionHours > 24) avgColor = 'warning.main';
            // Mostrar solo si existe avgResolutionHours
            return (
              <Grid key={advisor.advisorId} size={{ xs: 12, sm: 3 }}>
                <MainCard>
                  <TicketCard
                    title={advisor.advisorName}
                    count={String(
                      (advisor.counts.OPEN || 0) + (advisor.counts.IN_PROGRESS || 0) + (advisor.counts.CLOSED || 0)
                    )}
                    percentage={undefined}
                    isLoss={false}
                    ticket={''}
                    color={theme.palette.primary.main}
                  > 
                    <Stack direction="column" sx={{ gap: 1 }}>
                      <Typography variant="body2" color="error">Abiertos: {advisor.counts.OPEN || 0}</Typography>
                      <Typography variant="body2" color="warning.main">En Proceso: {advisor.counts.IN_PROGRESS || 0}</Typography>
                      <Typography variant="body2" color="success.main">Cerrados: {advisor.counts.CLOSED || 0}</Typography>
                      
                    </Stack>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      {!window.location.pathname.includes('/apps/ticket/list') && (<Button
                        variant="contained"
                        color="primary"
                        size="small"
                        endIcon={<ArrowRight size={18} style={{ marginLeft: 4 }} />}
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: 1 }}
                        onClick={() => navigate(`/apps/ticket/list?status=ALL&advisorId=${advisor.advisorId}`)}
                      >
                        Ver
                      </Button>
                      )}
                    </Box>
                  </TicketCard>
                </MainCard>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    );
  }

  // Si no es admin, render original
  return (
    <Grid size={{ xs: 12, md: 12 }}>
      <Grid container direction="row" spacing={2}>
        {widgetsData.map((widget: TicketWidgets, index: number) => (
          <Grid key={index} size={{ xs: 12, sm: 3 }}>
            <MainCard>
              <TicketCard
                title={widget.title}
                count={widget.count}
                percentage={widget.percentage}
                isLoss={widget.isLoss}
                ticket=""
                color={widget.color.main}
              >
                {/* <TicketChart color={widget.color} data={widget.chartData} /> */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  {!window.location.pathname.includes('/apps/ticket/list') && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      endIcon={<ArrowRight size={18} style={{ marginLeft: 4 }} />}
                      sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: 1 }}
                      onClick={() => navigate(`/apps/ticket/list?status=${encodeURIComponent(widget.status || 'ALL')}`)}
                    >
                      Ver 
                    </Button>
                  )}
                </Box>
              </TicketCard>
            </MainCard>
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 3 }} sx={{ mt: 2 }}>
          <Box
            sx={(themeParam) => ({
              p: 1.75,
              borderRadius: 1,
              color: 'background.paper',
              ...(themeParam.applyStyles && themeParam.applyStyles('dark', { color: 'text.primary' })),
              background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
            })}
          >
            <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Avatar alt="Tickets" variant="rounded" type="filled" sx={{ color: 'inherit' }}>
                  <ProfileTick style={{ fontSize: '20px' }} />
                </Avatar>
                <Box>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    <Typography variant="body1">Total de Tickets</Typography>
                    <InfoCircle />
                  </Stack>
                  <Stack direction="row" sx={{ gap: 1 }}>
                    <Typography variant="body1">{dataStatistics.total || 0}</Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" sx={{ gap: 1 }}>
                <Typography variant="body2">Cerrados</Typography>
                <Typography variant="body1">{totalClosed || 0}</Typography>
              </Stack>
            </Stack>
            {/* <Box sx={{ maxWidth: '100%', '& .MuiTypography-root': { color: 'inherit' } }}>
              <LinearWithLabel value={((totalClosed / dataStatistics.total) * 100) || 0} />
            </Box> */}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
