import React from 'react';

type Props = {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
};

export default function NonConformitiesTable({ items, onEdit, onDelete }: Props) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>ID</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Number</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Area / Process</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Category</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{item.id}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{item.number}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{item.areaOrProcess}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>{item.category}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f3f3' }}>
              <button onClick={() => onEdit(item)} style={{ marginRight: 8 }}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
