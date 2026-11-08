// 「むぎの夜間記録」— オリジナルの犬キャラ・オリジナル話の監視ルーム風ショート動画
// モニター内映像は 400x300 の SVG。監視ルームは HTML + CSS 3D で斜めのモニターを描く
const W = 576, H = 1024;
const FONT = "'WenQuanYi Zen Hei', 'IPAGothic', sans-serif";
const MONO = "'DejaVu Sans Mono', monospace";
const txt = (x, y, s, size, fill = '#fff', anchor = 'middle', extra = '', font = FONT) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="900" fill="${fill}" text-anchor="${anchor}" ${extra}>${s}</text>`;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const g = (inner, t = '') => `<g transform="${t}">${inner}</g>`;
const DEFS = `<defs>
  <radialGradient id="glowR"><stop offset="0" stop-color="#ff4a3a" stop-opacity=".7"/><stop offset="1" stop-color="#ff4a3a" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowW"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".85"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowG"><stop offset="0" stop-color="#7dffb0" stop-opacity=".6"/><stop offset="1" stop-color="#2aff8a" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".88"/></radialGradient>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity=".25"/></pattern></defs>`;

// ---------- キャラ ----------
// むぎ：柴犬（赤毛・白い胸と口元・巻き尾）、赤いバンダナ
const FUR = '#e0913f', CREAM = '#fff1dc', LINE = '#2a1a0e';
function mugiSit(x, y, s = 1, o = {}) {        // 正面おすわり
  const eyes = o.glow
    ? `<ellipse cx="-18" cy="-150" rx="7" ry="6" fill="#d9fff0"/><ellipse cx="18" cy="-150" rx="7" ry="6" fill="#d9fff0"/><ellipse cx="0" cy="-150" rx="40" ry="14" fill="url(#glowG)"/>`
    : `<ellipse cx="-18" cy="-150" rx="6" ry="7" fill="${LINE}"/><ellipse cx="18" cy="-150" rx="6" ry="7" fill="${LINE}"/><circle cx="-16" cy="-153" r="2" fill="#fff"/><circle cx="20" cy="-153" r="2" fill="#fff"/>`;
  return g(`<ellipse cx="0" cy="0" rx="60" ry="10" fill="#000" opacity=".35"/>` +
    `<path d="M48 -30 q40 -10 30 -50 q-6 -20 -24 -8 q14 10 4 30 Z" fill="${FUR}" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M-46 0 Q-56 -70 -30 -110 L30 -110 Q56 -70 46 0 Z" fill="${FUR}" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M-22 -2 Q-26 -60 0 -100 Q26 -60 22 -2 Z" fill="${CREAM}"/>` +
    `<ellipse cx="-22" cy="-4" rx="14" ry="9" fill="${CREAM}" stroke="${LINE}" stroke-width="3"/><ellipse cx="22" cy="-4" rx="14" ry="9" fill="${CREAM}" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M-34 -112 Q0 -92 34 -112 L20 -88 L0 -80 L-20 -88 Z" fill="#c8322a" stroke="${LINE}" stroke-width="2"/>` +
    `<path d="M-44 -168 L-38 -214 L-12 -188 Z M44 -168 L38 -214 L12 -188 Z" fill="${FUR}" stroke="${LINE}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M-38 -172 L-35 -202 L-20 -186 Z M38 -172 L35 -202 L20 -186 Z" fill="#f6c39a"/>` +
    `<ellipse cx="0" cy="-148" rx="50" ry="44" fill="${FUR}" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M-40 -136 Q-34 -104 0 -100 Q34 -104 40 -136 Q20 -122 0 -134 Q-20 -122 -40 -136 Z" fill="${CREAM}"/>` +
    `<ellipse cx="-24" cy="-168" rx="6" ry="4" fill="${CREAM}"/><ellipse cx="24" cy="-168" rx="6" ry="4" fill="${CREAM}"/>` +
    `<ellipse cx="0" cy="-128" rx="9" ry="6" fill="${LINE}"/>` + eyes +
    (o.smile ? `<path d="M-10 -116 q10 10 20 0" stroke="${LINE}" stroke-width="3" fill="#d65a5a"/>` : `<path d="M-8 -118 q8 6 16 0" stroke="${LINE}" stroke-width="3" fill="none"/>`),
    `translate(${x},${y}) scale(${s * (o.flip ? -1 : 1)},${s})`);
}
function dogWalk(x, y, s = 1, o = {}) {        // 横向き歩き（シルエットにもできる）
  const fur = o.sil ? '#0b0d12' : (o.fur || FUR), cream = o.sil ? '#0b0d12' : (o.cream || CREAM);
  return g(`<ellipse cx="0" cy="0" rx="70" ry="8" fill="#000" opacity=".3"/>` +
    `<path d="M-60 -50 q-30 -30 -14 -60 q8 18 22 26" fill="${fur}" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M-50 -2 L-46 -40 M-26 -2 L-30 -40 M30 -2 L28 -40 M50 -2 L54 -40" stroke="${fur}" stroke-width="14" stroke-linecap="round"/>` +
    `<ellipse cx="0" cy="-58" rx="64" ry="28" fill="${fur}" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M10 -36 Q30 -30 52 -44 L40 -30 Z" fill="${cream}"/>` +
    `<path d="M40 -80 L44 -124 L62 -100 Z" fill="${fur}" stroke="${LINE}" stroke-width="3"/>` +
    `<ellipse cx="64" cy="-90" rx="30" ry="26" fill="${fur}" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M70 -80 q24 0 26 -8 q-2 16 -26 20 Z" fill="${cream}"/><circle cx="96" cy="-88" r="5" fill="${LINE}"/>` +
    (o.sil ? `<circle cx="72" cy="-96" r="4" fill="#d9fff0"/>` : `<circle cx="72" cy="-96" r="4" fill="${LINE}"/>`) +
    (o.sil ? '' : `<path d="M40 -72 Q56 -60 66 -70 L60 -58 Z" fill="#c8322a"/>`),
    `translate(${x},${y}) scale(${s * (o.flip ? -1 : 1)},${s})`);
}
function puppy(x, y, s = 1, sick = false) {
  return g(`<ellipse cx="0" cy="0" rx="34" ry="14" fill="#f2e6d8" stroke="${LINE}" stroke-width="3"/>` +
    `<circle cx="-24" cy="-14" r="20" fill="#f2e6d8" stroke="${LINE}" stroke-width="3"/>` +
    `<path d="M-40 -26 q-10 10 -4 22 q6 -8 8 -16 Z M-8 -26 q10 10 4 22 q-6 -8 -8 -16 Z" fill="#8a5a3a"/>` +
    (sick ? `<path d="M-32 -16 q4 -3 8 0 M-20 -16 q4 -3 8 0" stroke="${LINE}" stroke-width="3" fill="none"/><path d="M-6 -40 q6 -10 0 -18" stroke="#7fd0ff" stroke-width="4" fill="none"/>`
      : `<circle cx="-30" cy="-16" r="3" fill="${LINE}"/><circle cx="-18" cy="-16" r="3" fill="${LINE}"/>`) +
    `<ellipse cx="-24" cy="-6" rx="4" ry="3" fill="${LINE}"/>`, `translate(${x},${y}) scale(${s})`);
}
function bigDog(x, y, s = 1) {               // 成長した子犬（白に茶ぶち）
  return dogWalk(x, y, s, { fur: '#f2e6d8', cream: '#fff' }) +
    `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="-10" cy="-66" rx="22" ry="12" fill="#8a5a3a"/><path d="M48 -116 l-6 -10 l20 8 Z" fill="#8a5a3a"/></g>`;
}
function human(x, y, s = 1, fill = '#3a4050', coat = false) {
  return g(`<circle cx="0" cy="-150" r="24" fill="${fill}"/>` +
    `<path d="M-34 -122 Q-40 -60 -30 0 L30 0 Q40 -60 34 -122 Q0 -136 -34 -122 Z" fill="${coat ? '#e8ecef' : fill}"/>` +
    (coat ? `<path d="M0 -124 V0" stroke="#aab" stroke-width="3"/>` : ''), `translate(${x},${y}) scale(${s})`);
}

