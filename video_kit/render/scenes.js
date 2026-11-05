// むぎ版ショート動画の各シーンを SVG で描く（576x1024）
// node render.js で images/01.png 〜 34.png を書き出す
const W = 576, H = 1024;
const C = {
  navy: '#16213e', navy2: '#1f2d52', navy3: '#0e1630', gold: '#e9b949', gold2: '#c8922b',
  fur: '#e39a52', fur2: '#c97b38', cream: '#fff3df', vest: '#1b2747', shirt: '#ffffff',
  pants: '#3d3f47', mob: '#b9bcc4', mob2: '#9a9ea8', wood: '#6b4226', wood2: '#4e2f1a',
  paper: '#fbfaf5', green: '#2fb36b', red: '#e0453a', sky: '#7cc7ef', sea: '#1f6fb2',
};
const FONT = "'WenQuanYi Zen Hei', 'IPAGothic', sans-serif";

// ---------- 小物 ----------
const txt = (x, y, s, size, fill = '#222', weight = 900, anchor = 'middle', extra = '') =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${s}</text>`;
const rect = (x, y, w, h, fill, rx = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const g = (inner, t = '') => `<g transform="${t}">${inner}</g>`;

function cashBox(x, y, s = 1, legs = false) {
  let o = rect(-30, -22, 60, 44, '#d8b67a', 4, 'stroke="#8a6a3a" stroke-width="3"') +
    rect(-30, -6, 60, 8, '#c49a5a') + txt(0, 12, '¥', 18, '#7a5524');
  if (legs) o += `<path d="M-14 22 l-4 14 M14 22 l4 14" stroke="#333" stroke-width="4" stroke-linecap="round"/>`;
  return g(o, `translate(${x},${y}) scale(${s})`);
}
function paperSheet(x, y, w, h, lines, rot = 0) {
  let o = rect(-w / 2, -h / 2, w, h, C.paper, 6, 'stroke="#333" stroke-width="3"');
  lines.forEach(([s, size, fill], i) => {
    const total = lines.reduce((a, l) => a + l[1] * 1.25, 0);
    const yy = -total / 2 + lines.slice(0, i).reduce((a, l) => a + l[1] * 1.25, 0) + size;
    o += txt(0, yy, s, size, fill || '#222');
  });
  return g(o, `translate(${x},${y}) rotate(${rot})`);
}
function phone(x, y, lines, s = 1, rot = 0) {
  let o = rect(-60, -110, 120, 220, '#222', 16) + rect(-52, -98, 104, 196, '#fff', 8);
  lines.forEach(([t, size, fill, yy]) => { o += txt(0, yy, t, size, fill || '#222'); });
  return g(o, `translate(${x},${y}) scale(${s}) rotate(${rot})`);
}
function shopBag(x, y, s = 1) {
  const o = `<path d="M-20 -80 q20 -40 40 0" stroke="#7a5524" stroke-width="6" fill="none"/>` +
    rect(-60, -80, 120, 140, '#d9b27c', 4, 'stroke="#8a6a3a" stroke-width="3"') +
    `<circle cx="0" cy="-30" r="26" fill="${C.navy}"/>` + dogHeadIcon(0, -30, 0.5) +
    txt(0, 22, 'MUGI', 26, C.navy) + txt(0, 44, '毎日に、ちょうどいいを。', 9, C.navy, 700);
  return g(o, `translate(${x},${y}) scale(${s})`);
}
function dogHeadIcon(x, y, s) {
  return g(`<path d="M-30 -18 L-22 -48 L-6 -26 Z M30 -18 L22 -48 L6 -26 Z" fill="${C.fur}"/>
    <ellipse cx="0" cy="0" rx="34" ry="30" fill="${C.fur}"/><ellipse cx="0" cy="12" rx="20" ry="14" fill="${C.cream}"/>
    <ellipse cx="0" cy="4" rx="6" ry="4" fill="#222"/><ellipse cx="-13" cy="-6" rx="4" ry="5" fill="#222"/><ellipse cx="13" cy="-6" rx="4" ry="5" fill="#222"/>`,
    `translate(${x},${y}) scale(${s})`);
}
function logoSign(x, y, w, text, s = 1) {
  return g(rect(-w / 2, -40, w, 80, '#fff', 10, 'stroke="#ccc" stroke-width="2"') +
    `<circle cx="${-w / 2 + 50}" cy="0" r="30" fill="${C.navy}"/>` + dogHeadIcon(-w / 2 + 50, 2, 0.6) +
    txt(30, 16, text, 46, C.navy), `translate(${x},${y}) scale(${s})`);
}

// ---------- 背景 ----------
function bgNavy() {
  return `<defs><radialGradient id="rn" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${C.navy2}"/><stop offset="1" stop-color="${C.navy3}"/></radialGradient></defs>` +
    rect(0, 0, W, H, 'url(#rn)') + rect(0, 860, W, 164, '#2a2f3d');
}
function bgShop(warm = true) {
  let o = `<defs><linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dcae"/><stop offset="1" stop-color="#e2b77a"/></linearGradient></defs>` +
    rect(0, 0, W, H, 'url(#sh)');
  for (let i = 0; i < 4; i++) {
    const x = 10 + i * 145;
    o += rect(x, 120, 130, 560, '#c48c55', 4);
    for (let j = 0; j < 5; j++) {
      o += rect(x + 6, 140 + j * 108, 118, 92, '#f2d3a0');
      for (let k = 0; k < 5; k++) o += rect(x + 12 + k * 22, 160 + j * 108, 18, 70, ['#d36b5b', '#5b7fb5', '#e8d6b3', '#7aa36b', '#2d3b5c'][(i + j + k) % 5], 2);
    }
  }
  o += rect(0, 0, W, 40, '#fff6e2') + `<g fill="#fff8d0" opacity=".8">${[80, 220, 360, 500].map(x => `<circle cx="${x}" cy="70" r="12"/>`).join('')}</g>`;
  o += rect(0, 760, W, 264, '#b98b5a') + `<g stroke="#a47848" stroke-width="2">${[800, 860, 930, 1010].map(y => `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`).join('')}</g>`;
  return o;
}
function bgOffice() {
  let o = rect(0, 0, W, H, '#2b1a10');
  for (let i = 0; i < 2; i++) {
    const x = i === 0 ? 0 : 400;
    o += rect(x, 0, 176, 760, C.wood2);
    for (let j = 0; j < 7; j++) {
      o += rect(x + 8, 20 + j * 105, 160, 8, C.wood);
      for (let k = 0; k < 9; k++) o += rect(x + 12 + k * 17, 32 + j * 105, 14, 88, ['#7a2e2a', '#2f4a6d', '#6d5a2f', '#3f5f3a', '#5a2f5a'][(j + k * 3 + i) % 5], 1);
    }
  }
  o += rect(176, 0, 224, 760, '#1d2747') +
    `<ellipse cx="460" cy="560" rx="160" ry="160" fill="#ffcf73" opacity=".12"/>` +
    rect(0, 760, W, 264, '#5a3420') + rect(0, 760, W, 14, '#7a4a2c');
  return o;
}
function bgNight() {
  let o = `<defs><linearGradient id="nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1330"/><stop offset="1" stop-color="#283c6e"/></linearGradient></defs>` + rect(0, 0, W, H, 'url(#nt)');
  for (let i = 0; i < 40; i++) o += `<circle cx="${(i * 97) % W}" cy="${(i * 53) % 300}" r="1.5" fill="#fff" opacity=".7"/>`;
  [[0, 300, 120], [110, 220, 90], [190, 360, 140], [340, 180, 110], [440, 280, 136]].forEach(([x, y, w]) => {
    o += rect(x, y, w, 700, '#1a2547');
    for (let r = 0; r < 14; r++) for (let c = 0; c < Math.floor(w / 26); c++)
      if ((r * 7 + c * 3 + x) % 5 > 1) o += rect(x + 8 + c * 26, y + 16 + r * 40, 14, 20, '#ffd77a', 2, 'opacity=".75"');
  });
  o += rect(0, 820, W, 204, '#2e3446');
  return o;
}
function bgSea(island = true, sunset = false) {
  const top = sunset ? '#f39a5b' : C.sky, bot = sunset ? '#ffd39b' : '#cfeeff';
  let o = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>
    <linearGradient id="se" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f86c8"/><stop offset="1" stop-color="#123f78"/></linearGradient></defs>` +
    rect(0, 0, W, 470, 'url(#sk)') + rect(0, 470, W, 554, 'url(#se)');
  o += `<g fill="#fff" opacity=".85"><ellipse cx="110" cy="140" rx="70" ry="22"/><ellipse cx="420" cy="90" rx="90" ry="26"/></g>`;
  for (let i = 0; i < 18; i++) o += `<path d="M${(i * 131) % W} ${500 + (i * 61) % 500} q12 -8 24 0" stroke="#9fd3ff" stroke-width="3" fill="none" opacity=".6"/>`;
  if (island) o += `<path d="M330 475 q80 -110 180 -40 q40 10 66 40 Z" fill="#3f8f4a"/><path d="M360 475 q60 -60 120 -30 z" fill="#5fb065"/>` +
    rect(500, 380, 14, 60, '#fff') + rect(498, 372, 18, 12, C.red);
  return o;
}
function floorShadow(x, y, w) { return `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.16}" fill="#000" opacity=".25"/>`; }

