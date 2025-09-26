import { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  FilterFn,
  ColumnFiltersState,
  HeaderGroup
} from '@tanstack/react-table';

import MainCard from 'components/MainCard';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Box from '@mui/material/Box';
// Tooltip and Typography removed (unused)

import { Add, Edit, ProfileTick } from 'iconsax-react';

import { useGetRoles } from 'api/roles';
import RoleModal from 'sections/apps/roles/RoleModal';
import PermissionsModal from 'sections/apps/roles/PermissionsModal';

import { DebouncedInput, HeaderSort, IndeterminateCheckbox, RowSelection, TablePagination } from 'components/third-party/react-table';
import { Role } from 'types/roles-departments';

const fuzzyFilter: FilterFn<Role> = (row, columnId, value, addMeta) => {
  // simple fuzzy using string includes for names/descriptions
  const cell = String(row.getValue(columnId) ?? '');
  const passed = String(cell).toLowerCase().includes(String(value).toLowerCase());
  return passed;
};

function TableCellWithFilterComponent(props: any) {
  return <TableCell {...props} />;
}

export default function RoleTypesList() {
  const { roles = [] } = useGetRoles();
  const [openModal, setOpenModal] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        id: 'select',
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
        header: 'ID',
        accessorKey: 'id'
      },
      {
        header: 'Nombre',
        accessorKey: 'name'
      },
      {
        header: 'Descripción',
        accessorKey: 'description'
      },
      {
        header: 'Activo',
        accessorKey: 'isActive',
        cell: (cell) => (cell.getValue() ? 'Sí' : 'No')
      },
      {
        header: 'Permisos',
        accessorFn: (row) => (Array.isArray(row.permissions) ? row.permissions.join(', ') : ''),
        id: 'permissions'
      },
      {
        header: 'Acciones',
        id: 'actions',
        cell: ({ row }) => {
          const r = row.original as Role;
          return (
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button
                size="small"
                onClick={() => {
                  setSelectedRole(r);
                  setOpenModal(true);
                }}
                startIcon={<Edit />}
              >
                Editar
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setSelectedRole(r);
                  setOpenPermissions(true);
                }}
                startIcon={<ProfileTick />}
              >
                Permisos
              </Button>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data: roles,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter
  });

  useEffect(() => {
    // reset selection when roles change
    setRowSelection({});
  }, [roles]);

  const headers: any[] = [];
  // build CSV headers if needed later
  columns.forEach((c) => {
    if ((c as any).accessorKey) headers.push({ label: (c as any).header, key: (c as any).accessorKey });
  });

  return (
    <MainCard>
      <Stack direction="row" sx={{ justifyContent: 'space-between', p: 2 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(v) => setGlobalFilter(String(v))}
          placeholder={`Buscar ${roles.length} roles...`}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedRole(null);
            setOpenModal(true);
          }}
        >
          Nuevo rol
        </Button>
      </Stack>

      <Box sx={{ p: 2 }}>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCellWithFilterComponent key={header.id} {...(header.column.columnDef.meta || {})}>
                      {header.isPlaceholder ? null : (
                        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          {header.column.getCanSort() && <HeaderSort column={header.column} />}
                        </Stack>
                      )}
                    </TableCellWithFilterComponent>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCellWithFilterComponent key={cell.id} {...(cell.column.columnDef.meta || {})}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCellWithFilterComponent>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2 }}>
          <TablePagination
            setPageSize={table.setPageSize}
            setPageIndex={table.setPageIndex}
            getState={table.getState}
            getPageCount={table.getPageCount}
            initialPageSize={10}
          />
        </Box>
      </Box>

      <RoleModal open={openModal} onClose={() => setOpenModal(false)} role={selectedRole} />
      <PermissionsModal open={openPermissions} onClose={() => setOpenPermissions(false)} role={selectedRole} />
    </MainCard>
  );
}
