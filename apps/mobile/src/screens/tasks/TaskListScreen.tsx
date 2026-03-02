import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TaskStackParamList } from '../../navigation/types';
import type { TaskFilter, TaskWithCategory } from '@taskflow/shared';
import { useAuth } from '../../contexts/AuthContext';
import { createTaskRepository } from '../../database/taskRepository';
import { TaskCard } from '../../components/TaskCard';
import { SearchBar } from '../../components/SearchBar';
import { FilterBar } from '../../components/FilterBar';
import { EmptyState } from '../../components/EmptyState';

type Props = NativeStackScreenProps<TaskStackParamList, 'TaskList'>;

export function TaskListScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const taskRepo = createTaskRepository(db);
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TaskFilter>({});

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const result = await taskRepo.getAll(user.id, {
        ...filter,
        search: search || undefined,
      });
      setTasks(result);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  }, [user, filter, search]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  async function handleToggleStatus(taskId: number) {
    if (!user) return;
    await taskRepo.toggleStatus(taskId, user.id);
    loadTasks();
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChangeText={setSearch} />
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onToggleStatus={() => handleToggleStatus(item.id)}
          />
        )}
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-marked-outline"
            title="No tasks yet"
            message="Tap the + button to create your first task"
          />
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
