import React, { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/axios';
import NonConformitiesTable from '../../../components/nonConformities/NonConformitiesTable';
import NonConformityForm from '../../../components/nonConformities/NonConformityForm';
import { createNonConformity, deleteNonConformity, updateNonConformity } from '../../../api/nonConformities';

export default function NonConformitiesPage() {
  const { data, error, mutate } = useSWR('/non-conformities', fetcher);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  if (error) return <div>Error loading</div>;
  if (!data) return <div>Loading...</div>;

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

      {creating && (
        <div style={{ marginTop: 16 }}>
          <NonConformityForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 16 }}>
          <NonConformityForm initial={editing} onSave={(payload) => handleUpdate(editing.id, payload)} onCancel={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}
