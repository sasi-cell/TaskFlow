import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TaskStackParamList } from './types';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { AddTaskScreen } from '../screens/tasks/AddTaskScreen';

const Stack = createNativeStackNavigator<TaskStackParamList>();

export function TaskStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ title: 'Tasks' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={({ route }) => ({
          title: route.params?.taskId ? 'Edit Task' : 'New Task',
        })}
      />
    </Stack.Navigator>
  );
}
