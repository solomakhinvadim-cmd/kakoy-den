import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Character } from './src/components/Characters';
import { TimePicker } from './src/components/TimePicker';
import { Toggle } from './src/components/Toggle';
import {
  DAY_NAMES,
  DAY_SHORT,
  PART_LABEL,
  WEEK_ORDER,
  formatDate,
  formatTime,
  partOfDay,
} from './src/dates';
import { registerBackground } from './src/background';
import { requestPermission, rescheduleAll, sendTest, setupChannels } from './src/notifications';
import {
  DEFAULT_SETTINGS,
  MAX_TIMES,
  ReminderTime,
  Settings,
  loadSettings,
  newId,
  saveSettings,
  sortTimes,
} from './src/storage';
import { DAY_COLORS, THEMES, THEME_ORDER, ThemeId } from './src/themes';

type PickerState = { mode: 'add' } | { mode: 'edit'; id: string } | null;

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setNow(new Date()));
    return () => {
      clearInterval(tick);
      sub.remove();
    };
  }, []);
  return now;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const now = useNow();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [picker, setPicker] = useState<PickerState>(null);

  // Загрузка настроек и разрешение на уведомления
  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setSettings(s);
      await setupChannels();
      const ok = await requestPermission();
      setAllowed(ok);
      setReady(true);
      registerBackground();
    })();
  }, []);

  // При каждом возвращении в приложение продлеваем расписание (в уведомлениях есть дата)
  useEffect(() => {
    if (!ready) return;
    const sub = AppState.addEventListener('change', (st) => st === 'active' && rescheduleAll(settings));
    return () => sub.remove();
  }, [ready, settings]);

  // Каждое изменение — сохранить и перепланировать
  useEffect(() => {
    if (!ready) return;
    saveSettings(settings);
    rescheduleAll(settings);
  }, [settings, ready]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);

  const setTime = (id: string, patch: Partial<ReminderTime>) =>
    setSettings((s) => ({ ...s, times: sortTimes(s.times.map((t) => (t.id === id ? { ...t, ...patch } : t))) }));

  const removeTime = (t: ReminderTime) =>
    Alert.alert('Удалить напоминание?', formatTime(t.hour, t.minute), [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => setSettings((s) => ({ ...s, times: s.times.filter((x) => x.id !== t.id) })),
      },
    ]);

  const onPick = (hour: number, minute: number) => {
    if (!picker) return;
    if (picker.mode === 'add') {
      setSettings((s) => ({
        ...s,
        times: sortTimes([...s.times, { id: newId(), hour, minute, enabled: true }]),
      }));
    } else {
      setTime(picker.id, { hour, minute, enabled: true });
    }
  };

  const theme = THEMES[settings.theme];
  const jsDay = now.getDay();
  const part = partOfDay(now.getHours());
  const bg = theme.bg(jsDay);
  const editing = picker?.mode === 'edit' ? settings.times.find((t) => t.id === picker.id) : undefined;

  const cardStyle = {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Персонаж и день */}
        <View style={styles.hero} accessible accessibilityLabel={`Сегодня ${DAY_NAMES[jsDay]}, ${formatDate(now)}`}>
          <Character theme={settings.theme} size={150} jsDay={jsDay} part={part} />
          <Text style={[styles.today, { color: theme.muted }]}>Сегодня</Text>
          <Text
            style={[styles.dayName, { color: theme.ink }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {settings.theme === 'frog' ? DAY_NAMES[jsDay].toUpperCase() : DAY_NAMES[jsDay]}
          </Text>
          <Text style={[styles.date, { color: theme.muted }]}>{formatDate(now)}</Text>
        </View>

        {/* Неделя */}
        <View style={[styles.week, settings.theme === 'frog' && { backgroundColor: '#1B1530', borderRadius: 20, padding: 10 }]}>
          {WEEK_ORDER.map((d) => {
            const isToday = d === jsDay;
            if (settings.theme === 'frog') {
              return (
                <View key={d} style={styles.frogDay}>
                  <View
                    style={[
                      styles.frogDot,
                      { backgroundColor: DAY_COLORS[d] },
                      isToday && { borderWidth: 3, borderColor: '#FFFFFF' },
                    ]}
                  />
                  <Text style={{ color: isToday ? '#FFFFFF' : '#CFC6EA', fontWeight: isToday ? '800' : '600', fontSize: 12 }}>
                    {DAY_SHORT[d]}
                  </Text>
                </View>
              );
            }
            return (
              <View
                key={d}
                style={[
                  styles.dayChip,
                  { backgroundColor: isToday ? theme.today(d) : theme.chip, borderRadius: theme.radius - 6 },
                  settings.theme === 'calendar' && !isToday && { borderWidth: 2, borderColor: '#E3E8F4' },
                ]}
              >
                <Text style={{ color: isToday ? theme.todayInk : theme.chipInk, fontWeight: isToday ? '900' : '700', fontSize: 14 }}>
                  {DAY_SHORT[d]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Нет разрешения */}
        {!allowed && (
          <Pressable
            onPress={() => Linking.openSettings()}
            style={[cardStyle, styles.warn]}
            accessibilityRole="button"
          >
            <Text style={{ color: theme.ink, fontWeight: '800', fontSize: 15 }}>Уведомления выключены</Text>
            <Text style={{ color: theme.muted, marginTop: 4, fontSize: 14 }}>
              Нажмите, чтобы открыть настройки и разрешить их — иначе напоминания не придут.
            </Text>
          </Pressable>
        )}

        {/* Время напоминаний */}
        <Text style={[styles.section, { color: theme.muted }]}>Когда напомнить</Text>
        <View style={{ gap: 10 }}>
          {settings.times.length === 0 && (
            <Text style={{ color: theme.muted, fontSize: 15 }}>Пока ни одного времени. Добавьте первое ниже.</Text>
          )}
          {settings.times.map((t) => (
            <View key={t.id} style={[cardStyle, styles.row]}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setPicker({ mode: 'edit', id: t.id })}
                onLongPress={() => removeTime(t)}
                accessibilityRole="button"
                accessibilityLabel={`${formatTime(t.hour, t.minute)}, ${PART_LABEL[partOfDay(t.hour)]}. Нажмите, чтобы изменить, удерживайте, чтобы удалить`}
              >
                <Text style={[styles.time, { color: theme.ink, opacity: t.enabled ? 1 : 0.45 }]}>
                  {formatTime(t.hour, t.minute)}
                </Text>
                <Text style={{ color: theme.muted, fontWeight: '700', fontSize: 14 }}>{PART_LABEL[partOfDay(t.hour)]}</Text>
              </Pressable>
              <Pressable
                onPress={() => removeTime(t)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Удалить ${formatTime(t.hour, t.minute)}`}
                style={styles.remove}
              >
                <Text style={{ color: theme.muted, fontSize: 22, fontWeight: '600' }}>×</Text>
              </Pressable>
              <Toggle
                value={t.enabled}
                onChange={(v) => setTime(t.id, { enabled: v })}
                theme={theme}
                label={`Напоминание в ${formatTime(t.hour, t.minute)}`}
              />
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => setPicker({ mode: 'add' })}
          disabled={settings.times.length >= MAX_TIMES}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: theme.button,
              borderRadius: theme.radius,
              opacity: settings.times.length >= MAX_TIMES ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: theme.buttonInk, fontSize: 17, fontWeight: '800' }}>
            {settings.times.length >= MAX_TIMES ? `Максимум ${MAX_TIMES} напоминаний` : '+ Добавить время'}
          </Text>
        </Pressable>

        {/* Настройки */}
        <Text style={[styles.section, { color: theme.muted }]}>Настройки</Text>
        <View style={[cardStyle, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.ink, fontWeight: '800', fontSize: 16 }}>Звук</Text>
            <Text style={{ color: theme.muted, fontSize: 14, marginTop: 2 }}>
              {settings.sound ? `Звук «${theme.soundName}» — меняется вместе с персонажем` : 'Тихое уведомление'}
            </Text>
          </View>
          <Toggle value={settings.sound} onChange={(v) => update({ sound: v })} theme={theme} label="Звук уведомлений" />
        </View>

        <View style={[cardStyle, { padding: 14, marginTop: 10 }]}>
          <Text style={{ color: theme.ink, fontWeight: '800', fontSize: 16, marginBottom: 10 }}>Персонаж</Text>
          <View style={styles.themes}>
            {THEME_ORDER.map((id: ThemeId) => {
              const active = id === settings.theme;
              return (
                <Pressable
                  key={id}
                  onPress={() => update({ theme: id })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={THEMES[id].name}
                  style={[
                    styles.themeItem,
                    {
                      backgroundColor: THEMES[id].bg(jsDay),
                      borderColor: active ? theme.ink : 'transparent',
                    },
                  ]}
                >
                  <Character theme={id} size={44} jsDay={jsDay} part={part} />
                  <Text style={{ color: THEMES[id].ink, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                    {THEMES[id].name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={async () => {
            const ok = await requestPermission();
            setAllowed(ok);
            if (ok) await sendTest(settings);
          }}
          accessibilityRole="button"
          style={styles.testLink}
        >
          <Text style={{ color: theme.ink, fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' }}>
            Проверить уведомление
          </Text>
        </Pressable>
        <Text style={{ color: theme.muted, fontSize: 13, textAlign: 'center' }}>
          «Сегодня {DAY_NAMES[jsDay]}» · {formatDate(now)} · через 3 секунды
        </Text>
      </ScrollView>

      <TimePicker
        visible={picker !== null}
        hour={editing?.hour ?? 9}
        minute={editing?.minute ?? 0}
        theme={theme}
        onPick={onPick}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 48 },
  hero: { alignItems: 'center', marginBottom: 18 },
  today: { fontSize: 17, fontWeight: '700', marginTop: 8 },
  dayName: { fontSize: 54, fontWeight: '900', lineHeight: 62, maxWidth: '100%' },
  date: { fontSize: 17, fontWeight: '700' },
  week: { flexDirection: 'row', gap: 6 },
  dayChip: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center' },
  frogDay: { flex: 1, alignItems: 'center', gap: 6 },
  frogDot: { width: 26, height: 26, borderRadius: 13 },
  warn: { padding: 14, marginTop: 16 },
  section: { fontSize: 15, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
  time: { fontSize: 28, fontWeight: '900' },
  remove: { width: 32, height: 44, alignItems: 'center', justifyContent: 'center' },
  addButton: { height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  themes: { flexDirection: 'row', gap: 8 },
  themeItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 3,
    minHeight: 44,
  },
  testLink: { alignItems: 'center', paddingVertical: 14, marginTop: 10 },
});
