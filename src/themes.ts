export type ThemeId = 'cat' | 'calendar' | 'sun' | 'frog';

export type Theme = {
  id: ThemeId;
  name: string;
  /** фон экрана; для «Квака» зависит от дня недели */
  bg: (jsDay: number) => string;
  card: string;
  border: string;
  borderWidth: number;
  ink: string;
  muted: string;
  toggleOn: string;
  toggleOff: string;
  knobOn: string;
  knobOff: string;
  chip: string;
  chipInk: string;
  today: (jsDay: number) => string;
  todayInk: string;
  button: string;
  buttonInk: string;
  radius: number;
  /** Файл звука уведомления (assets/sounds) и его название в настройках */
  sound: string;
  soundName: string;
  /** Цвет значка уведомления на Android */
  notifColor: string;
};

// Цвет каждого дня для темы «Квак» (индекс JS: 0 — воскресенье)
export const DAY_COLORS = [
  '#FFB3D9', // Вс
  '#FF8A80', // Пн
  '#FFB74D', // Вт
  '#C9B8FF', // Ср
  '#FFE066', // Чт
  '#7ED6A0', // Пт
  '#8EC5FF', // Сб
];

export const THEMES: Record<ThemeId, Theme> = {
  cat: {
    id: 'cat',
    name: 'Котик',
    bg: () => '#FFF8EE',
    card: '#FFFFFF',
    border: '#F1E2CE',
    borderWidth: 2,
    ink: '#3B2A1E',
    muted: '#7A5A42',
    toggleOn: '#F28C38',
    toggleOff: '#E5D6C2',
    knobOn: '#FFFFFF',
    knobOff: '#FFFFFF',
    chip: '#F6E7D4',
    chipInk: '#6B4B33',
    today: () => '#3B2A1E',
    todayInk: '#FFF8EE',
    button: '#3B2A1E',
    buttonInk: '#FFF8EE',
    radius: 18,
    sound: 'meow.wav',
    soundName: 'Мяу',
    notifColor: '#F28C38',
  },
  calendar: {
    id: 'calendar',
    name: 'Листок',
    bg: () => '#F5F7FC',
    card: '#FFFFFF',
    border: '#14213D',
    borderWidth: 2,
    ink: '#14213D',
    muted: '#4A5878',
    toggleOn: '#2448C8',
    toggleOff: '#C9D2E6',
    knobOn: '#FFFFFF',
    knobOff: '#FFFFFF',
    chip: '#FFFFFF',
    chipInk: '#4A5878',
    today: () => '#D13438',
    todayInk: '#FFFFFF',
    button: '#D13438',
    buttonInk: '#FFFFFF',
    radius: 18,
    sound: 'rustle.wav',
    soundName: 'Шелест страницы',
    notifColor: '#D13438',
  },
  sun: {
    id: 'sun',
    name: 'Солнышко',
    bg: () => '#EAF6F3',
    card: '#FFFFFF',
    border: '#D2E8E3',
    borderWidth: 0,
    ink: '#1F3B3A',
    muted: '#4F6463',
    toggleOn: '#17675E',
    toggleOff: '#BFD9D3',
    knobOn: '#FFFFFF',
    knobOff: '#FFFFFF',
    chip: '#D6ECE7',
    chipInk: '#2F4A49',
    today: () => '#17675E',
    todayInk: '#FFFFFF',
    button: '#17675E',
    buttonInk: '#FFFFFF',
    radius: 22,
    sound: 'birds.wav',
    soundName: 'Птички',
    notifColor: '#17675E',
  },
  frog: {
    id: 'frog',
    name: 'Квак',
    bg: (d) => DAY_COLORS[d],
    card: '#F4F0FF',
    border: '#1B1530',
    borderWidth: 0,
    ink: '#1B1530',
    muted: '#2E2650',
    toggleOn: '#1B1530',
    toggleOff: '#F4F0FF',
    knobOn: '#5BBF6A',
    knobOff: '#1B1530',
    chip: 'rgba(255,255,255,0.6)',
    chipInk: '#2E2650',
    today: (d) => DAY_COLORS[d],
    todayInk: '#1B1530',
    button: '#1B1530',
    buttonInk: '#FFFFFF',
    radius: 18,
    sound: 'croak.wav',
    soundName: 'Ква-ква',
    notifColor: '#5BBF6A',
  },
};

export const THEME_ORDER: ThemeId[] = ['cat', 'calendar', 'sun', 'frog'];
