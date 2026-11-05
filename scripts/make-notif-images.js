// Картинки персонажей для уведомлений iOS (node scripts/make-notif-images.js, нужен sharp)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'notif');
fs.mkdirSync(OUT, { recursive: true });

const wrap = (bg, vb, inner, tx = 0, ty = 0, sc = 1) => `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
<rect width="300" height="300" fill="${bg}"/>
<g transform="translate(${tx} ${ty}) scale(${sc})">${inner}</g></svg>`;

const cat = `
<path d="M38 70 L46 14 L88 48 Z M162 70 L154 14 L112 48 Z" fill="#F28C38"/>
<path d="M50 58 L54 32 L74 48 Z M150 58 L146 32 L126 48 Z" fill="#F9B98A"/>
<ellipse cx="100" cy="104" rx="80" ry="68" fill="#F28C38"/>
<circle cx="72" cy="96" r="9" fill="#3B2A1E"/><circle cx="128" cy="96" r="9" fill="#3B2A1E"/>
<circle cx="75" cy="93" r="3" fill="#FFF8EE"/><circle cx="131" cy="93" r="3" fill="#FFF8EE"/>
<ellipse cx="56" cy="118" rx="12" ry="7" fill="#F5A3A3"/><ellipse cx="144" cy="118" rx="12" ry="7" fill="#F5A3A3"/>
<path d="M94 112 h12 l-6 7 z" fill="#3B2A1E"/>
<path d="M88 124 q6 8 12 0 q6 8 12 0" stroke="#3B2A1E" stroke-width="5" fill="none" stroke-linecap="round"/>`;

const calendar = `
<rect x="20" y="22" width="160" height="190" rx="18" fill="#FFFFFF" stroke="#14213D" stroke-width="6"/>
<path d="M23 40 a17 17 0 0 1 17 -15 h120 a17 17 0 0 1 17 15 v34 h-154 z" fill="#D13438"/>
<rect x="56" y="8" width="12" height="30" rx="6" fill="#14213D"/><rect x="132" y="8" width="12" height="30" rx="6" fill="#14213D"/>
<circle cx="74" cy="124" r="10" fill="#14213D"/>
<path d="M116 124 h20" stroke="#14213D" stroke-width="7" stroke-linecap="round"/>
<path d="M78 152 q22 22 44 0" stroke="#14213D" stroke-width="7" fill="none" stroke-linecap="round"/>
<circle cx="58" cy="148" r="8" fill="#FFC9CB"/><circle cx="142" cy="148" r="8" fill="#FFC9CB"/>`;

const sun = `
<g stroke="#F2A93B" stroke-width="10" stroke-linecap="round">
<path d="M100 8 v22 M100 170 v22 M8 100 h22 M170 100 h22 M35 35 l15 15 M150 150 l15 15 M165 35 l-15 15 M50 150 l-15 15"/></g>
<circle cx="100" cy="100" r="58" fill="#FFC83D"/>
<circle cx="80" cy="94" r="7" fill="#1F3B3A"/><circle cx="120" cy="94" r="7" fill="#1F3B3A"/>
<circle cx="70" cy="114" r="9" fill="#F7A07A"/><circle cx="130" cy="114" r="9" fill="#F7A07A"/>
<path d="M84 116 q16 16 32 0" stroke="#1F3B3A" stroke-width="6" fill="none" stroke-linecap="round"/>`;

const frog = `
<circle cx="62" cy="52" r="34" fill="#5BBF6A"/><circle cx="138" cy="52" r="34" fill="#5BBF6A"/>
<ellipse cx="100" cy="112" rx="92" ry="56" fill="#5BBF6A"/>
<circle cx="62" cy="52" r="20" fill="#FFFFFF"/><circle cx="138" cy="52" r="20" fill="#FFFFFF"/>
<circle cx="66" cy="56" r="10" fill="#1B1530"/><circle cx="142" cy="56" r="10" fill="#1B1530"/>
<path d="M50 112 q50 36 100 0" stroke="#1B1530" stroke-width="7" fill="none" stroke-linecap="round"/>
<circle cx="36" cy="110" r="10" fill="#F59BB4"/><circle cx="164" cy="110" r="10" fill="#F59BB4"/>`;

const items = {
  cat: wrap('#FFF8EE', 0, cat, 30, 45, 1.2),
  calendar: wrap('#F5F7FC', 0, calendar, 50, 22, 1.0),
  sun: wrap('#EAF6F3', 0, sun, 30, 30, 1.2),
  frog: wrap('#C9B8FF', 0, frog, 30, 52, 1.2),
};

(async () => {
  for (const [name, svg] of Object.entries(items)) {
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `${name}.png`));
  }
  console.log('ok');
})();