// ---------- 背景小物 ----------
function clinicFront(dark = true, lit = false) {
  return rect(0, 0, 400, 300, dark ? '#0d1220' : '#5a6b85') +
    rect(60, 60, 280, 190, '#cfd6df') + rect(60, 60, 280, 34, '#3d7dbf') + txt(200, 86, 'みなと動物病院', 22, '#fff') +
    `<path d="M310 66 h16 v-6 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-16 Z" fill="#fff" opacity=".0"/>` +
    rect(160, 130, 80, 120, lit ? '#ffe7a8' : '#2a3442', 'stroke="#222" stroke-width="3"') + rect(80, 120, 60, 50, '#2a3442') + rect(260, 120, 60, 50, '#2a3442') +
    rect(0, 250, 400, 50, '#262b35') + (dark ? `<rect width="400" height="300" fill="#000" opacity=".35"/>` : '');
}
function corridor(emergency = true) {
  return rect(0, 0, 400, 300, '#0a0d12') + `<path d="M0 0 L140 110 H260 L400 0 Z" fill="#141a22"/><path d="M0 300 L140 190 H260 L400 300 Z" fill="#1b222c"/>` +
    `<path d="M0 0 L140 110 V190 L0 300 Z" fill="#11161d"/><path d="M400 0 L260 110 V190 L400 300 Z" fill="#11161d"/>` + rect(140, 110, 120, 80, '#06080b') +
    (emergency ? rect(176, 92, 48, 14, '#2bd36a') + `<ellipse cx="200" cy="100" rx="90" ry="40" fill="url(#glowG)"/>` : '') +
    [[40, 50], [90, 90]].map(([x, y]) => rect(x, y, 30, 60, '#1d2530')).join('');
}
function cages(open = false) {
  let o = rect(0, 0, 400, 300, '#10151c');
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const x = 30 + c * 120, y = 20 + r * 120;
    o += rect(x, y, 100, 100, '#1a222c', 'stroke="#56606e" stroke-width="4"');
    for (let k = 1; k < 6; k++) o += `<line x1="${x + k * 16}" y1="${y}" x2="${x + k * 16}" y2="${y + 100}" stroke="#56606e" stroke-width="3"/>`;
  }
  return o + `<ellipse cx="200" cy="40" rx="160" ry="50" fill="url(#glowG)" opacity=".5"/>`;
}

