import { createTheme } from '@mui/material/styles';
import { colors } from '@taskflow/shared';

export const theme = createTheme({
  palette: {
    primary: { main: colors.primary },
    secondary: { main: colors.secondary },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});
