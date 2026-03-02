import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import type { Category } from '@taskflow/shared';
import { categoryColors } from '@taskflow/shared';
import { useAuth } from '../auth/AuthContext';
import { useDatabase } from '../database/provider';
import { createCategoryRepository } from '../database/categoryRepository';
import { EmptyState } from '../components/EmptyState';

export function CategoriesPage() {
  const db = useDatabase();
  const { user } = useAuth();
  const categoryRepo = createCategoryRepository(db);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(categoryColors[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    if (!user) return;
    const result = await categoryRepo.getAll(user.id);
    setCategories(result);
  }

  function openCreateDialog() {
    setEditingCategory(null);
    setName('');
    setSelectedColor(categoryColors[0]);
    setError('');
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setSelectedColor(category.color);
    setError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!user) return;

    try {
      if (editingCategory) {
        await categoryRepo.update(editingCategory.id, user.id, name.trim(), selectedColor);
      } else {
        await categoryRepo.create(user.id, name.trim(), selectedColor);
      }
      setDialogOpen(false);
      loadCategories();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete(category: Category) {
    if (!user) return;
    await categoryRepo.delete(category.id, user.id);
    loadCategories();
  }

  return (
    <Box>
      {categories.length === 0 ? (
        <EmptyState
          title="No categories"
          message="Create categories to organize your tasks"
        />
      ) : (
        categories.map((cat) => (
          <Card key={cat.id} sx={{ mb: 1 }}>
            <CardContent
              sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: cat.color,
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ flex: 1 }}>{cat.name}</Typography>
              <IconButton size="small" onClick={() => openEditDialog(cat)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(cat)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardContent>
          </Card>
        ))
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={openCreateDialog}
      >
        <AddIcon />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {categoryColors.map((color) => (
              <IconButton
                key={color}
                onClick={() => setSelectedColor(color)}
                sx={{ color }}
              >
                {selectedColor === color ? (
                  <CheckCircleIcon />
                ) : (
                  <CircleIcon />
                )}
              </IconButton>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
