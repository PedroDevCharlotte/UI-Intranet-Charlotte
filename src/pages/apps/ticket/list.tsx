import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
import Avatar from 'components/@extended/Avatar';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import IconButton from 'components/@extended/IconButton';
import TicketCard from 'components/cards/ticket/TicketCard';
import TicketChart from 'components/cards/ticket/TicketChart';
import MainCard from 'components/MainCard';
import TicketsWidget from 'sections/dashboard/tickets/TicketsWidget';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertTicketDelete from 'sections/apps/ticket/AlertTicketDelete';
import AddTicketModal from 'sections/apps/ticket/AddTicketModal';
import RichTextModal from 'sections/apps/ticket/RichTextModal';

import { handlerDelete, closeTicket, useGetTicket, useGetTicketMaster, updateTicketStatus } from 'api/ticket';
import { openSnackbar } from 'api/snackbar';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// types
import { TicketList } from 'types/ticket';
import { SnackbarProps } from 'types/snackbar';

// assets
import { Add, Edit, Eye, InfoCircle, ProfileTick, Trash } from 'iconsax-react';
import { Button } from '@mui/material';
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
  const [sorting, setSorting] = useState<SortingState>([{ id: 'customer_name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

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

  useEffect(() => {
    setColumnFilters(activeTab === 'All' ? [] : [{ id: 'status', value: activeTab }]);
  }, [activeTab]);

  // update createdAt filter when date range changes
  useEffect(() => {
    const filters: any[] = activeTab === 'All' ? [] : [{ id: 'status', value: activeTab }];
    if (dateFrom || dateTo) {
      filters.push({ id: 'createdAt', value: { from: dateFrom, to: dateTo } });
    }
    setColumnFilters(filters as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, activeTab]);

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
                label={
                status === 'All'
                  ? data.length
                  : counts[status] || 0
                }
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
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        />
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
                initialPageSize: 5
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
    console.log('New ticket data:', ticketData);
    // For now, we'll just close the modal
    setOpenAddModal(false);
  };

  const columns = useMemo<ColumnDef<TicketList>[]>(
    () => [
      {
        id: 'Row Selection',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: 'ID Ticket',
        accessorKey: 'ticketNumber',
        meta: { className: 'cell-center' }
      },
      {
        header: 'Información del Colaborador',
        accessorKey: 'customer_name',
        cell: ({ row, getValue }) => {
          let name = row.original || '';
          // console.log('Row data:', row.original);
          return (
            <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
              <Stack>
                <Typography variant="subtitle1">
                  {(row.original?.creator?.firstName + ' ' + row.original?.creator?.lastName) as string}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{row.original?.creator?.email as string}</Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        header: 'Asunto',
        accessorKey: 'title'
      },
      {
        header: 'Asignado a',
        accessorKey: 'employee_name',
        cell: ({ row, getValue }) => {
          let name = row.original || '';
          // console.log('Row data:', row.original);
          return (
            <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
              <Stack>
                <Typography variant="subtitle1">
                  {(row.original?.assignee?.firstName + ' ' + row.original?.assignee?.lastName) as string}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },

      // {
      //   header: 'Prioridad',
      //   accessorKey: 'priority',
      //   cell: (cell) => {
      //     switch (cell.getValue()) {
      //       case 'High':
      //         return <Chip color="error" label="Alta" size="small" variant="light" />;
      //       case 'Medium':
      //         return <Chip color="warning" label="Media" size="small" variant="light" />;
      //       case 'Low':
      //       default:
      //         return <Chip color="info" label="Baja" size="small" variant="light" />;
      //     }
      //   }
      // },
      {
        header: 'Categoría',
        accessorKey: 'ticketType.code'
      },
      {
        header: 'Fecha de Creación',
        accessorKey: 'createdAt',
  filterFn: dateRangeFilter,
  cell: ({ getValue }) => {
          const dateValue = getValue() as string | number | Date;
          return <Typography variant="body2">{new Date(dateValue).toLocaleDateString()}</Typography>;
        }
      },
      {
        header: 'Estado',
        accessorKey: 'status',
        filterFn: exactValueFilter,
        cell: (cell) => {
            switch (cell.getValue()) {
            case 'OPEN':
              return <Chip color="error" label="Abierto" size="small" variant="light" />;
            case 'IN_PROGRESS':
              return <Chip color="warning" label="En proceso" size="small" variant="light" />;
            case 'FOLLOW_UP':
              return <Chip color="info" label="En seguimiento" size="small" variant="light" />;
            case 'COMPLETED':
              return <Chip color="success" label="Finalizado" size="small" variant="light" />;
            case 'CLOSED':
              return <Chip color="default" label="Cerrado" size="small" variant="light" />;
            case 'NON_CONFORMITY':
              return <Chip color="secondary" label="No conformidad" size="small" variant="light" />;
            case 'CANCELLED':
              return <Chip color="default" label="Cancelado" size="small" variant="light" />;
            default:
              return <Chip color="default" label={String(cell.getValue())} size="small" variant="light" />;
            }
        },
        meta: {}
      },
      {
        header: 'Acciones',
        meta: { className: 'cell-center' },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="Ver ticket">
                <IconButton
                  color="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    navigation(`/apps/ticket/details/${row?.original?.id}`);
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title="Editar ticket">
                <IconButton
                  color="primary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    navigation(`/apps/ticket/edit/${row?.original?.id}`);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip> */}
              {/* <Tooltip title="Eliminar ticket">
                <IconButton
                  color="error"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setTicketId(row?.original?.id);
                    handlerDelete(true);
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip> */}
              <Tooltip title="Cerrar ticket">
                <IconButton
                  color="success"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setClosingTicketId(row?.original?.id);
                    setOpenCloseModal(true);
                  }}
                >
                  <ProfileTick />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const theme = useTheme();

  const widgetsData: TicketWidgets[] = [
    {
      title: 'Abierto',
      count: '125',
      percentage: 35.2,
      isLoss: true,
      ticket: '9',
      color: theme.palette.error,
      chartData: [200, 600, 100, 400, 300, 400, 50]
    },
    {
      title: 'En Proceso',
      count: '68',
      percentage: 18.7,
      isLoss: false,
      ticket: '6',
      color: theme.palette.warning,
      chartData: [100, 550, 300, 350, 200, 100, 300]
    },
    {
      title: 'Resuelto',
      count: '247',
      percentage: 46.1,
      isLoss: false,
      ticket: '4',
      color: theme.palette.success,
      chartData: [100, 550, 200, 300, 100, 200, 300]
    }
  ];

  //   let breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'ticket', to: '/apps/ticket/dashboard' }, { title: 'list' }];

  return (
    <>
      {/* <Breadcrumbs custom heading="ticket-list" links={breadcrumbLinks} /> */}
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ pb: 2 }}>
        <TicketsWidget />
        <Grid size={12}>
          {ticketLoading ? <EmptyReactTable /> : <ReactTable {...{ data: list, columns, onOpenAddModal: () => setOpenAddModal(true) }} />}
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
                openSnackbar({ open: true, message: 'Ticket cerrado correctamente', anchorOrigin: { vertical: 'top', horizontal: 'right' }, variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
              } catch (err) {
                console.error('Error closing ticket', err);
                openSnackbar({ open: true, message: 'Error al cerrar el ticket', anchorOrigin: { vertical: 'top', horizontal: 'right' }, variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
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
