import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export function SettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Card style={styles.card} mode="elevated">
        <Card.Title title="Account" />
        <Card.Content>
          <Text variant="labelLarge" style={styles.label}>Email</Text>
          <Text variant="bodyLarge">{user?.email}</Text>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      <Button
        mode="contained"
        onPress={logout}
        style={styles.logoutButton}
        buttonColor="#F44336"
        icon="logout"
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  label: {
    opacity: 0.7,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  logoutButton: {
    paddingVertical: 4,
  },
});