// ---------- モニター内映像 ----------
const screens = {
  '01': () => clinicFront(true) + mugiSit(200, 262, .5, { glow: 1 }),
  '02': () => rect(0, 0, 400, 300, '#9fd8ff') + rect(0, 210, 400, 90, '#e9d3a6') +
    [[10, 90, 90, '#ffb3a0'], [110, 60, 90, '#ffe08a'], [300, 80, 100, '#a8e6a0']].map(([x, y, w, c]) => rect(x, y, w, 210 - y, c, 'stroke="#333" stroke-width="3"')).join('') +
    `<circle cx="340" cy="44" r="26" fill="#fff36b"/>` + mugiSit(210, 280, .6, { smile: 1 }) + human(80, 290, .6, '#ff8a7a') + human(330, 290, .55, '#7a9cff'),
  '03': () => rect(0, 0, 400, 300, '#232a33') + rect(0, 220, 400, 80, '#2e3540') + rect(250, 40, 120, 90, '#e6ebf0') + txt(310, 95, '院長室', 22, '#333') +
    human(150, 290, 1.05, '#555b66', true) + `<path d="M120 120 q30 -40 60 0" stroke="#fff" stroke-width="0"/>`,
  '04': () => rect(0, 0, 400, 300, '#e9edf2') + rect(40, 30, 320, 240, '#fff', 'stroke="#9aa" stroke-width="3"') + txt(200, 70, '退院証明書', 28, '#333') +
    `<svg x="140" y="80" width="120" height="130" viewBox="-70 -230 140 240">${mugiSit(0, 0, 1)}</svg>` + txt(200, 240, '2018.12.15  患者名：むぎ', 18, '#333') +
    `<g transform="translate(300,200) rotate(-14)"><circle r="34" fill="none" stroke="#d0281e" stroke-width="6"/>${txt(0, 8, '退院', 22, '#d0281e')}</g>`,
  '07': () => clinicFront(true) + `<rect width="400" height="300" fill="#000" opacity=".75"/>` + txt(200, 160, 'NO SIGNAL', 34, '#d9e2ef', 'middle', 'opacity=".5"', MONO),
  '08': () => corridor() + dogWalk(170, 230, .55, { sil: 1 }),
  '09': () => cages() + mugiSit(200, 296, .55, { flip: 1 }),
  '10': () => cages() + `<ellipse cx="200" cy="140" rx="70" ry="50" fill="url(#glowW)" opacity=".5"/>` + puppy(212, 200, 1.6, true),
  '12': () => rect(0, 0, 400, 300, '#cfe6f5') + rect(0, 200, 400, 100, '#e8eef2') + `<circle cx="200" cy="120" r="130" fill="url(#glowW)" opacity=".7"/>` +
    rect(130, 160, 140, 60, '#fff', 'stroke="#aab" stroke-width="3"') + puppy(210, 200, 1.4) + mugiSit(90, 290, .5, { smile: 1 }) + human(320, 290, .9, '#555b66', true),
  '13': () => clinicFront(true, true) + mugiSit(200, 262, .5) + `<circle cx="340" cy="40" r="18" fill="#f3f0d0" opacity=".8"/>`,
  '15': () => clinicFront(true, true) + mugiSit(140, 262, .48, { glow: 1 }) + dogWalk(280, 262, .75, { sil: 1 }),
  '16': () => clinicFront(true, true) + mugiSit(140, 262, .48) + bigDog(260, 262, .75),
  '17': () => rect(0, 0, 400, 300, '#0d1018') + `<circle cx="200" cy="150" r="170" fill="url(#glowW)" opacity=".35"/>` + mugiSit(200, 290, .8, { smile: 1 }) +
    txt(200, 60, 'フォロー', 40, '#ffcf6a', 'middle', 'stroke="#000" stroke-width="4" paint-order="stroke"'),
  cctvA: () => corridor(false), cctvB: () => clinicFront(true), cctvC: () => cages(),
};
const ts2 = ts => ts ? `<rect x="10" y="252" width="${ts.length * 11}" height="36" fill="#000" opacity=".4"/>` + txt(16, 267, ts.split(' ')[0], 16, '#fff', 'start', '', MONO) + txt(16, 285, ts.split(' ')[1], 16, '#fff', 'start', '', MONO) : '';
const scr = (id, ts, rec = true) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="none">${DEFS}${screens[id]()}${ts2(ts)}` +
  (rec && ts ? `<circle cx="368" cy="20" r="6" fill="#ff3b3b"/>` + txt(356, 26, 'REC', 14, '#ff3b3b', 'end', '', MONO) : '') + `<rect width="400" height="300" fill="url(#scan)"/></svg>`;

// ---------- 監視ルーム（HTML/CSS 3D）----------
function room(id, ts) {
  return `<div class="room">
    <div class="glow"></div>
    <div class="mon small s1">${scr('cctvA', '')}</div><div class="mon small s2">${scr('cctvB', '')}</div>
    <div class="mon side l">${scr('cctvC', '')}</div><div class="mon side r">${scr('cctvA', '')}</div>
    <div class="mon main">${scr(id, ts)}</div>
    <div class="desk"></div><div class="kbd"></div><div class="vig"></div></div>`;
}
const CSS = `body{margin:0;background:#000}.room{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#141822,#05060a 70%);perspective:900px}
  .mon{position:absolute;background:#0e1015;border:8px solid #1a1d24;border-radius:10px;box-shadow:0 0 0 3px #08090c}
  .main{left:40px;top:190px;width:496px;height:372px;transform:rotateX(12deg);box-shadow:0 0 90px rgba(150,190,255,.25),0 0 0 3px #08090c}
  .small{width:120px;height:90px;top:70px;filter:brightness(.55)}.s1{left:150px}.s2{left:306px}
  .side{width:150px;height:112px;top:430px;filter:brightness(.5)}.l{left:-60px;transform:rotateY(55deg)}.r{right:-60px;transform:rotateY(-55deg)}
  .glow{position:absolute;left:-100px;top:150px;width:776px;height:560px;background:radial-gradient(ellipse,rgba(120,170,255,.16),transparent 65%)}
  .desk{position:absolute;left:-40px;right:-40px;top:640px;bottom:-40px;background:#0c0e13;transform:perspective(500px) rotateX(40deg);transform-origin:top}
  .kbd{position:absolute;left:150px;width:276px;top:680px;height:70px;background:#1b2530;border-radius:6px;transform:perspective(500px) rotateX(50deg);opacity:.8}
  .vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,transparent 50%,rgba(0,0,0,.9))}`;

// ---------- 全画面シーン ----------
const fullSvg = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${DEFS}${inner}<rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
const full = {
  '05': () => fullSvg(rect(0, 0, W, H, '#0b0e12') + `<g transform="translate(288,560) rotate(4)">` + rect(-230, -300, 460, 600, '#f3f0e6', 'rx="6"') +
    rect(-230, -300, 460, 70, '#3d7dbf') + txt(0, -252, '診療カルテ  No.0412', 30, '#fff') +
    txt(-200, -180, '患者名：むぎ（柴犬・オス）', 24, '#222', 'start') + txt(-200, -136, '入院：2018.11.20', 24, '#222', 'start') + txt(-200, -92, '退院：2018.12.15', 24, '#222', 'start') +
    `<svg x="40" y="-70" width="170" height="190" viewBox="-70 -230 140 240">${mugiSit(0, 0, 1)}</svg>` +
    txt(-200, 200, '※ 1/14 夜間の記録あり', 24, '#b22222', 'start') + `</g>`),
  '06': () => fullSvg(`<svg width="${W}" height="${H}" viewBox="60 0 225 300" preserveAspectRatio="xMidYMid slice">${corridor()}</svg>` + `<rect width="${W}" height="${H}" fill="url(#scan)"/>` +
    txt(30, 940, '00:03:11', 34, '#fff', 'start', '', MONO) + txt(30, 980, '14.01.19', 34, '#fff', 'start', '', MONO) + txt(546, 60, '● REC  CAM-02', 24, '#ff4a4a', 'end', '', MONO)),
  '11': () => fullSvg(rect(0, 0, W, H, '#0a0d10') + `<g transform="translate(288,600) rotate(-7)">` + rect(-240, -290, 480, 580, '#fdf6c8', 'rx="4"') +
    Array.from({ length: 11 }, (_, i) => `<line x1="-220" y1="${-200 + i * 44}" x2="220" y2="${-200 + i * 44}" stroke="#c9c08a" stroke-width="2"/>`).join('') +
    txt(-210, -230, '当直メモ  1/14 深夜', 26, '#333', 'start') + txt(-210, -170, '0:03 停電。非常灯に切替。', 24, '#24407a', 'start') +
    txt(-210, -126, '入院室の方で犬が吠え続ける。', 24, '#24407a', 'start') + txt(-210, -82, '見に行くと3番ケージの子犬が', 24, '#24407a', 'start') +
    txt(-210, -38, '高熱。すぐ処置。', 24, '#24407a', 'start') + txt(-210, 30, '…吠えていたのは、', 24, '#24407a', 'start') + txt(-210, 74, '先月退院したはずの柴犬？', 24, '#b22222', 'start') + `</g>`),
  '14': () => fullSvg(rect(0, 0, W, H, '#14100c') + `<circle cx="288" cy="520" r="300" fill="url(#glowW)" opacity=".35"/>` +
    rect(150, 260, 276, 520, '#5a3a22', 'stroke="#2a1a0e" stroke-width="8"') + rect(176, 290, 224, 200, '#ffe7a8', 'opacity=".8"') + `<circle cx="390" cy="560" r="16" fill="#e9b949"/>` +
    `<g transform="translate(390,600)"><rect x="-14" y="0" width="28" height="40" rx="4" fill="#e9b949"/><path d="M-10 0 v-16 a10 10 0 0 1 20 0" stroke="#e9b949" stroke-width="6" fill="none" transform="rotate(-30 10 0)"/></g>` +
    txt(288, 860, 'OPEN', 46, '#ffe7a8', 'middle', 'opacity=".8"', MONO)),
};

function page(id, ts) {
  const body = full[id] ? full[id]() : room(id, ts);
  return `<html><head><style>${CSS}</style></head><body>${body}</body></html>`;
}
module.exports = { page, W, H };
