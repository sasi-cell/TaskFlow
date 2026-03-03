import { describe, it, expect } from 'vitest';
import { colors, priorityColors, categoryColors } from '../constants';

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

describe('colors', () => {
  it('has primary, secondary, and tertiary keys', () => {
    expect(Object.keys(colors)).toEqual(['primary', 'secondary', 'tertiary']);
  });

  it('all values are valid hex colors', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(HEX_REGEX);
    }
  });
});

describe('priorityColors', () => {
  it('maps low, medium, and high to hex colors', () => {
    expect(Object.keys(priorityColors)).toEqual(['low', 'medium', 'high']);
    for (const value of Object.values(priorityColors)) {
      expect(value).toMatch(HEX_REGEX);
    }
  });
});

describe('categoryColors', () => {
  it('has 10 colors', () => {
    expect(categoryColors).toHaveLength(10);
  });

  it('all values are valid hex colors', () => {
    for (const color of categoryColors) {
      expect(color).toMatch(HEX_REGEX);
    }
  });

  it('all colors are unique', () => {
    const unique = new Set(categoryColors);
    expect(unique.size).toBe(categoryColors.length);
  });
});
