import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  FAB,
  Card,
  Text,
  IconButton,
  Portal,
  Dialog,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import type { Category } from '@taskflow/shared';
import { useAuth } from '../../contexts/AuthContext';
import { createCategoryRepository } from '../../database/categoryRepository';
import { EmptyState } from '../../components/EmptyState';
import { categoryColors } from '../../theme';

export function CategoriesScreen() {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const categoryRepo = createCategoryRepository(db);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(categoryColors[0]);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

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
    setDialogVisible(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setSelectedColor(category.color);
    setError('');
    setDialogVisible(true);
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
      setDialogVisible(false);
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
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card} mode="elevated">
            <Card.Title
              title={item.name}
              left={() => (
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              )}
              right={() => (
                <View style={styles.actions}>
                  <IconButton icon="pencil" size={20} onPress={() => openEditDialog(item)} />
                  <IconButton icon="delete" size={20} onPress={() => handleDelete(item)} />
                </View>
              )}
            />
          </Card>
        )}
        contentContainerStyle={categories.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="folder-outline"
            title="No categories"
            message="Create categories to organize your tasks"
          />
        }
      />

      <FAB icon="plus" style={styles.fab} onPress={openCreateDialog} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingCategory ? 'Edit Category' : 'New Category'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.dialogInput}
            />
            {error ? <HelperText type="error">{error}</HelperText> : null}
            <Text variant="labelLarge" style={styles.colorLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {categoryColors.map((color) => (
                <IconButton
                  key={color}
                  icon={selectedColor === color ? 'check-circle' : 'circle'}
                  iconColor={color}
                  size={28}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialogInput: {
    marginBottom: 8,
  },
  colorLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
