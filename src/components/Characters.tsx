import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { DAY_SHORT, PartOfDay } from '../dates';
import { ThemeId } from '../themes';

type Props = { size: number; jsDay: number; part: PartOfDay };

/** Котик Пятница */
export function Cat({ size }: Props) {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 200 180">
      <Path d="M38 70 L46 14 L88 48 Z M162 70 L154 14 L112 48 Z" fill="#F28C38" />
      <Path d="M50 58 L54 32 L74 48 Z M150 58 L146 32 L126 48 Z" fill="#F9B98A" />
      <Ellipse cx="100" cy="104" rx="80" ry="68" fill="#F28C38" />
      <Path d="M88 40 q12 14 24 0" stroke="#D96F1E" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Circle cx="72" cy="96" r="9" fill="#3B2A1E" />
      <Circle cx="128" cy="96" r="9" fill="#3B2A1E" />
      <Circle cx="75" cy="93" r="3" fill="#FFF8EE" />
      <Circle cx="131" cy="93" r="3" fill="#FFF8EE" />
      <Ellipse cx="56" cy="118" rx="12" ry="7" fill="#F5A3A3" />
      <Ellipse cx="144" cy="118" rx="12" ry="7" fill="#F5A3A3" />
      <Path d="M94 112 h12 l-6 7 z" fill="#3B2A1E" />
      <Path d="M88 124 q6 8 12 0 q6 8 12 0" stroke="#3B2A1E" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path
        d="M30 110 h-24 M32 122 l-22 6 M170 110 h24 M168 122 l22 6"
        stroke="#3B2A1E"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Листок отрывного календаря */
export function CalendarPage({ size, jsDay }: Props) {
  return (
    <Svg width={size * 0.87} height={size} viewBox="0 0 200 230">
      <Rect x="20" y="22" width="160" height="190" rx="18" fill="#FFFFFF" stroke="#14213D" strokeWidth="6" />
      <Path d="M23 40 a17 17 0 0 1 17 -15 h120 a17 17 0 0 1 17 15 v34 h-154 z" fill="#D13438" />
      <Rect x="56" y="8" width="12" height="30" rx="6" fill="#14213D" />
      <Rect x="132" y="8" width="12" height="30" rx="6" fill="#14213D" />
      <SvgText x="100" y="62" textAnchor="middle" fontWeight="800" fontSize="26" fill="#FFFFFF">
        {DAY_SHORT[jsDay].toUpperCase()}
      </SvgText>
      <Circle cx="74" cy="124" r="10" fill="#14213D" />
      <Path d="M116 124 h20" stroke="#14213D" strokeWidth="7" strokeLinecap="round" />
      <Path d="M78 152 q22 22 44 0" stroke="#14213D" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Circle cx="58" cy="148" r="8" fill="#FFC9CB" />
      <Circle cx="142" cy="148" r="8" fill="#FFC9CB" />
    </Svg>
  );
}

/** Солнышко днём, луна вечером и ночью */
export function SunMoon({ size, part }: Props) {
  if (part === 'evening' || part === 'night') {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="96" fill="#23305A" />
        <Path d="M120 30 a72 72 0 1 0 50 104 a58 58 0 0 1 -50 -104 z" fill="#F4E7B5" />
        <Path d="M62 102 q9 7 18 0 M98 102 q9 7 18 0" stroke="#23305A" strokeWidth="6" fill="none" strokeLinecap="round" />
        <Circle cx="58" cy="118" r="7" fill="#F2B8A0" />
        <Circle cx="120" cy="118" r="7" fill="#F2B8A0" />
        <Path d="M80 126 q8 6 16 0" stroke="#23305A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <Path d="M150 52 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 z" fill="#F4E7B5" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G stroke="#F2A93B" strokeWidth="10" strokeLinecap="round">
        <Path d="M100 8 v22 M100 170 v22 M8 100 h22 M170 100 h22 M35 35 l15 15 M150 150 l15 15 M165 35 l-15 15 M50 150 l-15 15" />
      </G>
      <Circle cx="100" cy="100" r="58" fill="#FFC83D" />
      <Circle cx="80" cy="94" r="7" fill="#1F3B3A" />
      <Circle cx="120" cy="94" r="7" fill="#1F3B3A" />
      <Circle cx="70" cy="114" r="9" fill="#F7A07A" />
      <Circle cx="130" cy="114" r="9" fill="#F7A07A" />
      <Path d="M84 116 q16 16 32 0" stroke="#1F3B3A" strokeWidth="6" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Лягушонок Квак */
export function Frog({ size }: Props) {
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 200 170">
      <Circle cx="62" cy="52" r="34" fill="#5BBF6A" />
      <Circle cx="138" cy="52" r="34" fill="#5BBF6A" />
      <Ellipse cx="100" cy="112" rx="92" ry="56" fill="#5BBF6A" />
      <Circle cx="62" cy="52" r="20" fill="#FFFFFF" />
      <Circle cx="138" cy="52" r="20" fill="#FFFFFF" />
      <Circle cx="66" cy="56" r="10" fill="#1B1530" />
      <Circle cx="142" cy="56" r="10" fill="#1B1530" />
      <Path d="M50 112 q50 36 100 0" stroke="#1B1530" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Circle cx="36" cy="110" r="10" fill="#F59BB4" />
      <Circle cx="164" cy="110" r="10" fill="#F59BB4" />
    </Svg>
  );
}

export function Character({ theme, ...props }: Props & { theme: ThemeId }) {
  switch (theme) {
    case 'cat':
      return <Cat {...props} />;
    case 'calendar':
      return <CalendarPage {...props} />;
    case 'sun':
      return <SunMoon {...props} />;
    case 'frog':
      return <Frog {...props} />;
  }
}
