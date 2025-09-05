import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddToFavoritesButton from './AddToFavoritesButton';

interface PageHeaderWithFavoriteProps {
  title: string;
  url?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeaderWithFavorite({ title, url, description, children }: PageHeaderWithFavoriteProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
      <Typography variant="h4" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      <AddToFavoritesButton
        title={title}
        url={url || (typeof window !== 'undefined' ? window.location.href : '')}
        description={description || `Acceso directo a ${title}`}
      />
      {children}
    </Stack>
  );
}
