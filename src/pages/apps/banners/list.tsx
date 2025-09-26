import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DraggableTable from 'components/third-party/react-table/DraggableTable';
import { useGetBanners, deleteBanner, reorderBanners } from 'api/banners';
import BannerModal from 'sections/apps/banners/BannerModal';
import { Trash, Edit, Add } from 'iconsax-react';

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
  isPermanent?: boolean;
};

import { mutate } from 'swr';
const BannersList = () => {
  const { banners } = useGetBanners();
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleEdit = (id: number) => {
    setEditingId(id);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBanner(id);
      setSnackbar({ open: true, message: 'Banner eliminado correctamente', severity: 'success' });
      mutate('/banners');
    } catch (_err) {
      // debug: log error when in dev to avoid unused-var lint
      console.debug('deleteBanner error', _err);
      setSnackbar({ open: true, message: 'Error al eliminar el banner', severity: 'error' });
    }
  };

  const handleReorder = async (newOrder: BannerRow[]) => {
    try {
      const res = await reorderBanners(newOrder.map((b, idx) => ({ id: b.id, order: idx + 1 })));
      if (res && res.success) {
        setSnackbar({ open: true, message: 'Orden actualizado', severity: 'success' });
        mutate('/banners');
      } else {
        setSnackbar({ open: true, message: 'Error al reordenar', severity: 'error' });
      }
    } catch (_err) {
      console.debug('reorderBanners error', _err);
      setSnackbar({ open: true, message: 'Error al reordenar', severity: 'error' });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingId(null);
    mutate('/banners');
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: '#',
        render: (row: BannerRow) => row.id
      },
      {
        key: 'title',
        header: 'Banner',
        render: (row: BannerRow) => (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar src={row.imagePreviewUrl || ''} alt={String(row.title ?? '')} variant="rounded" />
            <Stack>
              <Typography>{row.title}</Typography>
              <Typography variant="caption">{row.title ?? ''}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        key: 'order',
        header: 'Orden',
        render: (row: BannerRow) => <Typography>{row.order ?? ''}</Typography>
      },
      {
        key: 'startDate',
        header: 'Fecha inicio',
        render: (row: BannerRow) => <Typography>{row.startDate ? new Date(row.startDate).toLocaleDateString() : ''}</Typography>
      },
      {
        key: 'endDate',
        header: 'Fecha término',
        render: (row: BannerRow) => <Typography>{row.endDate ? new Date(row.endDate).toLocaleDateString() : ''}</Typography>
      },
      {
        key: 'status',
        header: 'Estatus',
        render: (row: BannerRow) => {
          let color = 'text.secondary';
          let label = row.status ?? '';
          if (label.toLowerCase() === 'active') color = 'success.main';
          else if (label.toLowerCase() === 'inactive') color = 'text.disabled';
          else if (label) color = 'warning.main';
          return (
            <Typography sx={{ color, fontWeight: 600 }}>
              {label === 'active' ? 'Activo' : label === 'inactive' ? 'Inactivo' : label}
            </Typography>
          );
        }
      },
      {
        key: 'link',
        header: 'Link',
        render: (row: BannerRow) =>
          row.link ? (
            <Typography component="a" href={row.link} target="_blank" rel="noopener noreferrer" color="primary">
              {row.link}
            </Typography>
          ) : (
            <Typography color="text.secondary">-</Typography>
          )
      },
      {
        key: 'isPermanent',
        header: 'Frecuencia',
        render: (row: BannerRow) => {
          const isPerm = row.isPermanent;
          return (
            <Typography sx={{ color: isPerm ? 'primary.main' : 'warning.main', fontWeight: 600 }}>
              {isPerm ? 'Permanente' : 'Temporal'}
            </Typography>
          );
        }
      },
      {
        key: 'actions',
        header: 'Acciones',
        render: (row: BannerRow) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => handleEdit(row.id)}>
              Editar
            </Button>
            <Button size="small" color="error" variant="outlined" startIcon={<Trash />} onClick={async () => handleDelete(row.id)}>
              Eliminar
            </Button>
          </Stack>
        )
      }
    ],
    [banners]
  );

  return (
    <MainCard content={false}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 2.5, pb: 0 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Lista de Banners
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingId(null);
            setOpenModal(true);
          }}
          size="large"
        >
          Agregar banner
        </Button>
      </Stack>
      <DraggableTable columns={columns} rows={banners} onReorder={handleReorder} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <BannerModal open={openModal} onClose={handleCloseModal} bannerId={editingId} />
    </MainCard>
  );
};

export default BannersList;
