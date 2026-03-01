import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  HelperText,
  Menu,
  Divider,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TaskStackParamList } from '../../navigation/types';
import type { TaskPriority, Category } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { createTaskRepository } from '../../database/taskRepository';
import { createCategoryRepository } from '../../database/categoryRepository';

type Props = NativeStackScreenProps<TaskStackParamList, 'AddTask'>;

export function AddTaskScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const taskRepo = createTaskRepository(db);
  const categoryRepo = createCategoryRepository(db);
  const editId = route.params?.taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
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
        setCategoryId(task.category_id);
        setDueDate(task.due_date ? new Date(task.due_date) : null);
      }
    }
  }

  async function handleSave() {
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
        category_id: categoryId,
        due_date: dueDate ? dueDate.toISOString() : null,
      };

      if (editId) {
        await taskRepo.update(editId, user.id, taskData);
      } else {
        await taskRepo.create(user.id, taskData);
      }
      navigation.goBack();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.label}>Priority</Text>
      <SegmentedButtons
        value={priority}
        onValueChange={(v) => setPriority(v as TaskPriority)}
        buttons={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ]}
        style={styles.segmented}
      />

      <Text variant="labelLarge" style={styles.label}>Category</Text>
      <Menu
        visible={showCategoryMenu}
        onDismiss={() => setShowCategoryMenu(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setShowCategoryMenu(true)}
            style={styles.pickerButton}
            contentStyle={styles.pickerContent}
          >
            {selectedCategory?.name ?? 'None'}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => { setCategoryId(null); setShowCategoryMenu(false); }}
          title="None"
        />
        <Divider />
        {categories.map((cat) => (
          <Menu.Item
            key={cat.id}
            onPress={() => { setCategoryId(cat.id); setShowCategoryMenu(false); }}
            title={cat.name}
          />
        ))}
      </Menu>

      <Text variant="labelLarge" style={styles.label}>Due Date</Text>
      <View style={styles.dateRow}>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          {dueDate ? dueDate.toLocaleDateString() : 'No due date'}
        </Button>
        {dueDate && (
          <Button mode="text" onPress={() => setDueDate(null)}>
            Clear
          </Button>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setDueDate(date);
          }}
        />
      )}

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
      >
        {editId ? 'Update Task' : 'Create Task'}
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
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 8,
  },
  pickerButton: {
    marginBottom: 8,
  },
  pickerContent: {
    justifyContent: 'flex-start',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateButton: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
});
