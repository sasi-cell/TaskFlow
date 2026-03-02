import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Checkbox, Chip } from 'react-native-paper';
import type { TaskWithCategory } from '@taskflow/shared';
import { priorityColors } from '../theme';

interface Props {
  task: TaskWithCategory;
  onPress: () => void;
  onToggleStatus: () => void;
}

export function TaskCard({ task, onPress, onToggleStatus }: Props) {
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Title
        title={task.title}
        titleStyle={task.status === 'completed' ? styles.completed : undefined}
        titleNumberOfLines={2}
        left={() => (
          <Checkbox
            status={task.status === 'completed' ? 'checked' : 'unchecked'}
            onPress={onToggleStatus}
          />
        )}
        right={() => (
          <Chip
            compact
            style={[styles.priorityChip, { backgroundColor: priorityColors[task.priority] + '22' }]}
            textStyle={{ color: priorityColors[task.priority], fontSize: 11 }}
          >
            {task.priority}
          </Chip>
        )}
      />
      {(task.category_name || task.due_date) && (
        <Card.Content style={styles.content}>
          {task.category_name && (
            <Chip
              compact
              style={[styles.categoryChip, { backgroundColor: (task.category_color ?? '#6750A4') + '22' }]}
              textStyle={{ fontSize: 11 }}
            >
              {task.category_name}
            </Chip>
          )}
          {task.due_date && (
            <Text variant="bodySmall" style={styles.dueDate}>
              Due: {new Date(task.due_date).toLocaleDateString()}
            </Text>
          )}
        </Card.Content>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  completed: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  priorityChip: {
    marginRight: 12,
  },
  categoryChip: {},
  dueDate: {
    opacity: 0.7,
  },
});
