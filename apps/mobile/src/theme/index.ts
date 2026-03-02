import { MD3LightTheme } from 'react-native-paper';
import { colors, priorityColors, categoryColors } from '@taskflow/shared';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
  },
};

export { priorityColors, categoryColors };
