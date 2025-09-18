import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Hook para obtener los parámetros de la query string
function useQueryFilters() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const status = params.get('status');
  const advisorId = params.get('advisorId');
  return { status, advisorId };
}
import { FormattedMessage } from 'react-intl';

// material-ui
import { useTheme, PaletteColor } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

// third-party
import { LabelKeyObject } from 'react-csv/lib/core';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  ColumnDef,
  HeaderGroup,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  FilterFn,
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports

import MainCard from 'components/MainCard';
import TicketsWidget from 'sections/dashboard/tickets/TicketsWidget';
import usePermissions from 'hooks/usePermissions';
import useAuth from 'hooks/useAuth';

import {
  
  HeaderSort,
  RowSelection,
  TablePagination
} from 'components/third-party/react-table';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertTicketDelete from 'sections/apps/ticket/AlertTicketDelete';
import AddTicketModal from 'sections/apps/ticket/AddTicketModal';
import RichTextModal from 'sections/apps/ticket/RichTextModal';

import { handlerDelete, closeTicket, useGetTicket, useGetTicketMaster, updateTicketStatus } from 'api/ticket';
import { useGetSupportUsers } from 'api/user';
import { openSnackbar } from 'api/snackbar';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// types
import { TicketList } from 'types/ticket';
import { SnackbarProps } from 'types/snackbar';

// assets
import { Add, Edit, Eye, InfoCircle, MessageTick, ProfileTick, Trash } from 'iconsax-react';
import { Button, IconButton } from '@mui/material';
import { formatDate } from 'date-fns';

const fuzzyFilter: FilterFn<TicketList> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

const exactValueFilter: FilterFn<TicketList> = (row, columnId, filterValue) => {
  return String(row.getValue(columnId)) === String(filterValue);
};

const dateRangeFilter: FilterFn<TicketList> = (row, columnId, filterValue) => {
  // filterValue expected to be an object: { from?: string | null, to?: string | null }
  try {
    const cell = row.getValue(columnId) as string | number | Date | undefined | null;
    if (!filterValue || (!filterValue.from && !filterValue.to)) return true;
    if (!cell) return false;

    const cellTime = new Date(cell).getTime();

    if (filterValue.from) {
      const fromTime = new Date(filterValue.from).setHours(0, 0, 0, 0);
      if (cellTime < fromTime) return false;
    }
    if (filterValue.to) {
      const toTime = new Date(filterValue.to).setHours(23, 59, 59, 999);
      if (cellTime > toTime) return false;
    }

    return true;
  } catch (e) {
    return true;
  }
};

function ExactValueFilter({ column: { filterValue, setFilter } }: any) {
  return (
    <input value={filterValue || ''} onChange={(e) => setFilter(e.target.value || undefined)} placeholder="Filter by exact value..." />
  );
}

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}

function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

interface TicketWidgets {
  title: string;
  count: string;
  percentage: number;
  isLoss: boolean;
  ticket: string;
  color: PaletteColor;
  chartData: number[];
}

