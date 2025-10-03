import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  TablePagination,
  Stack,
  Typography,
  Chip
} from '@mui/material';
import { Edit, Trash, SearchNormal1, DocumentDownload, DocumentText } from 'iconsax-react';

type Props = {
  items: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onDownloadExcel?: (item: any) => void;
  onDownloadPDF?: (item: any) => void;
  canRead?: boolean;
};

export default function NonConformitiesTable({ items, onEdit, onDelete, onDownloadExcel, onDownloadPDF, canRead = true }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtrar items basado en el término de búsqueda
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter((item) =>
      item.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.areaOrProcess?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Aplicar paginación
  const paginatedItems = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode?.toUpperCase()) {
      case 'CERRADA':
        return 'success';
      case 'EN_SEGUIMIENTO':
        return 'warning';
      case 'RETRASADO':
        return 'error';
      case 'CANCELADO':
        return 'default';
      default:
        return 'info';
    }
  };

  const getStatusChip = (item: any) => {
    if (item.statusOption) {
      return (
        <Chip
          label={item.statusOption.displayText || item.statusOption.value}
          size="small"
          sx={{
            backgroundColor: item.statusOption.color || '#ccc',
            color: item.statusOption.color ? (
              // Calcular contraste automáticamente
              parseInt(item.statusOption.color.replace('#', ''), 16) > 0xffffff/2 ? '#000' : '#fff'
            ) : '#000',
            fontWeight: 'bold',
            '& .MuiChip-label': {
              fontSize: '0.75rem'
            }
          }}
        />
      );
    }
    
    // Fallback para estados sin statusOption
    return (
      <Chip
        label={item.status || 'Sin estado'}
        size="small"
        color={getStatusColor(item.status)}
      />
    );
  };

  // Si no tiene permisos de lectura, mostrar mensaje
  if (!canRead) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No tienes permisos para ver las no conformidades
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <SearchNormal1 size={20} color="#9e9e9e" />
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por número, título, área o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={1}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Número</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Área/Proceso</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha Creación</TableCell>
              {(onEdit || onDelete || onDownloadExcel || onDownloadPDF) && (
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(onEdit || onDelete || onDownloadExcel || onDownloadPDF) ? 7 : 6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay no conformidades registradas'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                      {item.title || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>
                      {item.typeOption?.displayText || item.type || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.areaOption?.displayText || item.areaOrProcess || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(item)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.createdAt)}
                    </Typography>
                  </TableCell>
                  {(onEdit || onDelete || onDownloadExcel || onDownloadPDF) && (
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={() => onEdit(item)}
                            color="primary"
                            title="Editar no conformidad"
                          >
                            <Edit size={16} />
                          </IconButton>
                        )}
                        {onDownloadExcel && (
                          <IconButton
                            size="small"
                            onClick={() => onDownloadExcel(item)}
                            sx={{ color: 'success.main' }}
                            title="Descargar Excel"
                          >
                            <DocumentDownload size={16} />
                          </IconButton>
                        )}
                        {onDownloadPDF && (
                          <IconButton
                            size="small"
                            onClick={() => onDownloadPDF(item)}
                            sx={{ color: 'error.main' }}
                            title="Descargar PDF"
                          >
                            <DocumentText size={16} />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(item)}
                            color="error"
                            title="Cancelar no conformidad"
                          >
                            <Trash size={16} />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={filteredItems.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }}
      />
    </Box>
  );
}
