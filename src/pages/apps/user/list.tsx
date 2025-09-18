import { useMemo, useState, Fragment, MouseEvent, useContext } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { LabelKeyObject } from 'react-csv/lib/core';
import { PatternFormat } from 'react-number-format';
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
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

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
import AlertUserDelete from 'sections/apps/user/AlertUserDelete';
import AlertDisable2FA from 'sections/apps/user/AlertDisable2FA';
import AlertAssignTeam from 'sections/apps/user/AlertAssignTeam';
import UserModal from 'sections/apps/user/UserModal';
import UserView from 'sections/apps/user/UserView';
import UserHistoryModal from 'sections/apps/user/UserHistoryModal';
import UserSessionsModal from 'sections/apps/user/UserSessionsModal';

import { useGetDepartments, useGetRoles, useGetUser, disable2FA, getUserHistory, getUserSessions } from 'api/user';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// types
import { UserList } from 'types/user';

// assets
import { Add, Edit, Eye, Global, Lock1, SecuritySafe, Ticket, Trash, Shield, People, Monitor } from 'iconsax-react';
import usePermissions from 'hooks/usePermissions';

interface Props {
  columns: ColumnDef<UserList>[];
  data: UserList[];
  modalToggler: () => void;
  hasPerm: (p: string) => boolean;
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, modalToggler, hasPerm }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const sortBy = { id: 'id', desc: false };
  const [statusFilter, setStatusFilter] = useState<string | number>('');
  const filteredData = useMemo(() => {
    if (statusFilter === '') return data;
    if (statusFilter === 1) return data.filter((user) => user.active == true);
    if (statusFilter === 0) return data.filter((user) => user.active == false);
    // return data.filter((user) => user.active === statusFilter);
  }, [statusFilter, data]);

  const table = useReactTable({
    data: filteredData ?? [],
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

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={(theme) => ({
          gap: 2,
          justifyContent: 'space-between',
          p: 3,
          [theme.breakpoints.down('sm')]: { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }
        })}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Buscar en ${data.length} registros...`}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, alignItems: 'center' }}>
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)}}
            displayEmpty
            inputProps={{ 'aria-label': 'Filtro de estado' }}
          >
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value={1}>Activo</MenuItem>
            <MenuItem value={0}>Inactivo</MenuItem>
          </Select>
          {/* <SelectColumnSorting sortBy={sortBy.id} {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} /> */}
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              {hasPerm('user.create') && (
                <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
                  Agregar usuario
                </Button>
              )}
              {hasPerm('user.exportList') && (
                <CSVExport
                  {...{
                    data:
                      table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                        ? data
                        : table.getSelectedRowModel().flatRows.map((row) => row.original),
                    headers,
                    filename: 'lista-usuarios.csv'
                  }}
                />
              )}
            </Stack>
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
                      <TableCell
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
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow
                      sx={(theme) => ({
                        bgcolor: alpha(theme.palette.primary.lighter, 0.1),
                        '&:hover': { bgcolor: `${alpha(theme.palette.primary.lighter, 0.1)} !important` },
                        overflow: 'hidden'
                      })}
                    >
                      <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 2.5, overflow: 'hidden' }}>
                        <UserView data={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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
                getPageCount: table.getPageCount
              }}
            />
          </Box>
        </>
      </Stack>
    </MainCard>
  );
}
// ==============================|| USER LIST ||============================== //

export default function UserListPage() {
  const { usersLoading: loading, users: lists } = useGetUser();
  const { hasPerm } = usePermissions();

  const [open, setOpen] = useState<boolean>(false);
  const { roles, rolesLoading } = useGetRoles();
  const { departments, departmentsLoading } = useGetDepartments();

  const [userModal, setUserModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserList | null>(null);
  const [userDeleteId, setUserDeleteId] = useState<any>('');
  const [disabling2FA, setDisabling2FA] = useState<number | null>(null);

  // Nuevos estados para las alertas y modales
  const [disable2FAAlert, setDisable2FAAlert] = useState<boolean>(false);
  const [assignTeamAlert, setAssignTeamAlert] = useState<boolean>(false);
  const [historyModal, setHistoryModal] = useState<boolean>(false);
  const [sessionsModal, setSessionsModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const handleClose = () => {
    setOpen(!open);
  };

  // Nuevos handlers para las alertas
  const handleDisable2FAClose = () => {
    setDisable2FAAlert(!disable2FAAlert);
  };

  const handleAssignTeamClose = () => {
    setAssignTeamAlert(!assignTeamAlert);
  };

  const handleHistoryModalClose = () => {
    setHistoryModal(!historyModal);
  };

  const handleSessionsModalClose = () => {
    setSessionsModal(!sessionsModal);
  };


  const columns = useMemo<ColumnDef<UserList>[]>(
    () => [
      // {
      //   id: 'Row Selection',
      //   header: ({ table }) => (
      //     <IndeterminateCheckbox
      //       {...{
      //         checked: table.getIsAllRowsSelected(),
      //         indeterminate: table.getIsSomeRowsSelected(),
      //         onChange: table.getToggleAllRowsSelectedHandler()
      //       }}
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <IndeterminateCheckbox
      //       {...{
      //         checked: row.getIsSelected(),
      //         disabled: !row.getCanSelect(),
      //         indeterminate: row.getIsSomeSelected(),
      //         onChange: row.getToggleSelectedHandler()
      //       }}
      //     />
      //   )
      // },
      {
        header: '#',
        accessorKey: 'id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Nombre de usuario',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Avatar
              alt="Avatar"
              size="sm"
              src={getImageUrl(`avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`, ImagePath.USERS)}
            />
            <Stack>
              <Typography variant="subtitle1">{getValue() as string}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{row.original.firstName as string}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Correo',
        accessorKey: 'email',
         meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Rol',
        accessorKey: 'role',
        
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Departamento',
        accessorKey: 'department',
        // cell: ({ row, getValue }) => {
        //   const department = departments.find((dept) => dept.id === getValue());
        //   return (
        //     <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
        //       {department ? department.name : 'Sin departamento'}
        //     </Typography>
        //   );
        // },
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Estado',
        accessorKey: 'active',
        cell: (cell) => {
          if (cell.getValue()) return <Chip color="success" label="Activo" size="small" variant="light" />;
          if (!cell.getValue()) return <Chip color="error" label="Inactivo" size="small" variant="light" />;
        }
      },
      {
        header: '2FA',
        accessorKey: 'isTwoFactorEnabled',
        cell: (cell) => {
          if (cell.getValue()) return <Chip color="primary" label="Activado" size="small" variant="light" />;
          return <Chip color="default" label="Desactivado" size="small" variant="light" />;
        },
        meta: {
          className: 'cell-center'
        }
      },
      
      {
        header: 'Acciones',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? (
              <Box component="span" sx={{ color: 'error.main' }}>
                <Add style={{ transform: 'rotate(45deg)' }} />
              </Box>
            ) : (
              <Eye />
            );
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              {hasPerm('user.update') && (
                <Tooltip title="Editar">
                  <IconButton
                    color="primary"
                    sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setSelectedUser(row.original);
                      setUserModal(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}

              {hasPerm('user.delete') && (
                <Tooltip title="Eliminar">
                  <IconButton
                    sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                    color="error"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setUserDeleteId(Number(row.original.id));
                      handleClose();
                    }}
                  >
                    <Trash />
                  </IconButton>
                </Tooltip>
              )}

              {hasPerm('user.disable2FA') && (
                <Tooltip title="Deshabilitar 2FA">
                  <IconButton
                    sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                    color="warning"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setSelectedUserId(Number(row.original.id));
                      setSelectedUserName(row.original.name || row.original.email || 'Usuario');
                      handleDisable2FAClose();
                    }}
                  >
                    <Shield />
                  </IconButton>
                </Tooltip>
              )}

              {hasPerm('user.assignWorkTeam') && (
                <Tooltip title="Asignar Equipo de Trabajo">
                  <IconButton
                    sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                    color="secondary"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setSelectedUserId(Number(row.original.id));
                      setSelectedUserName(row.original.name || row.original.email || 'Usuario');
                      handleAssignTeamClose();
                    }}
                  >
                    <People />
                  </IconButton>
                </Tooltip>
              )}

              {hasPerm('user.viewHistoryChanges') && (
                <Tooltip title="Historial de Cambios">
                  <IconButton
                    sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                    color="primary"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setSelectedUserId(Number(row.original.id));
                      setSelectedUserName(row.original.name || row.original.email || 'Usuario');
                      handleHistoryModalClose();
                    }}
                  >
                    <Global />
                  </IconButton>
                </Tooltip>
              )}

              {hasPerm('user.viewSessionHistory') && (
                <Tooltip title="Historial de Sesiones">
                  <IconButton
                    sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                    color="info"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setSelectedUserId(Number(row.original.id));
                      setSelectedUserName(row.original.name || row.original.email || 'Usuario');
                      handleSessionsModalClose();
                    }}
                  >
                    <Monitor />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (loading) return <EmptyReactTable />;

  return (
    <>
      <ReactTable
        {...{
          data: lists,
          columns,
          modalToggler: () => {
            setUserModal(true);
            setSelectedUser(null);
          },
          hasPerm
        }}
      />
      <AlertUserDelete id={Number(userDeleteId)} title={userDeleteId} open={open} handleClose={handleClose} />
      <AlertDisable2FA id={Number(selectedUserId)} userName={selectedUserName} open={disable2FAAlert} handleClose={handleDisable2FAClose} />
      <AlertAssignTeam id={Number(selectedUserId)} userName={selectedUserName} open={assignTeamAlert} handleClose={handleAssignTeamClose} />
      <UserHistoryModal open={historyModal} onClose={handleHistoryModalClose} userId={Number(selectedUserId)} userName={selectedUserName} />
      <UserSessionsModal open={sessionsModal} onClose={handleSessionsModalClose} userId={Number(selectedUserId)} userName={selectedUserName} />
      <UserModal open={userModal} modalToggler={setUserModal} user={selectedUser} />
    </>
  );
}
