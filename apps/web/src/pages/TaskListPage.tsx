import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Fab, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { TaskFilter, TaskWithCategory } from '@taskflow/shared';
import { useAuth } from '../auth/AuthContext';
import { useDatabase } from '../database/provider';
import { createTaskRepository } from '../database/taskRepository';
import { TaskCard } from '../components/TaskCard';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';

export function TaskListPage() {
  const navigate = useNavigate();
  const db = useDatabase();
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

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleToggleStatus(taskId: number) {
    if (!user) return;
    await taskRepo.toggleStatus(taskId, user.id);
    loadTasks();
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <SearchBar value={search} onChangeText={setSearch} />
      <FilterBar filter={filter} onFilterChange={setFilter} />
      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          message="Click the + button to create your first task"
        />
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPress={() => navigate(`/tasks/${task.id}`)}
            onToggleStatus={() => handleToggleStatus(task.id)}
          />
        ))
      )}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => navigate('/tasks/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
