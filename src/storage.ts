import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeId } from './themes';

export type ReminderTime = {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
};

export type Settings = {
  times: ReminderTime[];
  sound: boolean;
  theme: ThemeId;
};

export const MAX_TIMES = 6; // 6 времён × 7 дней = 42 уведомления (лимит iOS — 64)

const KEY = 'kakoy-den/settings/v1';

export const DEFAULT_SETTINGS: Settings = {
  times: [
    { id: 'm', hour: 8, minute: 0, enabled: true },
    { id: 'd', hour: 13, minute: 0, enabled: true },
    { id: 'e', hour: 20, minute: 0, enabled: true },
  ],
  sound: true,
  theme: 'cat',
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      times: Array.isArray(parsed.times) ? parsed.times : DEFAULT_SETTINGS.times,
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : DEFAULT_SETTINGS.sound,
      theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // не страшно: настройки останутся до следующего запуска
  }
}

export function sortTimes(times: ReminderTime[]): ReminderTime[] {
  return [...times].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
