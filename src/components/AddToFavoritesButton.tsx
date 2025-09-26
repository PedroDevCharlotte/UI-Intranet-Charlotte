import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Star } from 'iconsax-react';
import { addFavorite } from 'api/favorites';

interface AddToFavoritesButtonProps {
  title: string;
  url: string;
  description?: string;
}

export default function AddToFavoritesButton({ title, url, description = '' }: AddToFavoritesButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await addFavorite({ title, url, description });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      // opcional: log de debug ligero para evitar no-unused-vars
      console.debug('addFavorite error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={added ? 'Agregado' : 'Agregar a favoritos'}>
      <span>
        <IconButton size="small" onClick={handleAdd} disabled={loading || added} color={added ? 'success' : 'default'}>
          <Star style={{ fontSize: '1.1rem', color: added ? '#FFD700' : undefined }} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
