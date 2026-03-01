import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
  },
};

export const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
} as const;

export const categoryColors = [
  '#6750A4',
  '#E91E63',
  '#2196F3',
  '#4CAF50',
  '#FF9800',
  '#009688',
  '#795548',
  '#607D8B',
  '#F44336',
  '#9C27B0',
] as const;
