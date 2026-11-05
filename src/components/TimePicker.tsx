import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { Theme } from '../themes';

type Props = {
  visible: boolean;
  hour: number;
  minute: number;
  theme: Theme;
  onPick: (hour: number, minute: number) => void;
  onClose: () => void;
};

function toDate(h: number, m: number) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Android — системный диалог выбора времени.
 * iOS — колёсико в нижней шторке с кнопкой «Готово».
 */
export function TimePicker({ visible, hour, minute, theme, onPick, onClose }: Props) {
  const [value, setValue] = useState(toDate(hour, minute));

  useEffect(() => {
    if (visible) setValue(toDate(hour, minute));
  }, [visible, hour, minute]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    DateTimePickerAndroid.open({
      value: toDate(hour, minute),
      mode: 'time',
      is24Hour: true,
      onChange: (event, date) => {
        if (event.type === 'set' && date) onPick(date.getHours(), date.getMinutes());
        onClose();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (Platform.OS === 'android') return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={onClose} accessibilityLabel="Закрыть" />
      <View
        style={{
          backgroundColor: theme.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 12,
          paddingBottom: 36,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
            <Text style={{ fontSize: 17, color: theme.muted, fontWeight: '600' }}>Отмена</Text>
          </Pressable>
          <Text style={{ fontSize: 17, color: theme.ink, fontWeight: '800' }}>Время напоминания</Text>
          <Pressable
            onPress={() => {
              onPick(value.getHours(), value.getMinutes());
              onClose();
            }}
            hitSlop={12}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 17, color: theme.toggleOn, fontWeight: '800' }}>Готово</Text>
          </Pressable>
        </View>
        <DateTimePicker
          value={value}
          mode="time"
          display="spinner"
          locale="ru-RU"
          is24Hour
          textColor={theme.ink}
          onChange={(_, d) => d && setValue(d)}
        />
      </View>
    </Modal>
  );
}
