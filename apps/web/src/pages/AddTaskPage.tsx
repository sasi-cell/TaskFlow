import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
} from '@mui/material';
import type { TaskPriority, Category } from '@taskflow/shared';
import { useAuth } from '../auth/AuthContext';
import { useDatabase } from '../database/provider';
import { createTaskRepository } from '../database/taskRepository';
import { createCategoryRepository } from '../database/categoryRepository';

export function AddTaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const db = useDatabase();
  const { user } = useAuth();
  const taskRepo = createTaskRepository(db);
  const categoryRepo = createCategoryRepository(db);
  const editId = taskId ? Number(taskId) : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!user) return;
    const cats = await categoryRepo.getAll(user.id);
    setCategories(cats);

    if (editId) {
      const task = await taskRepo.getById(editId, user.id);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setPriority(task.priority);
        setCategoryId(task.category_id ?? '');
        setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category_id: categoryId === '' ? null : categoryId,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      };

      if (editId) {
        await taskRepo.update(editId, user.id, taskData);
      } else {
        await taskRepo.create(user.id, taskData);
      }
      navigate('/tasks');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {editId ? 'Edit Task' : 'New Task'}
      </Typography>

      <Box component="form" onSubmit={handleSave}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Priority
        </Typography>
        <ToggleButtonGroup
          value={priority}
          exclusive
          onChange={(_, v) => v && setPriority(v)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="low">Low</ToggleButton>
          <ToggleButton value="medium">Medium</ToggleButton>
          <ToggleButton value="high">High</ToggleButton>
        </ToggleButtonGroup>

        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value as number | '')}
            label="Category"
          >
            <MenuItem value="">None</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          fullWidth
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={saving}
          sx={{ mt: 2, py: 1.5 }}
        >
          {saving ? 'Saving...' : editId ? 'Update Task' : 'Create Task'}
        </Button>
      </Box>
    </Box>
  );
}
