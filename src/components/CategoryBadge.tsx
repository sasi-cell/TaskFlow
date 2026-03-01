import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

interface Props {
  name: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
}

export function CategoryBadge({ name, color, selected, onPress }: Props) {
  return (
    <Chip
      selected={selected}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: color + '22' }]}
      textStyle={{ color }}
      compact
    >
      {name}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginRight: 4,
  },
});
