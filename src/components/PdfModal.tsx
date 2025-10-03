import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { CloseCircle, DocumentDownload } from 'iconsax-react';

interface PdfModalProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title: string;
  fileName?: string;
}

const PdfModal: React.FC<PdfModalProps> = ({ 
  open, 
  onClose, 
  pdfUrl, 
  title,
  fileName = 'documento.pdf'
}) => {
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <Box>
            <IconButton onClick={handleDownload} color="primary">
              <DocumentDownload size={20} />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseCircle size={20} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ padding: 0, height: '100%' }}>
        {pdfUrl ? (
          <Box sx={{ height: '100%', width: '100%' }}>
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              width="100%"
              height="100%"
              style={{
                border: 'none',
                minHeight: '600px'
              }}
              title={title}
            />
          </Box>
        ) : (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="400px"
          >
            <Typography variant="body1" color="text.secondary">
              Cargando PDF...
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleDownload} variant="contained" startIcon={<DocumentDownload size={16} />}>
          Descargar
        </Button>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfModal;