import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import type { TaskPriority } from '@taskflow/shared';
import { priorityColors } from '../theme';

interface Props {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: Props) {
  const color = priorityColors[priority];
  return (
    <Chip
      style={[styles.chip, { backgroundColor: color + '22' }]}
      textStyle={{ color }}
      compact
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {},
});
