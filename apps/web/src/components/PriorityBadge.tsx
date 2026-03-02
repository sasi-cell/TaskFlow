import React from 'react';
import { Chip } from '@mui/material';
import type { TaskPriority } from '@taskflow/shared';
import { priorityColors } from '@taskflow/shared';

interface Props {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: Props) {
  const color = priorityColors[priority];
  return (
    <Chip
      label={priority.charAt(0).toUpperCase() + priority.slice(1)}
      size="small"
      sx={{ backgroundColor: color + '22', color }}
    />
  );
}
