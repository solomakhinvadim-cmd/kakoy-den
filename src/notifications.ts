import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DAY_NAMES, formatDate } from './dates';
import { Settings } from './storage';
import { THEMES, THEME_ORDER, ThemeId } from './themes';

// Показывать уведомление, даже когда приложение открыто
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// На Android звук задаётся каналом: у каждого персонажа свой канал + тихий
const channelId = (theme: ThemeId) => `day-${theme}`;
const CHANNEL_SILENT = 'day-silent';
const OLD_CHANNELS = ['day-reminder-sound', 'day-reminder-silent'];

export async function setupChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  for (const old of OLD_CHANNELS) {
    await Notifications.deleteNotificationChannelAsync(old).catch(() => {});
  }
  for (const id of THEME_ORDER) {
    await Notifications.setNotificationChannelAsync(channelId(id), {
      name: `Напоминания — ${THEMES[id].name} (${THEMES[id].soundName})`,
      importance: Notifications.AndroidImportance.HIGH,
      sound: THEMES[id].sound,
      vibrationPattern: [0, 200, 120, 200],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  await Notifications.setNotificationChannelAsync(CHANNEL_SILENT, {
    name: 'Тихие напоминания',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    enableVibrate: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function hasPermission(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  return p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function requestPermission(): Promise<boolean> {
  if (await hasPermission()) return true;
  const p = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return p.granted;
}

// Картинка персонажа в уведомлении (iOS показывает её справа)
const IMAGES: Record<ThemeId, number> = {
  cat: require('../assets/notif/cat.png'),
  calendar: require('../assets/notif/calendar.png'),
  sun: require('../assets/notif/sun.png'),
  frog: require('../assets/notif/frog.png'),
};
const IMG_DIR = `${FileSystem.cacheDirectory}notif-images/`;
let imgCounter = 0;

async function resetImageDir(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  await FileSystem.deleteAsync(IMG_DIR, { idempotent: true }).catch(() => {});
  await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true }).catch(() => {});
}

/** iOS забирает файл картинки себе, поэтому каждому уведомлению — своя копия */
async function attachmentFor(theme: ThemeId): Promise<Notifications.NotificationContentAttachmentIos[] | undefined> {
  if (Platform.OS !== 'ios') return undefined;
  try {
    const asset = Asset.fromModule(IMAGES[theme]);
    await asset.downloadAsync();
    if (!asset.localUri) return undefined;
    const to = `${IMG_DIR}${theme}-${Date.now()}-${imgCounter++}.png`;
    await FileSystem.copyAsync({ from: asset.localUri, to });
    return [{ identifier: theme, url: to, typeHint: 'public.png' }];
  } catch {
    return undefined; // без картинки уведомление всё равно придёт
  }
}

/** «Сегодня среда» / «5 ноября» + картинка (iOS) и цвет (Android) персонажа */
async function contentFor(settings: Settings, date: Date): Promise<Notifications.NotificationContentInput> {
  const theme = THEMES[settings.theme];
  return {
    title: `Сегодня ${DAY_NAMES[date.getDay()]}`,
    body: formatDate(date),
    sound: settings.sound ? theme.sound : false,
    color: theme.notifColor,
    attachments: await attachmentFor(settings.theme),
  };
}

const channelFor = (s: Settings) => (s.sound ? channelId(s.theme) : CHANNEL_SILENT);

/**
 * В тексте есть дата, поэтому каждое уведомление разовое, на конкретный день.
 * iOS держит не больше 64 запланированных — берём столько дней, сколько влезает.
 * Окно продлевается при каждом открытии приложения и фоновой задачей.
 */
function horizonDays(enabledCount: number): number {
  if (enabledCount === 0) return 0;
  if (Platform.OS === 'ios') return Math.max(1, Math.min(30, Math.floor(60 / enabledCount)));
  return 30;
}

// Перепланирование идёт по очереди, чтобы быстрые нажатия не перемешались
let queue: Promise<void> = Promise.resolve();

export function rescheduleAll(settings: Settings): Promise<void> {
  queue = queue.then(() => doReschedule(settings)).catch(() => {});
  return queue;
}

async function doReschedule(settings: Settings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await hasPermission())) return;
  await resetImageDir();

  const enabled = settings.times.filter((t) => t.enabled);
  const days = horizonDays(enabled.length);
  const now = new Date();

  for (let d = 0; d < days; d++) {
    for (const t of enabled) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, t.hour, t.minute, 0, 0);
      if (date.getTime() <= now.getTime()) continue;
      await Notifications.scheduleNotificationAsync({
        content: await contentFor(settings, date),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: channelFor(settings),
        },
      });
    }
  }
}

/** Пробное уведомление через 3 секунды */
export async function sendTest(settings: Settings): Promise<void> {
  await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true }).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    content: await contentFor(settings, new Date()),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: channelFor(settings),
    },
  });
}
