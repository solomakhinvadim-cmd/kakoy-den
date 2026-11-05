import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DAY_NAMES, partOfDay } from './dates';
import { Settings } from './storage';
import { THEMES } from './themes';

// Показывать уведомление, даже когда приложение открыто
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// На Android звук задаётся каналом, поэтому два канала: со звуком и тихий
const CHANNEL_SOUND = 'day-reminder-sound';
const CHANNEL_SILENT = 'day-reminder-silent';

export async function setupChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_SOUND, {
    name: 'Напоминания со звуком',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 200, 120, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
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

function contentFor(settings: Settings, jsDay: number, hour: number) {
  return {
    title: `Сегодня ${DAY_NAMES[jsDay]}`,
    body: THEMES[settings.theme].body(partOfDay(hour)),
    sound: settings.sound,
  };
}

const channelFor = (s: Settings) => (s.sound ? CHANNEL_SOUND : CHANNEL_SILENT);

// Перепланирование идёт по очереди, чтобы быстрые нажатия не перемешались
let queue: Promise<void> = Promise.resolve();

export function rescheduleAll(settings: Settings): Promise<void> {
  queue = queue.then(() => doReschedule(settings)).catch(() => {});
  return queue;
}

async function doReschedule(settings: Settings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await hasPermission())) return;

  for (const t of settings.times) {
    if (!t.enabled) continue;
    // Для каждого дня недели — своё еженедельное уведомление со своим текстом
    for (let jsDay = 0; jsDay < 7; jsDay++) {
      await Notifications.scheduleNotificationAsync({
        content: contentFor(settings, jsDay, t.hour),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: jsDay + 1, // 1 — воскресенье … 7 — суббота
          hour: t.hour,
          minute: t.minute,
          channelId: channelFor(settings),
        },
      });
    }
  }
}

/** Пробное уведомление через 3 секунды */
export async function sendTest(settings: Settings): Promise<void> {
  const now = new Date();
  await Notifications.scheduleNotificationAsync({
    content: contentFor(settings, now.getDay(), now.getHours()),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: channelFor(settings),
    },
  });
}
