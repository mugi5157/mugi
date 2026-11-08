// 「ランタの記録」— オリジナルキャラ・オリジナル話の監視ルーム風ショート動画
// モニター内の映像は 400x300、全画面シーンは 576x1024 で描く
const W = 576, H = 1024;
const FONT = "'WenQuanYi Zen Hei', 'IPAGothic', sans-serif";
const MONO = "'DejaVu Sans Mono', monospace";
const txt = (x, y, s, size, fill = '#fff', anchor = 'middle', extra = '', font = FONT) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="900" fill="${fill}" text-anchor="${anchor}" ${extra}>${s}</text>`;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const g = (inner, t = '') => `<g transform="${t}">${inner}</g>`;

// ---------- キャラ：ランタ ----------
// フード付きの長いコート、影の中に光る琥珀色の目、両手にランタン
function lantern(x, y, s = 1, lit = true) {
  return g((lit ? `<circle cx="0" cy="0" r="70" fill="url(#glow)"/>` : '') +
    `<path d="M-6 -34 q6 -10 12 0" stroke="#3a2a1a" stroke-width="3" fill="none"/>` +
    `<rect x="-14" y="-28" width="28" height="6" rx="2" fill="#3a2a1a"/>` +
    `<rect x="-12" y="-22" width="24" height="34" rx="4" fill="${lit ? '#ffcf6a' : '#3b3b3b'}" stroke="#3a2a1a" stroke-width="3"/>` +
    (lit ? `<ellipse cx="0" cy="-4" rx="5" ry="9" fill="#fff6d0"/>` : '') +
    `<rect x="-14" y="12" width="28" height="6" rx="2" fill="#3a2a1a"/>`, `translate(${x},${y}) scale(${s})`);
}
function lanta(x, y, s = 1, o = {}) {
  const coat = o.noCoat ? '#5a5f6b' : '#6b4a2f', lean = o.run ? -12 : 0;
  let b = `<ellipse cx="0" cy="0" rx="70" ry="12" fill="#000" opacity=".35"/>`;
  // 脚
  b += o.run
    ? `<path d="M-10 -120 L-50 -10 M10 -120 L40 -30 L60 -4" stroke="#222" stroke-width="22" stroke-linecap="round" fill="none"/>`
    : `<path d="M-16 -120 L-20 -4 M16 -120 L20 -4" stroke="#222" stroke-width="22" stroke-linecap="round"/>`;
  // コート
  b += `<path d="M-46 -280 Q-62 -180 -58 -90 L58 -90 Q62 -180 46 -280 Q0 -300 -46 -280 Z" fill="${coat}" stroke="#1a1208" stroke-width="4"/>`;
  if (!o.noCoat) b += `<path d="M0 -280 L0 -92" stroke="#3e2a18" stroke-width="4"/><rect x="-58" y="-170" width="116" height="12" fill="#3e2a18"/>`;
  // 腕
  const arms = o.hug
    ? `<path d="M-44 -260 Q-60 -200 -14 -190 M44 -260 Q60 -200 14 -190" stroke="${coat}" stroke-width="24" stroke-linecap="round" fill="none"/>`
    : o.armsDown
      ? `<path d="M-44 -260 Q-60 -200 -56 -150 M44 -260 Q60 -200 56 -150" stroke="${coat}" stroke-width="24" stroke-linecap="round" fill="none"/>`
      : `<path d="M-44 -260 Q-80 -220 -96 -170 M44 -260 Q80 -220 96 -170" stroke="${coat}" stroke-width="24" stroke-linecap="round" fill="none"/>`;
  b += arms;
  if (o.hug && o.hold) b += o.hold;
  if (!o.hug && !o.armsDown && o.lanterns !== false) b += lantern(-100, -140, 1, o.lit !== false) + lantern(100, -140, 1, o.lit !== false);
  // フード
  b += `<path d="M-52 -290 Q-60 -380 0 -390 Q60 -380 52 -290 Q0 -270 -52 -290 Z" fill="${o.noCoat ? '#4a4f5b' : '#5a3d26'}" stroke="#1a1208" stroke-width="4"/>` +
    `<ellipse cx="0" cy="-322" rx="34" ry="30" fill="#0d0a08"/>`;
  // 目
  if (o.eyes !== false) b += `<ellipse cx="-13" cy="-324" rx="7" ry="5" fill="#ffb53b"/><ellipse cx="13" cy="-324" rx="7" ry="5" fill="#ffb53b"/>` +
    `<ellipse cx="-13" cy="-324" rx="14" ry="10" fill="#ffb53b" opacity=".25"/><ellipse cx="13" cy="-324" rx="14" ry="10" fill="#ffb53b" opacity=".25"/>`;
  if (o.smile) b += `<path d="M-10 -306 q10 8 20 0" stroke="#ffb53b" stroke-width="3" fill="none"/>`;
  return g(b, `translate(${x},${y}) scale(${s}) rotate(${lean})`);
}
function kitten(x, y, s = 1) {
  return g(`<ellipse cx="0" cy="0" rx="22" ry="16" fill="#f0f0f0" stroke="#555" stroke-width="2"/>` +
    `<circle cx="0" cy="-20" r="15" fill="#f0f0f0" stroke="#555" stroke-width="2"/>` +
    `<path d="M-13 -28 l-2 -14 l10 8 Z M13 -28 l2 -14 l-10 8 Z" fill="#f0f0f0" stroke="#555" stroke-width="2"/>` +
    `<circle cx="-5" cy="-21" r="2.5" fill="#333"/><circle cx="5" cy="-21" r="2.5" fill="#333"/><path d="M-2 -15 l2 2 l2 -2" stroke="#d77" stroke-width="2" fill="none"/>`,
    `translate(${x},${y}) scale(${s})`);
}
function person(x, y, s = 1, fill = '#3a3f4b') {
  return g(`<circle cx="0" cy="-130" r="22" fill="${fill}"/><path d="M-30 -104 Q-36 -50 -26 0 L26 0 Q36 -50 30 -104 Q0 -116 -30 -104 Z" fill="${fill}"/>`, `translate(${x},${y}) scale(${s})`);
}
function warehouses(dark = true) {
  const c = dark ? '#1c2230' : '#596273';
  return [[0, 120, 140], [130, 100, 150], [270, 130, 130]].map(([x, y, w]) =>
    `<path d="M${x} ${y + 30} L${x + w / 2} ${y} L${x + w} ${y + 30} V300 H${x} Z" fill="${c}" stroke="#0b0e14" stroke-width="3"/>` +
    rect(x + w / 2 - 22, y + 90, 44, 300 - y - 90, '#0b0e14')).join('');
}
const DEFS = `<defs><radialGradient id="glow"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a00" stop-opacity="0"/></radialGradient>
  <radialGradient id="boom"><stop offset="0" stop-color="#fff8e0"/><stop offset=".35" stop-color="#ffb13b"/><stop offset=".7" stop-color="#e2461c" stop-opacity=".8"/><stop offset="1" stop-color="#e2461c" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity=".22"/></pattern></defs>`;

// ---------- モニター内の映像（400x300） ----------
const screens = {
  '02': () => rect(0, 0, 400, 300, '#9fd8ff') + rect(0, 200, 400, 100, '#f2d6a0') +
    [[20, 90, 70, '#ff9e7a'], [100, 70, 80, '#ffd36e'], [300, 80, 90, '#9be08e']].map(([x, y, w, c]) => rect(x, y, w, 200 - y, c, 'stroke="#333" stroke-width="3"') + rect(x + w / 2 - 10, 160, 20, 40, '#7a4a2c')).join('') +
    `<circle cx="340" cy="50" r="28" fill="#fff36b"/>` + lanta(200, 290, .62, { smile: 1 }) + person(70, 290, .6, '#ff7a7a') + person(330, 290, .55, '#7a9cff'),
  '03': () => rect(0, 0, 400, 300, '#2a1d14') + rect(110, 20, 180, 260, '#e9dcc0', 'stroke="#5a4630" stroke-width="4"') + txt(200, 58, 'WANTED?', 28, '#5a2a1a', 'middle', '', MONO) +
    `<svg x="130" y="70" width="140" height="150" viewBox="-150 -400 300 330">${lanta(0, -60, 1, { lit: false })}</svg>` +
    `<g transform="translate(200,200) rotate(-14)"><rect x="-90" y="-28" width="180" height="56" fill="none" stroke="#d0281e" stroke-width="7"/>${txt(0, 18, '放火犯？', 38, '#d0281e')}</g>`,
  '04': () => rect(0, 0, 400, 300, '#141a2a') + `<circle cx="200" cy="170" r="160" fill="url(#glow)" opacity=".6"/>` +
    lanta(200, 290, .62) + person(70, 290, .55, '#2a3040') + person(120, 295, .45, '#2a3040') + person(320, 292, .5, '#2a3040'),
  '05': () => rect(0, 0, 400, 300, '#0f1e33') +
    `<g transform="translate(200,140)"><path d="M0 -90 L24 -30 L88 -28 L38 12 L56 76 L0 40 L-56 76 L-38 12 L-88 -28 L-24 -30 Z" fill="#d8b04a" stroke="#fff3c0" stroke-width="4"/>${lantern(0, 0, 1)}</g>` +
    txt(200, 270, 'HARBOR CITY P.D. ARCHIVE', 18, '#cfe2ff', 'middle', '', MONO),
  '07': () => rect(0, 0, 400, 300, '#120c10') + warehouses() + `<circle cx="210" cy="150" r="190" fill="url(#boom)"/>` +
    Array.from({ length: 14 }, (_, i) => `<path d="M210 150 L${210 + Math.cos(i) * 220} ${150 + Math.sin(i * 1.7) * 200}" stroke="#ffd27a" stroke-width="3" opacity=".6"/>`).join(''),
  '08': () => rect(0, 0, 400, 300, '#1a0d08') + warehouses() + `<circle cx="300" cy="170" r="160" fill="url(#boom)" opacity=".9"/><circle cx="60" cy="200" r="100" fill="url(#boom)" opacity=".7"/>` +
    lanta(200, 290, .6, { run: 1, lit: true }),
  '09': () => rect(0, 0, 400, 300, '#1a0d08') + warehouses() + `<circle cx="80" cy="240" r="80" fill="url(#boom)"/>` +
    `<path d="M40 280 q30 -20 70 -6 q20 10 40 0 l-10 16 h-100 Z" fill="#6b4a2f"/>` + lanta(260, 290, .6, { run: 1, noCoat: 1, lanterns: false, armsDown: 1 }),
  '10': () => rect(0, 0, 400, 300, '#14100e') + warehouses() + `<circle cx="200" cy="200" r="90" fill="url(#glow)" opacity=".5"/>` +
    lanta(200, 295, .65, { noCoat: 1, hug: 1, hold: `<ellipse cx="0" cy="-196" rx="34" ry="24" fill="#ddd" opacity=".9"/>` }),
  '12': () => rect(0, 0, 400, 300, '#20242c') + rect(0, 200, 400, 100, '#2c313b') + rect(90, 190, 220, 20, '#4a4f5a') +
    `<circle cx="200" cy="40" r="16" fill="#fff6c8"/><path d="M200 56 L120 200 H280 Z" fill="#fff6c8" opacity=".08"/>` +
    lanta(140, 290, .55, { noCoat: 1, armsDown: 1 }) + person(300, 290, .9, '#555b66'),
  '14': () => rect(0, 0, 400, 300, '#1a1410') + `<circle cx="200" cy="160" r="150" fill="url(#glow)" opacity=".55"/>` +
    lanta(200, 360, .8, { noCoat: 1, hug: 1, hold: kitten(0, -186, 1.5) }),
  '15': () => rect(0, 0, 400, 300, '#22262e') + `<path d="M0 150 H300 Q330 150 330 180 V300" stroke="#7a5a3a" stroke-width="40" fill="none"/>` +
    `<path d="M200 130 l10 16 l-8 10 l12 14" stroke="#111" stroke-width="5" fill="none"/>` + `<circle cx="206" cy="150" r="40" fill="none" stroke="#e33" stroke-width="5"/>` +
    rect(40, 40, 150, 60, '#f3eedf', 'transform="rotate(-4 115 70)"') + txt(115, 80, '原因：ガス管', 22, '#222'),
  '16': () => rect(0, 0, 400, 300, '#171b24') + [40, 90, 140, 260, 310, 360].map((x, i) => person(x, 290 + (i % 2) * 6, .7, '#2c3240')).join('') +
    lanta(200, 210, .3, { lit: true }) + txt(80, 120, 'ひそ…', 20, '#8a93a8') + txt(330, 110, 'ひそ…', 20, '#8a93a8'),
  '17': () => rect(0, 0, 400, 300, '#05070c') + rect(0, 240, 400, 60, '#0c1018') +
    [40, 140, 260, 360].map((x, i) => rect(x - 3, 90, 6, 150, '#222') + (i < 1 ? `<circle cx="${x}" cy="90" r="40" fill="url(#glow)"/><circle cx="${x}" cy="90" r="8" fill="#ffe6a0"/>` : `<circle cx="${x}" cy="90" r="8" fill="#333"/>`)).join('') +
    lanta(230, 265, .45, { lanterns: false, armsDown: 1 }),
  '18': () => rect(0, 0, 400, 300, '#0d1018') + `<circle cx="200" cy="150" r="170" fill="url(#glow)" opacity=".4"/>` + lanta(200, 300, .7) +
    txt(200, 60, 'フォロー', 40, '#ffcf6a', 'middle', 'stroke="#000" stroke-width="4" paint-order="stroke"'),
  // 上の小モニター用
  cctvA: () => rect(0, 0, 400, 300, '#1b2028') + warehouses(false),
  cctvB: () => rect(0, 0, 400, 300, '#14181f') + rect(0, 220, 400, 80, '#262b35') + [60, 200, 340].map(x => rect(x - 2, 60, 4, 160, '#333')).join(''),
};

// ---------- 監視ルーム ----------
function screenSVG(id, x, y, w, h, ts, bright = 1) {
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 400 300" preserveAspectRatio="none">${screens[id]()}` +
    (ts ? `<rect x="10" y="252" width="${ts.length * 11.5}" height="34" fill="#000" opacity=".35"/>` + txt(16, 266, ts.split(' ')[0], 16, '#fff', 'start', '', MONO) + txt(16, 284, ts.split(' ')[1], 16, '#fff', 'start', '', MONO) : '') +
    `<rect width="400" height="300" fill="url(#scan)"/><rect width="400" height="300" fill="#fff" opacity="${(1 - bright) * 0.0}"/></svg>`;
}
function room(id, ts) {
  let o = rect(0, 0, W, H, '#07080b');
  // 小モニター（上）
  o += [[150, 40], [330, 40]].map(([x, y], i) => rect(x - 8, y - 8, 112, 92, '#15171d', 'rx="6"') + screenSVG(i ? 'cctvB' : 'cctvA', x, y, 96, 76, '', .6) + rect(x, y, 96, 76, '#000', 'opacity=".35"')).join('');
  // 横の斜めモニター
  o += `<path d="M0 360 L70 380 L70 520 L0 540 Z" fill="#15171d"/><path d="M8 372 L62 388 L62 512 L8 528 Z" fill="#2a3550" opacity=".7"/>` +
    `<path d="M576 360 L506 380 L506 520 L576 540 Z" fill="#15171d"/><path d="M568 372 L514 388 L514 512 L568 528 Z" fill="#3a2f55" opacity=".7"/>`;
  // メインモニター
  o += `<ellipse cx="288" cy="330" rx="300" ry="260" fill="#9cc4ff" opacity=".07"/>` +
    rect(78, 138, 420, 330, '#121419', 'rx="14" stroke="#262a33" stroke-width="4"') + screenSVG(id, 94, 154, 388, 291, ts);
  // デスク・キーボード
  o += `<path d="M0 640 L120 520 L456 520 L576 640 V1024 H0 Z" fill="#0f1116"/><path d="M140 560 L436 560 L470 640 L106 640 Z" fill="#1e2a33" opacity=".8"/>` +
    `<path d="M420 760 L520 700 L576 730 L576 820 Z" fill="#1a1d24"/>`;
  o += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  return o;
}