interface Props {
  data: TicketList[];
  columns: ColumnDef<TicketList>[];
  onOpenAddModal: () => void;
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, onOpenAddModal }: Props) {
  const groups = ['All', ...new Set(data.map((item: TicketList) => item.status))];
  const sortBy = { id: 'id', desc: false };

  const countGroup = data.map((item: TicketList) => item.status);
  const counts = countGroup.reduce(
    (acc: any, value: any) => ({
      ...acc,
      [value]: (acc[value] || 0) + 1
    }),
    {}
  );

  const [activeTab, setActiveTab] = useState(groups[0]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'status', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [visibleSearch, setVisibleSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [assignedFilter, setAssignedFilter] = useState<number | string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { supportUsers, supportUsersLoading } = useGetSupportUsers();

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true
  });

  let headers: LabelKeyObject[] = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  // Sincroniza los filtros de la URL con los filtros de columna SOLO al cargar la página por primera vez
  const { status: urlStatus, advisorId: urlAdvisorId } = useQueryFilters();

  useEffect(() => {
    if (!initialized) {
      if (urlStatus && urlStatus !== 'ALL') {
        setActiveTab(urlStatus);
      }
      if (urlAdvisorId) setAssignedFilter(urlAdvisorId);
      setInitialized(true);
    }
  }, [initialized, urlStatus, urlAdvisorId]);

  useEffect(() => {
    let filters: any[] = activeTab === 'All' ? [] : [{ id: 'status', value: activeTab }];
    if (assignedFilter !== null && assignedFilter !== undefined && assignedFilter !== '') {
      filters.push({ id: 'assignedTo', value: assignedFilter });
    }
    setColumnFilters(filters as any);
  }, [activeTab, assignedFilter]);

  // update createdAt filter when date range changes
  useEffect(() => {
    let filters: any[] = activeTab === 'All' ? [] : [{ id: 'status', value: activeTab }];

    // Only add date filter if at least one value is set
    if (dateFrom || dateTo) {
      let toValue = dateTo;
      if (dateTo) {
        let toDate = new Date(dateTo);
        // if (dateFrom && dateTo === dateFrom) {
        toDate.setDate(toDate.getDate() + 1);
        // }
        toValue = toDate.toISOString().slice(0, 10);
      }
      // Only push if at least one is not empty
      if (dateFrom || toValue) {
        filters.push({ id: 'createdAt', value: { from: dateFrom, to: toValue } });
      }
    }
    if (assignedFilter !== null && assignedFilter !== undefined && assignedFilter !== '') {
      filters.push({ id: 'assigneeName', value: assignedFilter });
    }
    setColumnFilters(filters as any);
  }, [dateFrom, dateTo, activeTab, assignedFilter]);

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<{}>, value: string) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {groups.map((status: string, index: number) => (
            <Tab
              key={index}
              label={
                status === 'All'
                  ? 'Todos'
                  : status === 'OPEN'
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
                                : status
              }
              value={status}
              icon={
                <Chip
                  label={status === 'All' ? data.length : counts[status] || 0}
                  color={
                    status === 'All'
                      ? 'primary'
                      : status === 'OPEN'
                        ? 'error'
                        : status === 'IN_PROGRESS'
                          ? 'warning'
                          : status === 'FOLLOW_UP'
                            ? 'info'
                            : status === 'COMPLETED'
                              ? 'success'
                              : status === 'CLOSED'
                                ? 'default'
                                : status === 'NON_CONFORMITY'
                                  ? 'secondary'
                                  : status === 'CANCELLED'
                                    ? 'default'
                                    : 'default'
                  }
                  variant="light"
                  size="small"
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', padding: 2.5, width: 1 }}
      >
        {/* <DebouncedInput
          value={visibleSearch ?? ''}
          onFilterChange={(value) => {
            setVisibleSearch(String(value));
            setGlobalFilter(String(value)); // Corregido: ahora sí filtra la tabla
          }}
          placeholder={`Buscar ${data.length} registros en la página actual...`}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        /> */}
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateFrom ?? ''}
            onChange={(e) => setDateFrom(e.target.value || null)}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateTo ?? ''}
            onChange={(e) => setDateTo(e.target.value || null)}
          />
          <TextField
            select
            size="small"
            label="Asignado a"
            value={assignedFilter ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              const val = v === '' ? null : v;
              setAssignedFilter(val);
              // console.log('Assigned filter changed to:', val);
              // reset to first page when filter changes
              try {
                table.setPageIndex(0);
              } catch (err) {
                console.log('Table not ready', err);
                // table may not be ready in some contexts
              }
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {Array.isArray(supportUsers) &&
              supportUsers.map((u: any) => (
                <MenuItem key={u.fullName} value={u.fullName}>
                  {u.fullName}
                </MenuItem>
              ))}
          </TextField>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setAssignedFilter(null);
              setDateFrom(null);
              setDateTo(null);
              setGlobalFilter('');
              setVisibleSearch('');
              try {
                table.setPageIndex(0);
              } catch (err) {
                // ignore
              }
            }}
          >
            Limpiar filtros
          </Button>
        </Stack>
        <Stack direction="row" sx={{ width: 1, gap: 2, alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          {/* <SelectColumnSorting sortBy={sortBy.id} {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} /> */}
          <Button variant="contained" startIcon={<Add />} onClick={onOpenAddModal} size="large">
            <FormattedMessage id="new-ticket" />
          </Button>
          {/* <CSVExport {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'ticket-list.csv' }} /> */}
        </Stack>
      </Stack>

      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                      Object.assign(header.column.columnDef.meta, {
                        className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                      });
                    }

                    return (
                      <TableCellWithFilterComponent
                        key={header.id}
                        {...header.column.columnDef.meta}
                        onClick={header.column.getToggleSortingHandler()}
                        {...(header.column.getCanSort() &&
                          header.column.columnDef.meta === undefined && {
                            className: 'cursor-pointer prevent-select'
                          })}
                      >
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                            <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCellWithFilterComponent>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCellWithFilterComponent key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCellWithFilterComponent>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount,
                initialPageSize: 25
              }}
            />
          </Box>
        </>
      </Stack>
    </MainCard>
  );
}

// ==============================|| TICKET - LIST ||============================== //

