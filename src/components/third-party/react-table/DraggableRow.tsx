import React, { ReactElement } from 'react';

// material-ui
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// third-party
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Row } from '@tanstack/react-table';

// project-imports
import IconButton from 'components/@extended/IconButton';

// assets
import { HambergerMenu } from 'iconsax-react';

// types


// ==============================|| DRAGGABLE ROW ||============================== //

interface DraggableRowProps {
  row: Row<any>;
  reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
  children: React.ReactNode;
}

export default function DraggableRow({ row, reorderRow, children }: DraggableRowProps) {
  const rowId = row.id.toString();
  const { setNodeRef: setDropRef, isOver: isOverCurrent } = useDroppable({
    id: rowId
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging
  } = useDraggable({
    id: rowId
  });

  return (
    <TableRow ref={setDropRef} sx={{ opacity: isDragging ? 0.5 : 1, bgcolor: isOverCurrent ? 'primary.lighter' : 'inherit' }}>
      <TableCell>
        <IconButton
          ref={setDragRef}
          {...listeners}
          {...attributes}
          size="small"
          sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
          color="secondary"
          disabled={typeof row.getIsGrouped === 'function' ? row.getIsGrouped() : false}
        >
          <HambergerMenu size="32" variant="Outline" />
        </IconButton>
      </TableCell>
      {children}
    </TableRow>
  );
}
