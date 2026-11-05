import React from 'react';
import { Pressable, View } from 'react-native';
import { Theme } from '../themes';

type Props = {
  value: boolean;
  onChange: (v: boolean) => void;
  theme: Theme;
  label: string;
};

export function Toggle({ value, onChange, theme, label }: Props) {
  const offBorder = theme.id === 'frog' && !value;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={{
        width: 56,
        height: 34,
        borderRadius: 17,
        padding: 3,
        justifyContent: 'center',
        alignItems: value ? 'flex-end' : 'flex-start',
        backgroundColor: value ? theme.toggleOn : theme.toggleOff,
        borderWidth: offBorder ? 2 : 0,
        borderColor: theme.ink,
      }}
    >
      <View
        style={{
          width: offBorder ? 24 : 28,
          height: offBorder ? 24 : 28,
          borderRadius: 14,
          backgroundColor: value ? theme.knobOn : theme.knobOff,
        }}
      />
    </Pressable>
  );
}
