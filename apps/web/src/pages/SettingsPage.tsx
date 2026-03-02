import React from 'react';
import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1">{user?.email}</Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Button
        variant="contained"
        color="error"
        onClick={logout}
        fullWidth
        sx={{ py: 1.5 }}
      >
        Sign Out
      </Button>
    </Box>
  );
}
