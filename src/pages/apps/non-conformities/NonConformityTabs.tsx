import React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';

export interface NonConformityTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  children: React.ReactNode[];
}

export default function NonConformityTabs({ value, onChange, children }: NonConformityTabsProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={onChange} variant="scrollable" scrollButtons="auto">
        <Tab label="Motivos y Clasificación" />
        <Tab label="Planes de Acción" />
        <Tab label="Revisar y Crear" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {children[value]}
      </Box>
    </Box>
  );
}
