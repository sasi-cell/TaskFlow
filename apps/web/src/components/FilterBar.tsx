import React from 'react';
import { Box, Chip } from '@mui/material';
import type { TaskFilter, TaskStatus, TaskPriority } from '@taskflow/shared';

interface Props {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

const statuses: { label: string; value: TaskStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

const priorities: { label: string; value: TaskPriority | undefined }[] = [
  { label: 'Any Priority', value: undefined },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

export function FilterBar({ filter, onFilterChange }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
      {statuses.map((s) => (
        <Chip
          key={s.label}
          label={s.label}
          variant={filter.status === s.value ? 'filled' : 'outlined'}
          color={filter.status === s.value ? 'primary' : 'default'}
          onClick={() => onFilterChange({ ...filter, status: s.value })}
        />
      ))}
      {priorities.map((p) => (
        <Chip
          key={p.label}
          label={p.label}
          variant={filter.priority === p.value ? 'filled' : 'outlined'}
          color={filter.priority === p.value ? 'primary' : 'default'}
          onClick={() => onFilterChange({ ...filter, priority: p.value })}
        />
      ))}
    </Box>
  );
}