// ---------- キャラ ----------
// むぎ：柴犬・白シャツ・紺ベスト・ネクタイ・金の腕時計
function mugi(x, y, s = 1, o = {}) {
  const face = o.face || 'normal', armR = o.armR || 'down', armL = o.armL || 'down', flip = o.flip ? -1 : 1;
  const hands = {
    down: [[112, -300], [104, -205]], up: [[150, -400], [128, -500]], point: [[170, -380], [250, -420]],
    hold: [[120, -300], [46, -330]], phone: [[130, -300], [60, -400]], head: [[150, -470], [70, -540]], hip: [[150, -300], [92, -260]],
  };
  const arm = (side, kind) => {
    const sx = side * 92, [[ex, ey], [hx, hy]] = hands[kind];
    const p = `M${sx} -410 Q${side * ex} ${ey} ${side * hx} ${hy}`;
    let a = `<path d="${p}" stroke="#222" stroke-width="52" fill="none" stroke-linecap="round"/>` +
      `<path d="${p}" stroke="${C.shirt}" stroke-width="44" fill="none" stroke-linecap="round"/>` +
      `<circle cx="${side * hx}" cy="${hy}" r="26" fill="${C.fur}" stroke="#222" stroke-width="4"/>`;
    if (side === -1 && kind !== 'head') a += rect(side * hx - 16, hy - 40, 32, 12, C.gold, 3);
    if (kind === 'up') a += rect(side * hx - 8, hy - 50, 16, 30, C.fur, 8, 'stroke="#222" stroke-width="4"');
    return a;
  };
  const eyes = {
    normal: `<ellipse cx="-34" cy="-500" rx="9" ry="11" fill="#222"/><ellipse cx="34" cy="-500" rx="9" ry="11" fill="#222"/>
      <path d="M-50 -522 l30 6 M50 -522 l-30 6" stroke="#5a3418" stroke-width="6" stroke-linecap="round"/>`,
    smile: `<path d="M-46 -498 q12 -14 24 0 M22 -498 q12 -14 24 0" stroke="#222" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    wink: `<ellipse cx="-34" cy="-500" rx="9" ry="11" fill="#222"/><path d="M22 -498 q12 -14 24 0" stroke="#222" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    shock: `<circle cx="-34" cy="-500" r="14" fill="#fff" stroke="#222" stroke-width="4"/><circle cx="34" cy="-500" r="14" fill="#fff" stroke="#222" stroke-width="4"/>
      <circle cx="-34" cy="-500" r="4" fill="#222"/><circle cx="34" cy="-500" r="4" fill="#222"/>
      <path d="M80 -540 q10 20 0 30 q-10 -10 0 -30" fill="#7fd0ff"/>`,
  };
  const mouth = face === 'shock' ? `<ellipse cx="0" cy="-448" rx="12" ry="14" fill="#5a1d1d"/>`
    : face === 'smile' || face === 'wink' ? `<path d="M-20 -456 q20 22 40 0" stroke="#222" stroke-width="5" fill="#c94a4a"/>`
      : `<path d="M-16 -456 q16 10 32 0" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  let b = floorShadow(0, 0, 120);
  // 脚
  b += `<path d="M-60 -250 L-56 -20 L-12 -20 L-6 -250 Z M6 -250 L12 -20 L56 -20 L60 -250 Z" fill="${C.pants}" stroke="#222" stroke-width="4"/>` +
    `<path d="M-64 -24 h56 q4 24 -6 24 h-56 q-10 0 6 -24 Z M8 -24 h56 q16 24 6 24 h-56 q-10 0 -6 -24 Z" fill="#111"/>`;
  if (armL !== 'cross') b += arm(-1, armL);
  if (armR !== 'cross') b += arm(1, armR);
  // 胴体
  b += `<path d="M-100 -420 Q-110 -330 -72 -240 L72 -240 Q110 -330 100 -420 Q0 -450 -100 -420 Z" fill="${C.shirt}" stroke="#222" stroke-width="4"/>` +
    `<path d="M-96 -410 Q-104 -330 -70 -238 L-8 -238 L-8 -400 L-40 -430 Z M96 -410 Q104 -330 70 -238 L8 -238 L8 -400 L40 -430 Z" fill="${C.vest}" stroke="#222" stroke-width="3"/>` +
    `<path d="M-12 -428 L12 -428 L8 -410 L16 -300 L0 -284 L-16 -300 L-8 -410 Z" fill="${C.navy3}"/>` +
    rect(-72, -250, 144, 14, '#222', 3) + `<circle cx="-26" cy="-330" r="4" fill="${C.gold}"/><circle cx="-26" cy="-290" r="4" fill="${C.gold}"/>`;
  if (armL === 'cross' || armR === 'cross')
    b += `<path d="M-120 -330 Q0 -300 120 -330" stroke="#222" stroke-width="58" fill="none" stroke-linecap="round"/><path d="M-120 -330 Q0 -300 120 -330" stroke="${C.shirt}" stroke-width="50" fill="none" stroke-linecap="round"/>` +
      `<circle cx="-118" cy="-332" r="24" fill="${C.fur}" stroke="#222" stroke-width="4"/><circle cx="118" cy="-332" r="24" fill="${C.fur}" stroke="#222" stroke-width="4"/>` + rect(70, -345, 24, 28, C.gold, 3);
  // 頭
  b += `<path d="M-74 -540 L-60 -620 L-14 -566 Z M74 -540 L60 -620 L14 -566 Z" fill="${C.fur}" stroke="#222" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M-60 -548 L-55 -598 L-28 -566 Z M60 -548 L55 -598 L28 -566 Z" fill="#f7c9a0"/>` +
    `<ellipse cx="0" cy="-490" rx="88" ry="78" fill="${C.fur}" stroke="#222" stroke-width="4"/>` +
    `<path d="M-70 -470 Q-60 -420 0 -414 Q60 -420 70 -470 Q40 -448 0 -470 Q-40 -448 -70 -470 Z" fill="${C.cream}"/>` +
    `<ellipse cx="-44" cy="-522" rx="8" ry="5" fill="${C.cream}"/><ellipse cx="44" cy="-522" rx="8" ry="5" fill="${C.cream}"/>` +
    `<ellipse cx="0" cy="-474" rx="13" ry="9" fill="#222"/>` + eyes[face] + mouth;
  if (o.hold) b += o.hold;
  return g(b, `translate(${x},${y}) scale(${s * flip},${s})`);
}
function mugiBack(x, y, s = 1) {
  return g(floorShadow(0, 0, 110) +
    `<path d="M-60 -250 L-56 -20 L-12 -20 L-6 -250 Z M6 -250 L12 -20 L56 -20 L60 -250 Z" fill="${C.pants}" stroke="#222" stroke-width="4"/>` +
    `<path d="M-100 -420 Q-110 -330 -72 -240 L72 -240 Q110 -330 100 -420 Q0 -450 -100 -420 Z" fill="${C.vest}" stroke="#222" stroke-width="4"/>` +
    `<path d="M-92 -410 Q-120 -320 -110 -220" stroke="${C.shirt}" stroke-width="44" fill="none" stroke-linecap="round"/><path d="M92 -410 Q120 -320 112 -220" stroke="${C.shirt}" stroke-width="44" fill="none" stroke-linecap="round"/>` +
    rect(92, -230, 60, 46, '#7a4a2c', 6, 'stroke="#222" stroke-width="3"') +
    `<path d="M-74 -540 L-60 -620 L-14 -566 Z M74 -540 L60 -620 L14 -566 Z" fill="${C.fur}" stroke="#222" stroke-width="4"/>` +
    `<ellipse cx="0" cy="-490" rx="88" ry="78" fill="${C.fur}" stroke="#222" stroke-width="4"/>` +
    `<path d="M-30 -440 q30 30 60 0" stroke="${C.fur2}" stroke-width="6" fill="none"/>`, `translate(${x},${y}) scale(${s})`);
}
// 顔のないグレーのモブ
function mob(x, y, s = 1, o = {}) {
  const body = o.color || C.mob, suit = o.suit;
  let b = floorShadow(0, 0, 70) +
    `<path d="M-38 -170 L-34 0 L-6 0 L-2 -170 Z M2 -170 L6 0 L34 0 L38 -170 Z" fill="${suit || C.mob2}" stroke="#555" stroke-width="3"/>` +
    `<path d="M-62 -300 Q-70 -220 -46 -160 L46 -160 Q70 -220 62 -300 Q0 -320 -62 -300 Z" fill="${suit || body}" stroke="#555" stroke-width="3"/>`;
  if (suit) b += `<path d="M-14 -306 L0 -270 L14 -306 Z" fill="#fff"/><path d="M-4 -296 h8 l4 70 l-8 10 l-8 -10 Z" fill="#222"/>`;
  b += `<path d="M-60 -290 Q-80 -220 -70 -160" stroke="${suit || body}" stroke-width="26" fill="none" stroke-linecap="round"/>` +
    `<path d="M60 -290 Q80 -220 70 -160" stroke="${suit || body}" stroke-width="26" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="0" cy="-360" rx="52" ry="58" fill="${C.mob}" stroke="#666" stroke-width="3"/>`;
  if (o.glasses) b += `<circle cx="-20" cy="-362" r="14" fill="none" stroke="#333" stroke-width="4"/><circle cx="20" cy="-362" r="14" fill="none" stroke="#333" stroke-width="4"/><path d="M-6 -362 h12" stroke="#333" stroke-width="4"/>`;
  else b += `<path d="M-30 -372 l18 6 M30 -372 l-18 6" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
  if (o.hat) b += `<ellipse cx="0" cy="-404" rx="70" ry="12" fill="#222"/>` + rect(-42, -450, 84, 48, '#222', 10);
  if (o.bag) b += rect(-26, -170, 52, 60, '#d9b27c', 4, 'stroke="#8a6a3a" stroke-width="3"');
  if (o.hold) b += o.hold;
  return g(b, `translate(${x},${y}) scale(${s * (o.flip ? -1 : 1)},${s})`);
}

// ---------- シーン ----------
const scenes = {
  '01': () => bgShop() + rect(0, 0, W, 300, C.navy) +
    `<rect x="70" y="70" width="436" height="60" rx="8" fill="#e0453a" transform="rotate(-2 288 100)"/>` + txt(288, 115, '繁盛している店が', 40, '#fff') +
    txt(250, 228, '利益ゼロ', 92, C.gold, 900, 'middle', 'stroke="#222" stroke-width="5" paint-order="stroke"') + txt(470, 228, 'の理由', 40, '#fff') +
    logoSign(288, 380, 430, 'MUGI SHOP') +
    mob(70, 900, .75, { bag: 1 }) + mob(500, 920, .75, { color: '#c98a7a', bag: 1 }) + mob(420, 960, .6, { color: '#7a9cc9' }) +
    mugi(288, 980, .95, { armR: 'up', face: 'smile' }),
  '02': () => bgShop() + rect(150, 640, 420, 140, '#f4ead8', 8, 'stroke="#c4a77a" stroke-width="4"') +
    mob(80, 920, .8, { suit: '#3f5f3a' }) + mugi(380, 1000, 1, { armL: 'cross', armR: 'cross', face: 'normal' }),
  '03': () => bgNavy() + `<path d="M330 150 l40 60 l-20 80 l40 90 l-40 120 l-90 100 l-80 40 l-70 70 l-60 -20 l50 -80 l90 -60 l60 -110 l20 -110 Z" fill="#3d7f55" stroke="#9fd3a8" stroke-width="4"/>` +
    [[340, 220], [360, 330], [330, 430], [300, 520], [250, 600], [190, 660], [120, 720], [350, 270], [310, 470], [270, 560], [210, 630], [150, 690]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${C.gold}" stroke="#fff" stroke-width="4"/>`).join('') +
    txt(288, 900, '全国 12店舗', 56, '#fff') + dogHeadIcon(500, 110, 1),
  '04': () => bgShop() + rect(0, 0, W, 120, '#f4e2bf') + rect(160, 30, 256, 70, '#3a2a1c', 8) + txt(288, 82, 'お会計', 46, '#fff') +
    [60, 230, 400].map(x => rect(x, 560, 130, 80, '#333', 6) + rect(x + 10, 500, 70, 60, '#3b5f9a', 4)).join('') + rect(0, 620, W, 120, '#f4ead8') +
    [40, 140, 240, 340, 440, 520].map((x, i) => mob(x, 1000 + (i % 2) * 20, .7, { color: ['#d36b5b', '#e8c040', '#7aa36b', '#5b7fb5', '#e8d6b3', '#c98a7a'][i], flip: i % 2 })).join(''),
  '05': () => bgNavy() + mugi(250, 1000, 1, { armR: 'hold', face: 'smile', hold: g(rect(-10, -20, 170, 130, '#222', 10) + rect(0, -10, 150, 110, '#fff', 6) + txt(75, 30, '純利益', 22, '#555') + txt(75, 80, '8億円', 44, C.green), 'translate(40,-400)') }),
  '06': () => bgOffice() + mob(420, 1000, .95, { glasses: 1, color: '#c9a24a', hold: rect(30, -400, 40, 80, '#222', 10) }) +
    mugi(180, 1010, .9, { armR: 'phone', face: 'normal', hold: phone(60, -420, [['📞', 30, '#222', -10], ['会計士', 20, '#222', 30]], .6) }),
  '07': () => bgNavy() + [[180, 720], [260, 720], [340, 720], [400, 720], [220, 670], [300, 670], [370, 670], [260, 620], [330, 620]].map(([x, y]) => cashBox(x, y, 1.3)).join('') +
    `<g transform="translate(300,520) rotate(-14)"><rect x="-150" y="-80" width="300" height="160" rx="18" fill="none" stroke="${C.red}" stroke-width="14"/>${txt(0, 40, '25%', 110, C.red)}</g>`,
  '08': () => bgNight() + rect(300, 380, 276, 460, '#d7dbe4') + rect(320, 400, 236, 50, '#9aa3b5') + txt(438, 436, '税務署', 34, '#222') +
    rect(370, 640, 120, 200, '#4a5568') +
    [[300, 900], [240, 930], [180, 950], [120, 970], [60, 990]].map(([x, y]) => cashBox(x, y, .9, true)).join('') +
    mugi(150, 860, .78, { armL: 'head', armR: 'head', face: 'shock' }),
  '09': () => bgOffice() + rect(260, 160, 290, 330, '#fff', 8, 'stroke="#333" stroke-width="5"') + txt(405, 230, '利益', 56, '#222') +
    `<path d="M290 450 l60 -40 l40 20 l60 -80 l70 -90" stroke="${C.green}" stroke-width="8" fill="none"/>` +
    `<path d="M370 420 l30 -30 l40 20 l10 50 l-50 20 Z" fill="#2b1a10" stroke="#fff" stroke-width="3"/>` +
    mob(140, 960, 1, { suit: '#9a7a52' }) + mob(440, 1000, .8, { glasses: 1, suit: '#6c6f78' }) + rect(390, 820, 110, 110, C.red, 10) + cashBox(445, 815, 1),
  '10': () => bgSea(false) + rect(0, 520, W, 380, '#f4f4f4', 0, 'stroke="#999" stroke-width="3"') +
    [40, 140, 240, 340, 440].map(x => rect(x, 560, 70, 70, '#2b4f7a', 8)).join('') + rect(0, 660, W, 20, C.navy) +
    `<path d="M180 1024 L360 760 L420 760 L270 1024 Z" fill="#c9ccd3" stroke="#777" stroke-width="3"/>` + mugiBack(320, 930, .7) +
    txt(288, 470, 'FERRY', 40, C.navy),
  '11': () => bgSea(true) + `<g transform="translate(150,640)"><path d="M-110 0 L110 0 L80 50 L-80 50 Z" fill="#fff" stroke="#333" stroke-width="4"/>${rect(-60, -50, 120, 50, '#fff', 6, 'stroke="#333" stroke-width="4"')}${rect(-40, -36, 20, 18, C.navy)}${rect(0, -36, 20, 18, C.navy)}<path d="M-130 60 q60 -20 120 0 q60 20 120 0" stroke="#fff" stroke-width="5" fill="none"/></g>` +
    `<path d="M260 640 q120 -60 200 -170" stroke="#fff" stroke-width="5" stroke-dasharray="14 12" fill="none"/>`,
  '12': () => rect(0, 0, W, H, C.wood2) + rect(80, 0, 300, H, C.wood, 0, 'stroke="#2b1a10" stroke-width="6"') +
    rect(110, 60, 240, 380, '#7a4a2c', 6) + rect(110, 500, 240, 380, '#7a4a2c', 6) + `<circle cx="340" cy="520" r="14" fill="${C.gold}"/>` +
    rect(130, 450, 200, 50, C.gold, 6, 'stroke="#8a6a1a" stroke-width="3"') + txt(230, 484, 'MUGI HOLDINGS', 22, '#3a2a1c') +
    mugi(420, 1050, 1, { armL: 'point', flip: 1, face: 'normal' }),
  '13': () => bgOffice() + rect(60, 700, 456, 40, '#7a4a2c') + paperSheet(288, 640, 260, 120, [['登記申請書', 28], ['MUGI HOLDINGS', 20]]) +
    `<circle cx="380" cy="660" r="34" fill="none" stroke="${C.red}" stroke-width="7"/>` + txt(380, 672, '登記', 22, C.red) + mugi(288, 1010, .55, { face: 'smile' }) ,
  '14': () => rect(0, 0, W, H, '#e8e4dc') + rect(0, 760, W, 264, '#b98b5a') + rect(60, 540, 320, 260, '#8d939e', 6, 'stroke="#333" stroke-width="4"') +
    rect(40, 760, 360, 170, '#aab0bb', 6, 'stroke="#333" stroke-width="4"') + rect(70, 790, 300, 110, '#555', 4) + rect(150, 805, 140, 80, '#fff', 2) +
    mugi(440, 1000, .85, { armR: 'down', armL: 'point', flip: 0, face: 'normal' }),
  '15': () => bgShop() + mugi(288, 1040, 1.05, { armR: 'hold', armL: 'hold', face: 'smile', hold: shopBag(0, -330, 1.2) }),
  '16': () => bgNavy() + rect(330, 120, 210, 300, '#f6f2ea', 6, 'stroke="#333" stroke-width="4"') + txt(435, 220, '3', 90, '#222') +
    Array.from({ length: 20 }, (_, i) => rect(350 + (i % 5) * 36, 250 + Math.floor(i / 5) * 38, 26, 26, '#ddd', 3)).join('') +
    `<circle cx="508" cy="377" r="18" fill="none" stroke="${C.red}" stroke-width="4"/>` + txt(508, 384, '31', 16, C.red) +
    mugi(220, 1000, 1, { armR: 'hold', armL: 'down', face: 'normal' }),
  '17': () => bgOffice() + mugi(288, 1040, 1, { armR: 'hold', armL: 'hold', face: 'normal', hold: paperSheet(0, -330, 220, 200, [['ライセンス料', 26], ['8億円', 64]]) }),
  '18': () => bgShop() + `<g opacity=".55">${logoSign(288, 160, 470, 'MUGI SHOP')}</g>` + paperSheet(170, 560, 220, 180, [['請求書', 32], ['8億円', 56, C.red]], -6) +
    mugi(380, 1020, .95, { armL: 'hold', face: 'normal' }),
  '19': () => bgOffice() + `<g transform="translate(288,520) scale(2)">${rect(-75, -150, 150, 300, '#111', 20)}${rect(-66, -136, 132, 272, '#fff', 10)}
    ${txt(0, -100, '振込', 22, '#222')}${txt(0, -60, '振込先', 11, '#888')}${txt(0, -40, 'MUGI HOLDINGS', 12, '#222')}${txt(0, -6, '金額', 11, '#888')}${txt(0, 30, '8億円', 34, '#222')}
    ${rect(-50, 60, 100, 34, C.green, 8)}${txt(0, 83, '振込を実行', 14, '#fff')}</g>` + `<circle cx="300" cy="770" r="40" fill="${C.fur}" stroke="#222" stroke-width="5"/>`,
  '20': () => bgSea(true) + `<path d="M0 1024 L0 820 Q120 780 180 860 L260 1024 Z" fill="#6aa05a"/>` +
    Array.from({ length: 13 }, (_, i) => { const t = i / 12; return cashBox(80 + t * 380, 820 - Math.sin(t * Math.PI) * 520 - t * 160, .8); }).join('') +
    `<g transform="translate(470,450)">${rect(-50, -20, 100, 50, '#e8e2d0')}<path d="M-60 -20 L0 -50 L60 -20 Z" fill="#d8d0b8"/></g>`,
  '21': () => bgShop() + mob(300, 1010, 1, { glasses: 1, suit: '#6c6f78', hold: rect(54, -260, 60, 80, '#8a6a3a', 4) + rect(60, -250, 48, 64, '#fff') }),
  '22': () => bgOffice() + rect(0, 780, W, 244, '#5a3420') + mugi(288, 960, .8, { armR: 'hold', face: 'normal', hold: paperSheet(60, -360, 190, 160, [['売上', 26], ['8億円', 56]]) })  + mob(470, 1060, .7, { glasses: 1, suit: '#6c6f78', flip: 1 }),
  '23': () => bgOffice() + mob(288, 1100, 1.4, { glasses: 1, suit: '#6c6f78', hold: g(rect(-120, -80, 240, 150, '#333', 12) + rect(-108, -68, 216, 126, '#fff', 6) + txt(-10, 12, '税金 0円', 40, '#222') + `<path d="M74 -6 l12 14 l22 -28" stroke="${C.green}" stroke-width="8" fill="none"/>`, 'translate(0,-230)') }),
  '24': () => bgOffice() + `<g transform="translate(200,640)">${rect(-140, -180, 280, 360, '#5b6170', 14, 'stroke="#222" stroke-width="5"')}${rect(-110, -150, 220, 300, '#1e222b', 8)}</g>` +
    `<path d="M340 460 L420 420 L420 860 L340 820 Z" fill="#6d7380" stroke="#222" stroke-width="5"/><circle cx="395" cy="640" r="18" fill="#c9ccd3" stroke="#222" stroke-width="3"/>` + mob(470, 1010, .85, { glasses: 1, suit: '#6c6f78', flip: 1 }),
  '25': () => rect(0, 0, W, H, '#cbb89a') + rect(0, 760, W, 264, '#8a6440') + rect(300, 120, 200, 260, '#f6f2ea', 4) +
    `<g transform="translate(288,1000)">${Array.from({ length: 12 }, (_, i) => rect(-90 + (i % 3) * 4, -40 - i * 24, 180 - (i % 2) * 10, 24, C.paper, 2, 'stroke="#bbb" stroke-width="2"')).join('')}
    <path d="M-90 -320 Q-100 -520 0 -560 Q100 -520 90 -320 Z" fill="#fff" stroke="#ccc" stroke-width="3"/><ellipse cx="-24" cy="-470" rx="8" ry="12" fill="#222"/><ellipse cx="24" cy="-470" rx="8" ry="12" fill="#222"/>
    ${rect(-90, -400, 180, 36, C.gold, 4)}${txt(0, -374, 'MUGI HOLDINGS', 18, '#3a2a1c')}</g>`,
  '26': () => bgNavy() + mugi(150, 960, .8, { armR: 'down', face: 'normal' }) + rect(250, 860, 280, 60, C.wood, 8) +
    `<g>${Array.from({ length: 12 }, (_, i) => cashBox(300 + (i % 4) * 62, 830 - Math.floor(i / 4) * 46, 1)).join('')}</g>` +
    `<path d="M260 860 Q260 560 390 560 Q520 560 520 860 Z" fill="#cfe9ff" opacity=".25" stroke="#e8f4ff" stroke-width="4"/>`,
  '27': () => bgOffice() + rect(170, 140, 390, 520, '#fff', 8, 'stroke="#333" stroke-width="5"') +
    `<circle cx="365" cy="250" r="56" fill="${C.navy}"/>` + dogHeadIcon(365, 254, 1) +
    [240, 365, 490].map(x => `<path d="M${x} 520 L365 320" stroke="#333" stroke-width="4"/>` + `<g transform="translate(${x},560)">${rect(-40, -20, 80, 60, '#e4f1ff', 4, 'stroke="#333" stroke-width="3"')}<path d="M-46 -20 L0 -50 L46 -20 Z" fill="${C.red}"/></g>` +
      txt(x + (x === 365 ? 24 : 0), 470, '¥↑', 28, C.green)).join('') +
    mugi(120, 1010, .85, { armR: 'point', face: 'normal' }),
  '28': () => bgNavy() + `<path d="M40 1024 L130 780 L446 780 L536 1024 Z" fill="${C.gold}" stroke="${C.gold2}" stroke-width="6"/>` +
    `<path d="M150 780 L210 600 L366 600 L426 780 Z" fill="${C.gold}" stroke="${C.gold2}" stroke-width="6"/>` +
    [120, 288, 456].map(x => logoSign(x, 900, 140, '', .8)).join('') +
    Array.from({ length: 16 }, (_, i) => rect(60 + (i * 83) % 460, 120 + (i * 137) % 420, 34, 18, '#f3e3b0', 3, `transform="rotate(${i * 37} ${60 + (i * 83) % 460} ${120 + (i * 137) % 420})"`)).join('') +
    mugi(288, 600, .7, { armR: 'up', armL: 'up', face: 'smile' }),
  '29': () => bgNight() + `<g transform="translate(320,920)">${rect(-80, -120, 160, 220, '#9aa0aa', 10, 'stroke="#555" stroke-width="4"')}${Array.from({ length: 6 }, (_, i) => `<line x1="-70" y1="${-90 + i * 30}" x2="70" y2="${-90 + i * 30}" stroke="#666" stroke-width="3"/>`).join('')}</g>` +
    mugi(220, 1000, .95, { armR: 'hold', face: 'normal', hold: g(rect(-60, -50, 120, 100, '#fff', 4, 'stroke="#333" stroke-width="3"') + rect(-12, -36, 24, 64, '#6a7a96') + `<circle cx="0" cy="0" r="40" fill="none" stroke="${C.red}" stroke-width="7"/><path d="M-28 -28 L28 28" stroke="${C.red}" stroke-width="7"/>`, 'translate(110,-310) rotate(10)') }),
  '30': () => rect(0, 0, W, H, '#a6c3df') + rect(0, 100, 150, 760, '#8a3b2f') + rect(440, 80, 136, 780, '#7a3328') +
    `<g transform="translate(500,140)">${rect(-26, 0, 52, 360, '#c9a96a')}${`<circle cx="0" cy="60" r="22" fill="#fff" stroke="#333" stroke-width="3"/>`}<path d="M-30 0 L0 -60 L30 0 Z" fill="#6d5a3a"/></g>` +
    rect(0, 820, W, 204, '#555b66') + `<g transform="translate(70,700)">${rect(-80, -140, 160, 150, C.red, 10)}${rect(-70, -126, 140, 30, '#ffe2a0')}${rect(-70, -76, 140, 30, '#ffe2a0')}</g>` +
    `<g transform="translate(80,160)"><rect x="0" y="0" width="100" height="60" fill="#012169"/><path d="M0 0 L100 60 M100 0 L0 60" stroke="#fff" stroke-width="10"/><path d="M50 0 V60 M0 30 H100" stroke="#fff" stroke-width="16"/><path d="M50 0 V60 M0 30 H100" stroke="#c8102e" stroke-width="8"/></g>` +
    mugi(300, 1000, .95, { armR: 'down', face: 'normal' }),
  '31': () => bgShop() + rect(120, 120, 336, 140, '#222', 10) + txt(288, 220, '利益 0', 84, C.gold) +
    [60, 150, 240, 330, 420, 510].map((x, i) => mob(x, 980 + (i % 2) * 30, .65, { color: ['#d36b5b', '#e8c040', '#7aa36b', '#5b7fb5', '#e8d6b3', '#c98a7a'][i], bag: i % 2 })).join(''),
  '32': () => bgSea(false, true) + rect(300, 300, 276, 560, '#f4f4f4', 0, 'stroke="#999" stroke-width="3"') + rect(0, 860, W, 164, '#6b4226') +
    mob(180, 1000, 1, { hat: 1, suit: '#9a7a52' }) + mob(360, 1000, 1, { hat: 1, suit: '#33363d' }),
  '33': () => bgSea(true, true) + rect(0, 860, W, 164, '#6b4226') +
    mugi(300, 1040, 1, { armL: 'hold', face: 'smile', hold: g(rect(-90, -40, 180, 80, '#f6e2b8', 6, `stroke="${C.red}" stroke-width="5"`) + txt(0, 16, 'フォロー', 40, C.red), 'translate(-110,-330) rotate(-12)') }),
  '34': () => bgNavy() + txt(288, 220, 'フォローしてね！', 54, C.gold, 900, 'middle', 'stroke="#222" stroke-width="4" paint-order="stroke"') +
    mugi(288, 1000, 1.05, { armR: 'point', face: 'wink' }),
};

module.exports = { scenes, W, H };
