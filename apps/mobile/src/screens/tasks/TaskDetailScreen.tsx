import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TaskStackParamList } from '../../navigation/types';
import type { TaskWithCategory } from '@taskflow/shared';
import { useAuth } from '../../contexts/AuthContext';
import { createTaskRepository } from '../../database/taskRepository';
import { PriorityBadge } from '../../components/PriorityBadge';
import { CategoryBadge } from '../../components/CategoryBadge';

type Props = NativeStackScreenProps<TaskStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const taskRepo = createTaskRepository(db);
  const { taskId } = route.params;
  const [task, setTask] = useState<TaskWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [taskId])
  );

  async function loadTask() {
    if (!user) return;
    const result = await taskRepo.getById(taskId, user.id);
    setTask(result);
    setLoading(false);
  }

  async function handleToggleStatus() {
    if (!user || !task) return;
    await taskRepo.toggleStatus(task.id, user.id);
    loadTask();
  }

  async function handleDelete() {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            await taskRepo.delete(taskId, user.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loading}>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>{task.title}</Text>

      <View style={styles.badges}>
        <PriorityBadge priority={task.priority} />
        {task.category_name && (
          <CategoryBadge name={task.category_name} color={task.category_color ?? '#6750A4'} />
        )}
      </View>

      <Divider style={styles.divider} />

      <Text variant="labelLarge" style={styles.sectionLabel}>Status</Text>
      <Text variant="bodyLarge" style={styles.statusText}>
        {task.status === 'completed' ? 'Completed' : 'Pending'}
      </Text>

      {task.description ? (
        <>
          <Text variant="labelLarge" style={styles.sectionLabel}>Description</Text>
          <Text variant="bodyMedium">{task.description}</Text>
        </>
      ) : null}

      {task.due_date && (
        <>
          <Text variant="labelLarge" style={styles.sectionLabel}>Due Date</Text>
          <Text variant="bodyMedium">
            {new Date(task.due_date).toLocaleDateString()}
          </Text>
        </>
      )}

      <Text variant="labelLarge" style={styles.sectionLabel}>Created</Text>
      <Text variant="bodyMedium">
        {new Date(task.created_at).toLocaleString()}
      </Text>

      <Divider style={styles.divider} />

      <Button
        mode="contained"
        onPress={handleToggleStatus}
        style={styles.actionButton}
        icon={task.status === 'completed' ? 'undo' : 'check'}
      >
        {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('AddTask', { taskId: task.id })}
        style={styles.actionButton}
        icon="pencil"
      >
        Edit Task
      </Button>

      <Button
        mode="outlined"
        onPress={handleDelete}
        style={styles.actionButton}
        textColor="#F44336"
        icon="delete"
      >
        Delete Task
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  statusText: {
    textTransform: 'capitalize',
  },
  actionButton: {
    marginTop: 12,
  },
});
