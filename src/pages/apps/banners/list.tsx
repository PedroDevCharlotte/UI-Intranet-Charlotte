import React, { useMemo, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

// third-party
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
import TableContainer from '@mui/material/TableContainer';

import { useGetBanners, deleteBanner } from 'api/banners';
import BannerModal from 'sections/apps/banners/BannerModal';
import { Trash, Edit, Add } from 'iconsax-react';

import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

type BannerRow = {
  id: number;
  title: string;
  description?: string;
  link?: string;
  imagePath?: string;
  imageFileName?: string;
  imageBase64?: string;
  imagePreviewUrl?: string;
  active?: boolean;
  order?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
};

function ReactTable({ data, columns, modalToggler }: { data: BannerRow[]; columns: ColumnDef<BannerRow>[]; modalToggler: () => void }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  let headers: { label: string; key: string }[] = [];
  columns.forEach((c) => {
    const key = (c as any).accessorKey;
    if (key) headers.push({ label: typeof c.header === 'string' ? c.header : '#', key: String(key) });
  });

  return (
    <MainCard content={false}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, p: 2.5,  justifyContent: 'space-between', pb: 0 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Buscar en ${data.length} registros...`}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, alignItems: 'center' }}>
          <SelectColumnSorting
            sortBy={{ id: 'id', desc: false }.id}
            {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting: setSorting }}
          />
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
              Agregar banner
            </Button>
            <CSVExport
              data={
                table.getSelectedRowModel().flatRows.map((r) => r.original).length === 0
                  ? data
                  : table.getSelectedRowModel().flatRows.map((r) => r.original)
              }
              headers={headers}
              filename="lista-banners.csv"
            />
          </Stack>
        </Stack>
      </Stack>

      <RowSelection selected={Object.keys(rowSelection).length} />
      <TableContainer>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<BannerRow>) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ textAlign: 'left', padding: '12px' }}>
                    {header.isPlaceholder ? null : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                        {header.column.getCanSort() && <HeaderSort column={header.column} />}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: '12px', verticalAlign: 'middle' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>

      <TablePagination
        setPageSize={table.setPageSize}
        setPageIndex={table.setPageIndex}
        getState={table.getState}
        getPageCount={table.getPageCount}
      />
    </MainCard>
  );
}

export default function BannersList() {
  const { banners, bannersLoading } = useGetBanners();
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const data = useMemo(
    () =>
      (banners || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        description: b.description || b.subtitle,
        link: b.link,
        order: b.order,
        imagePath: b.imagePath || b.imageUrl,
        imageFileName: b.imageFileName,
        imageBase64: b.imageBase64,
        imagePreviewUrl: b.imagePreviewUrl
      })),
    [banners]
  );

  const columns = useMemo<ColumnDef<BannerRow>[]>(
    () => [
      { header: '#', accessorKey: 'id' },
      {
        header: 'Banner',
        accessorKey: 'title',
        cell: ({ row, getValue }) => {
          // console.log("Datos",row.original);
          return (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar src={ row.original.imagePreviewUrl} alt={String(getValue())} variant="rounded" />
            <Stack>
              <Typography>{getValue() as string}</Typography>
              <Typography variant="caption">{row.original.imagePreviewUrl}</Typography>
            </Stack>
          </Stack>
        )}
      },
      {
        header: 'Orden',
        accessorKey: 'order',
        cell: ({ row, getValue }) =>{
          console.log(row.original);
          return <Typography>{row.original.order as number}</Typography>
        }
      },
      {
        header: 'Link',
        accessorKey: 'link',
        cell: ({ getValue }) => (
          <Typography component="a" href={getValue() as string} target="_blank" rel="noopener noreferrer" color="primary">
            {getValue() as string}
          </Typography>
        )
      },
      {
        header: 'Acciones',
        accessorKey: 'id',
        cell: ({ getValue }) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {
                setEditingId(Number(getValue()));
                setOpenModal(true);
              }}
            >
              Editar
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<Trash />}
              onClick={async () => {
                await deleteBanner(Number(getValue()));
              }}
            >
              Eliminar
            </Button>
          </Stack>
        )
      }
    ],
    []
  );

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ pb: 2 }}>
        <Grid size={12}>
          <ReactTable
            data={data}
            columns={columns}
            modalToggler={() => {
              setEditingId(null);
              setOpenModal(true);
            }}
          />
          <BannerModal open={openModal} onClose={() => setOpenModal(false)} bannerId={editingId} onSaved={() => {}} />
        </Grid>
      </Grid>
    </>
  );
}