export default function List() {
  const { ticketLoading, ticket: list } = useGetTicket();
  const { ticketMaster } = useGetTicketMaster();
  const [ticketId, setTicketId] = useState(0);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [closingTicketId, setClosingTicketId] = useState<number>(0);
  const [closeComment, setCloseComment] = useState('');

  const navigation = useNavigate();
  const handleClose = (status: boolean) => {
    if (status) {
    }
    handlerDelete(false);
  };

  const handleAddTicket = (ticketData: any) => {
    // Here you would typically call an API to create the ticket
    // console.log('New ticket data:', ticketData);
    // For now, we'll just close the modal
    setOpenAddModal(false);
  };

  const { user: currentUser } = useAuth();
  const currentUserId = currentUser && currentUser.id ? Number(currentUser.id) : undefined;

  const columns = useMemo<ColumnDef<TicketList>[]>(
    () => [
      {
        header: 'Folio',
        accessorKey: 'ticketNumber',
        meta: { className: 'cell-center' }
      },
      {
        header: 'Título',
        accessorKey: 'title',
      },
      {
        header: 'Estatus',
        accessorKey: 'status',
        cell: info => {
          const value = info.getValue();
          let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
          let label = value;
          switch (value) {
            case 'OPEN':
              color = 'error';
              label = 'Abierto';
              break;
            case 'IN_PROGRESS':
              color = 'warning';
              label = 'En Proceso';
              break;

            case 'FOLLOW_UP':
              color = 'info';
              label = 'En Seguimiento';
              break;
            case 'COMPLETED':
              color = 'success';
              label = 'Finalizado';
              break;
            case 'CLOSED':
              color = 'default';
              label = 'Cerrado';
              break;
            case 'NON_CONFORMITY':
              color = 'secondary';
              label = 'No Conformidad';
              break;
            case 'CANCELLED':
              color = 'default';
              label = 'Cancelado';
              break;
            default:
              color = 'default';
              label = value;
              break;
          }
          return <Chip label={label ? String(label) : ''} color={color} variant="light" />;
        },
        filterFn: exactValueFilter,
        meta: { className: 'cell-center' }
            
      },
      {
        header: 'Tipo',
        accessorKey: 'ticketTypeName',
      },
      {
        header: 'Creador',
        accessorKey: 'creatorName',
      },
      {
        header: 'Asignado',
        accessorKey: 'assigneeName',
      },
      {
        header: 'Creado',
        accessorKey: 'createdAt',
        cell: info => {
          const value = info.getValue();
          if (!value) return '';
          const date = new Date(value as string);
          return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
        },
        filterFn: dateRangeFilter,
        meta: { className: 'cell-center' }
      },
      {
        header: 'Ver detalle',
        id: 'verDetalle',
        cell: ({ row }) => {
          const navigate = useNavigate();
          return (
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/apps/ticket/details/${row.original.id}`)}
              startIcon={<Eye size={18} />}
            >
              Ver
            </Button>
          );
        },
        meta: { className: 'cell-center' }
      },
      {
        header: 'Encuesta',
        id: 'encuesta',
        cell: ({ row }) => {
          const navigate = useNavigate();
          // show only when ticket is CLOSED
          if (row.original.status !== 'CLOSED') return null;
          // show only to the creator of the ticket
          if (!currentUser) return null;
          // convert current user id to number and validate
          if (currentUserId === undefined || Number.isNaN(currentUserId)) return null;
          // use createdBy (numeric id) to compare with currentUserId
          if (row.original.createdBy !== currentUserId) return null;
          return (
            <Tooltip title="Responder encuesta">
              <IconButton
                size="medium"
                color="primary"
                aria-label="Responder encuesta"
                onClick={() => navigate(`/apps/ticket/feedback/${row.original.id}`)}
              >
                <MessageTick size={18} />
              </IconButton>
            </Tooltip>
          );
        },
        meta: { className: 'cell-center' }
      },
    ],
    []
  );

  const theme = useTheme();

  const { hasPerm } = usePermissions();
 

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ pb: 2 }}>
        {/* Mostrar TicketsWidget sólo si el usuario tiene el permiso tickets.viewDashboardTicket */}
        {(() => {
            return hasPerm('tickets.viewDashboardTicket') ? <TicketsWidget /> : null;
        })()}
        <Grid size={12}>
          {(() => {
            return ticketLoading ? (
              <EmptyReactTable />
            ) : (
              <ReactTable {...{ data: list, columns, onOpenAddModal: () => setOpenAddModal(true) }} />
            );
          })()}
          <AlertTicketDelete title={ticketId.toString()} open={ticketMaster ? ticketMaster.alertPopup : false} handleClose={handleClose} />
          <AddTicketModal open={openAddModal} onClose={() => setOpenAddModal(false)} onSubmit={handleAddTicket} />
          <RichTextModal
            open={openCloseModal}
            onClose={() => {
              setOpenCloseModal(false);
              setClosingTicketId(0);
            }}
            onSubmit={async (content: string) => {
              setCloseComment(content);
              if (!closingTicketId) return;
              try {
                await closeTicket(closingTicketId, content);
                openSnackbar({
                  open: true,
                  message: 'Ticket cerrado correctamente',
                  anchorOrigin: { vertical: 'top', horizontal: 'right' },
                  variant: 'alert',
                  alert: { color: 'success' }
                } as SnackbarProps);
              } catch (err) {
                console.error('Error closing ticket', err);
                openSnackbar({
                  open: true,
                  message: 'Error al cerrar el ticket',
                  anchorOrigin: { vertical: 'top', horizontal: 'right' },
                  variant: 'alert',
                  alert: { color: 'error' }
                } as SnackbarProps);
              } finally {
                setOpenCloseModal(false);
                setClosingTicketId(0);
              }
            }}
            title="Cerrar ticket"
            label="Motivo de cierre"
            submitText="Cerrar"
            idTicket={closingTicketId}
          />
        </Grid>
      </Grid>
    </>
  );
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