// ---------- 全画面シーン ----------
const full = {
  '01': () => rect(0, 0, W, H, '#060402') + `<circle cx="288" cy="560" r="300" fill="url(#glow)" opacity=".35"/>` + lanta(288, 820, 1.3) + `<rect width="${W}" height="${H}" fill="url(#vig)"/>`,
  '06': () => `<svg width="${W}" height="${H}" viewBox="40 0 225 300" preserveAspectRatio="xMidYMid slice">${screens.cctvA()}${lanta(150, 290, .35, { lit: true })}</svg>` +
    `<rect width="${W}" height="${H}" fill="url(#scan)"/>` + txt(30, 940, '20:00:12', 34, '#fff', 'start', '', MONO) + txt(30, 980, '05.11.95', 34, '#fff', 'start', '', MONO) +
    txt(546, 60, '● REC  CAM-03', 24, '#ff4a4a', 'end', '', MONO) + `<rect width="${W}" height="${H}" fill="url(#vig)"/>`,
  '11': () => rect(0, 0, W, H, '#0a0d10') + `<g transform="translate(288,640) rotate(-8)">` + rect(-250, -300, 500, 600, '#b8d6cf', 'rx="8"') +
    Array.from({ length: 6 }, (_, i) => `<circle cx="240" cy="${-240 + i * 100}" r="12" fill="#556" />`).join('') +
    txt(-220, -250, 'HARBOR WAREHOUSE  SECURITY LOG', 20, '#2a4a4a', 'start', '', MONO) + txt(-220, -215, 'DATE: 05.11.1995   NIGHT SHIFT', 18, '#2a4a4a', 'start', '', MONO) +
    Array.from({ length: 10 }, (_, i) => `<line x1="-230" y1="${-180 + i * 44}" x2="220" y2="${-180 + i * 44}" stroke="#7aa3a0" stroke-width="2"/>`).join('') +
    txt(-220, -150, '20:01 倉庫街で爆発。', 24, '#1d2f6b', 'start') + txt(-220, -106, 'フードの男が炎の中へ入っていった。', 24, '#1d2f6b', 'start') +
    txt(-220, -62, '倉庫の奥に、小さな灯りが', 24, '#1d2f6b', 'start') + txt(-220, -18, 'ひとつ残っていた。', 24, '#1d2f6b', 'start') +
    txt(-220, 26, '…あれは誰の灯りだ？', 24, '#8a1d1d', 'start') + `</g><rect width="${W}" height="${H}" fill="url(#vig)"/>`,
  '13': () => rect(0, 0, W, H, '#e9e6f0') +
    [['#ff2bd6', -10], ['#21e0ff', 10], ['#111', 0]].map(([c, dx]) => txt(288 + dx, 520, '「消えかけて', 54, c, 'middle', 'opacity=".9"') + txt(288 + dx, 600, 'いたから」', 54, c, 'middle', 'opacity=".9"')).join('') +
    Array.from({ length: 12 }, (_, i) => rect(0, 80 * i + (i * 37) % 60, W, 4 + (i % 3) * 3, i % 2 ? '#21e0ff' : '#ff2bd6', 'opacity=".35"')).join('') +
    txt(288, 380, '0511199520011', 30, '#888', 'middle', 'opacity=".6"', MONO),
};

function scene(id, ts) {
  const inner = full[id] ? full[id]() : room(id, ts);
  return DEFS + inner;
}
module.exports = { scene, W, H, ids: [...Object.keys(full), ...Object.keys(screens).filter(k => /^\d+$/.test(k))].sort() };
