import React from 'react';
import { Chip } from '@mui/material';

interface Props {
  name: string;
  color: string;
}

export function CategoryBadge({ name, color }: Props) {
  return (
    <Chip
      label={name}
      size="small"
      sx={{ backgroundColor: color + '22', color }}
    />
  );
}
