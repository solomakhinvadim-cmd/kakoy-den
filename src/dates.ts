// Индекс как в JS: 0 — воскресенье, 1 — понедельник … 6 — суббота
export const DAY_NAMES = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
];

export const DAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// Порядок отображения недели: с понедельника
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function formatDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

export type PartOfDay = 'morning' | 'day' | 'evening' | 'night';

export function partOfDay(hour: number): PartOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  if (hour >= 17 && hour < 23) return 'evening';
  return 'night';
}

export const PART_LABEL: Record<PartOfDay, string> = {
  morning: 'Утро',
  day: 'Обед',
  evening: 'Вечер',
  night: 'Ночь',
};

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatTime(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
