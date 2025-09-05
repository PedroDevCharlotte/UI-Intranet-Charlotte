import React from 'react';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import DraggableRow from './DraggableRow';

interface DraggableTableProps {
  rows: any[];
  columns: { key: string; header: React.ReactNode; render: (row: any) => React.ReactNode }[];
  onReorder: (newRows: any[]) => void;
}

export default function DraggableTable({ rows, columns, onReorder }: DraggableTableProps) {
  const [tableData, setTableData] = React.useState(rows);
  React.useEffect(() => { setTableData(rows); }, [rows]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tableData.findIndex((row) => row.id.toString() === active.id.toString());
    const newIndex = tableData.findIndex((row) => row.id.toString() === over.id.toString());
    if (oldIndex === -1 || newIndex === -1) return;
    const updated = [...tableData];
    const [removed] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, removed);
    setTableData(updated);
    onReorder(updated);
  };

  return (
    <TableContainer>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              {columns.map((col) => (
                <TableCell key={col.key}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <DraggableRow key={row.id} row={{ ...row, id: row.id.toString() }} reorderRow={() => {}}>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.render(row)}</TableCell>
                ))}
              </DraggableRow>
            ))}
          </TableBody>
        </Table>
      </DndContext>
    </TableContainer>
  );
}
