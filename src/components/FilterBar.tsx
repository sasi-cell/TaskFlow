import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import type { TaskFilter, TaskStatus, TaskPriority } from '../types';

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {statuses.map((s) => (
        <Chip
          key={s.label}
          selected={filter.status === s.value}
          onPress={() => onFilterChange({ ...filter, status: s.value })}
          style={styles.chip}
          compact
        >
          {s.label}
        </Chip>
      ))}
      {priorities.map((p) => (
        <Chip
          key={p.label}
          selected={filter.priority === p.value}
          onPress={() => onFilterChange({ ...filter, priority: p.value })}
          style={styles.chip}
          compact
        >
          {p.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },
});
