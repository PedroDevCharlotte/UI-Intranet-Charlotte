import React, { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/axios';
import NonConformitiesTable from '../../../components/nonConformities/NonConformitiesTable';
import NonConformityForm from '../../../components/nonConformities/NonConformityForm';
import { createNonConformity, deleteNonConformity, updateNonConformity, useGetNonConformities } from '../../../api/nonConformities';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

export default function NonConformitiesPage() {
  const { items: data, loading, error, mutate } = useGetNonConformities();
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  if (error) return <div>Error loading</div>;
  if (loading) return <div style={{ padding: 24 }}><CircularProgress /></div>;

  const handleCreate = async (payload: any) => {
    await createNonConformity(payload);
    mutate();
    setCreating(false);
  };

  const handleUpdate = async (id: number, payload: any) => {
    await updateNonConformity(id, payload);
    mutate();
    setEditing(null);
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm('¿Seguro que desea eliminar este registro?');
    if (!ok) return;
    await deleteNonConformity(id);
    mutate();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Non Conformities</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setCreating(true)}>New</button>
      </div>
      <NonConformitiesTable
        items={data}
        onEdit={item => setEditing(item)}
        onDelete={id => handleDelete(id)}
      />

      <Dialog open={creating} onClose={() => setCreating(false)} fullWidth maxWidth="md">
        <DialogTitle>New Non Conformity</DialogTitle>
        <DialogContent>
          <NonConformityForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="md">
        <DialogTitle>Edit Non Conformity</DialogTitle>
        <DialogContent>
          {editing ? (
            <NonConformityForm initial={editing} onSave={(payload) => handleUpdate(editing.id, payload)} onCancel={() => setEditing(null)} />
          ) : (
            <div style={{ padding: 24 }}><CircularProgress /></div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
