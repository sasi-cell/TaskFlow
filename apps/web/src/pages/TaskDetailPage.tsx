import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import type { TaskWithCategory } from '@taskflow/shared';
import { useAuth } from '../auth/AuthContext';
import { useDatabase } from '../database/provider';
import { createTaskRepository } from '../database/taskRepository';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryBadge } from '../components/CategoryBadge';

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const db = useDatabase();
  const { user } = useAuth();
  const taskRepo = createTaskRepository(db);
  const [task, setTask] = useState<TaskWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  async function loadTask() {
    if (!user || !taskId) return;
    const result = await taskRepo.getById(Number(taskId), user.id);
    setTask(result);
    setLoading(false);
  }

  async function handleToggleStatus() {
    if (!user || !task) return;
    await taskRepo.toggleStatus(task.id, user.id);
    loadTask();
  }

  async function handleDelete() {
    if (!user || !taskId) return;
    await taskRepo.delete(Number(taskId), user.id);
    navigate('/tasks');
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return <Typography>Task not found</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {task.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <PriorityBadge priority={task.priority} />
        {task.category_name && (
          <CategoryBadge name={task.category_name} color={task.category_color ?? '#6750A4'} />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" color="text.secondary">
        Status
      </Typography>
      <Typography variant="body1" sx={{ textTransform: 'capitalize', mb: 2 }}>
        {task.status}
      </Typography>

      {task.description && (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
        </>
      )}

      {task.due_date && (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            Due Date
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {new Date(task.due_date).toLocaleDateString()}
          </Typography>
        </>
      )}

      <Typography variant="subtitle2" color="text.secondary">
        Created
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {new Date(task.created_at).toLocaleString()}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant="contained"
          onClick={handleToggleStatus}
        >
          {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/tasks/${task.id}/edit`)}
        >
          Edit Task
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setDeleteOpen(true)}
        >
          Delete Task
        </Button>
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
