// Генерация иконок из SVG котика (node scripts/make-icons.js, нужен sharp)
const sharp = require('sharp');
const path = require('path');

const cat = (fill, ink, cheek) => `
<path d="M38 70 L46 14 L88 48 Z M162 70 L154 14 L112 48 Z" fill="${fill}"/>
<ellipse cx="100" cy="104" rx="80" ry="68" fill="${fill}"/>
<circle cx="72" cy="96" r="9" fill="${ink}"/><circle cx="128" cy="96" r="9" fill="${ink}"/>
${cheek ? `<ellipse cx="56" cy="118" rx="12" ry="7" fill="${cheek}"/><ellipse cx="144" cy="118" rx="12" ry="7" fill="${cheek}"/>` : ''}
<path d="M94 112 h12 l-6 7 z" fill="${ink}"/>
<path d="M88 124 q6 8 12 0 q6 8 12 0" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;

const out = (f) => path.join(__dirname, '..', 'assets', f);

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<rect width="1024" height="1024" fill="#F28C38"/>
<g transform="translate(152 190) scale(3.6)">${cat('#FFF8EE', '#3B2A1E', '#F5A3A3')}</g></svg>`;

const adaptive = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<g transform="translate(272 300) scale(2.4)">${cat('#FFF8EE', '#3B2A1E', '#F5A3A3')}</g></svg>`;

const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
<rect width="1284" height="2778" fill="#FFF8EE"/>
<g transform="translate(392 1150) scale(2.5)">${cat('#F28C38', '#3B2A1E', '#F5A3A3')}</g></svg>`;

// Android: иконка уведомления — белый силуэт на прозрачном фоне
const notif = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 200 200">
<g transform="translate(0 10)"><path d="M38 70 L46 14 L88 48 Z M162 70 L154 14 L112 48 Z" fill="#FFFFFF"/>
<ellipse cx="100" cy="104" rx="80" ry="68" fill="#FFFFFF"/></g></svg>`;

(async () => {
  await sharp(Buffer.from(icon)).png().toFile(out('icon.png'));
  await sharp(Buffer.from(adaptive)).png().toFile(out('adaptive-icon.png'));
  await sharp(Buffer.from(splash)).png().toFile(out('splash.png'));
  await sharp(Buffer.from(notif)).png().toFile(out('notification-icon.png'));
  console.log('ok');
})();
