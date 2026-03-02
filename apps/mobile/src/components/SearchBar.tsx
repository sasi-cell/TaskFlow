import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText }: Props) {
  return (
    <Searchbar
      placeholder="Search tasks..."
      onChangeText={onChangeText}
      value={value}
      style={styles.searchbar}
    />
  );
}

const styles = StyleSheet.create({
  searchbar: {
    marginHorizontal: 16,
    marginTop: 8,
  },
});
