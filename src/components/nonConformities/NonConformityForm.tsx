import React, { useState, useEffect } from 'react';

type Props = {
  initial?: any;
  onSave: (payload: any) => Promise<void> | void;
  onCancel: () => void;
};

export default function NonConformityForm({ initial = {}, onSave, onCancel }: Props) {
  const [number, setNumber] = useState(initial.number || '');
  const [area, setArea] = useState(initial.areaOrProcess || '');
  const [category, setCategory] = useState(initial.category || '');

  useEffect(() => {
    setNumber(initial.number || '');
    setArea(initial.areaOrProcess || '');
    setCategory(initial.category || '');
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...initial, number, areaOrProcess: area, category });
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <label>Number</label>
        <input value={number} onChange={e => setNumber(e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Area / Process</label>
        <input value={area} onChange={e => setArea(e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Category</label>
        <input value={category} onChange={e => setCategory(e.target.value)} />
      </div>
      <div>
        <button type="submit" style={{ marginRight: 8 }}>Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
