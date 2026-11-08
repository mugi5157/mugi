// 「むぎの夜間記録」3D 版：監視ルームとモニター内映像を three.js で描き、1フレームずつ書き出す
// window.renderFrame(f) を呼ぶとフレーム f（30fps）を描画する
/* global THREE, TIMELINE */
const W = 576, H = 1024, FPS = 30;
const SW = 480, SH = 360;                       // モニター内映像の解像度
const FONT = "'WenQuanYi Zen Hei','IPAGothic',sans-serif";
const MONO = "'DejaVu Sans Mono',monospace";

// ---------- 共通 ----------
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(42);
const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const lerp = (a, b, x) => a + (b - a) * x;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const grad = (() => { const d = new Uint8Array([70, 160, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...o });
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
const OUT = new THREE.MeshBasicMaterial({ color: 0x1a0f08, side: THREE.BackSide });
function mesh(geo, mat, outline = 0) {          // outline>0 でアニメ風の縁取り（裏面を少し膨らませる）
  const m = new THREE.Mesh(geo, mat);
  if (outline) { const o = new THREE.Mesh(geo, OUT); o.scale.setScalar(1 + outline); m.add(o); }
  return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}

// ---------- キャラ：むぎ（柴犬）----------
function makeDog(o = {}) {
  const FUR = o.fur ?? 0xe0913f, CREAM = o.cream ?? 0xfff1dc;
  const fur = o.sil ? basic(0x07080b) : toon(FUR), cream = o.sil ? fur : toon(CREAM), dark = basic(0x1a0f08);
  const ol = o.sil ? 0 : .04;
  const dog = new THREE.Group(), body = new THREE.Group(); dog.add(body);
  const torso = mesh(new THREE.SphereGeometry(.5, 24, 16), fur, ol); torso.scale.set(.85, .8, 1.35); torso.position.set(0, .78, 0); body.add(torso);
  const chest = mesh(new THREE.SphereGeometry(.36, 20, 14), cream); chest.scale.set(1, 1.1, .8); chest.position.set(0, .78, .42); body.add(chest);
  if (o.spots) { const sp = mesh(new THREE.SphereGeometry(.26, 16, 12), toon(0x8a5a3a)); sp.scale.set(1, .6, 1.2); sp.position.set(.18, 1.08, -.1); body.add(sp); }
  // 脚（付け根で回転）
  const legs = [];
  [[-.24, .62], [.24, .62], [-.24, -.5], [.24, -.5]].forEach(([x, z], i) => {
    const p = new THREE.Group(); p.position.set(x, .72, z);
    const l = mesh(new THREE.CylinderGeometry(.1, .085, .62, 12), i < 2 ? fur : fur, ol); l.position.y = -.31; p.add(l);
    const paw = mesh(new THREE.SphereGeometry(.11, 12, 10), cream); paw.scale.set(1, .7, 1.25); paw.position.set(0, -.62, .03); p.add(paw);
    body.add(p); legs.push(p);
  });
  // しっぽ（巻き尾）
  const tail = new THREE.Group(); tail.position.set(0, 1.08, -.62);
  const tm = mesh(new THREE.TorusGeometry(.2, .085, 10, 20, Math.PI * 1.6), fur, ol); tm.rotation.set(0, Math.PI / 2, .4); tm.position.set(0, .14, -.04); tail.add(tm);
  body.add(tail);
  // 首と頭
  const neck = new THREE.Group(); neck.position.set(0, 1.1, .55); body.add(neck);
  const head = new THREE.Group(); head.position.set(0, .28, .12); neck.add(head);
  const skull = mesh(new THREE.SphereGeometry(.4, 24, 18), fur, ol); skull.scale.set(1.05, .95, 1); head.add(skull);
  const muzzle = mesh(new THREE.SphereGeometry(.22, 18, 14), cream, ol * .8); muzzle.scale.set(1.05, .78, 1.15); muzzle.position.set(0, -.1, .32); head.add(muzzle);
  [-1, 1].forEach(s => {
    const ch = mesh(new THREE.SphereGeometry(.17, 14, 12), cream); ch.position.set(s * .2, -.1, .22); head.add(ch);
    const ear = mesh(new THREE.ConeGeometry(.15, .32, 4), fur, ol); ear.position.set(s * .22, .36, -.02); ear.rotation.set(-.1, Math.PI / 4, s * -.28); head.add(ear);
    const brow = mesh(new THREE.SphereGeometry(.05, 8, 8), cream); brow.position.set(s * .15, .17, .33); head.add(brow);
    const eye = mesh(new THREE.SphereGeometry(o.sil ? .045 : .055, 12, 10), o.sil || o.glow ? basic(0xd9fff0) : dark); eye.scale.z = .5; eye.position.set(s * .15, .05, .37); head.add(eye);
    if (!o.sil && !o.glow) { const hl = mesh(new THREE.SphereGeometry(.018, 8, 6), basic(0xffffff)); hl.position.set(s * .15 + .02, .075, .395); head.add(hl); }
  });
  const nose = mesh(new THREE.SphereGeometry(.065, 12, 10), dark); nose.scale.set(1.2, .8, .8); nose.position.set(0, -.02, .57); head.add(nose);
  if (!o.sil) {   // 赤いバンダナ
    const bd = mesh(new THREE.ConeGeometry(.42, .5, 3), toon(0xc8322a), .03); bd.rotation.set(Math.PI + .5, 0, 0); bd.scale.set(1, 1, .45); bd.position.set(0, -.12, .12); neck.add(bd);
  }
  dog.userData = { body, legs, tail, head, neck, torso };
  dog.scale.setScalar(o.scale ?? 1);
  return dog;
}
// ポーズ：mode = 'sit' | 'walk' | 'stand' | 'curl'
function poseDog(dog, mode, t, o = {}) {
  const { body, legs, tail, head, neck } = dog.userData;
  const wag = Math.sin(t * (o.wagSpeed ?? 14)) * (o.wag ?? .5);
  const breathe = Math.sin(t * 2.4) * .015;
  tail.rotation.set(0, wag, 0); head.rotation.set(o.nod ?? 0, Math.sin(t * .7) * (o.look ?? .15), Math.sin(t * .9) * .05);
  if (mode === 'walk') {
    body.rotation.set(0, 0, 0); body.position.set(0, Math.abs(Math.sin(t * 8)) * .04, 0);
    legs.forEach((l, i) => { l.rotation.set(Math.sin(t * 8 + (i === 0 || i === 3 ? 0 : Math.PI)) * .55, 0, 0); l.scale.y = 1; });
    neck.rotation.x = Math.sin(t * 8) * .05;
  } else if (mode === 'sit') {
    body.rotation.set(-.62, 0, 0); body.position.set(0, -.22 + breathe, .25);
    legs[0].rotation.x = legs[1].rotation.x = .62; legs[0].scale.y = legs[1].scale.y = 1.12;
    legs[2].rotation.x = legs[3].rotation.x = -.95; legs[2].scale.y = legs[3].scale.y = .7;
    neck.rotation.x = .55;
  } else if (mode === 'curl') {   // 丸まって寝る
    body.rotation.set(0, 0, 0); body.position.set(0, -.4 + breathe * 2, 0); legs.forEach(l => { l.rotation.x = 1.4; l.scale.y = .6; });
    neck.rotation.x = 1.1; tail.rotation.y = 0;
  } else { body.rotation.set(0, 0, 0); body.position.set(0, breathe, 0); legs.forEach(l => { l.rotation.x = 0; l.scale.y = 1; }); neck.rotation.x = 0; }
}
function makeHuman(coatColor = 0xe8ecef) {
  const g = new THREE.Group();
  const b = mesh(new THREE.CapsuleGeometry(.36, 1.1, 6, 14), toon(coatColor), .03); b.position.y = 1.0; g.add(b);
  const h = mesh(new THREE.SphereGeometry(.3, 18, 14), toon(0xb9bcc4), .03); h.position.y = 2.0; g.add(h);
  [-1, 1].forEach(s => { const a = mesh(new THREE.CapsuleGeometry(.1, .8, 4, 8), toon(coatColor), .03); a.position.set(s * .46, 1.05, 0); a.rotation.z = s * .12; g.add(a); });
  const gl = mesh(new THREE.TorusGeometry(.09, .018, 6, 16), basic(0x222222)); gl.position.set(-.11, 2.04, .27); g.add(gl);
  const gl2 = gl.clone(); gl2.position.x = .11; g.add(gl2);
  return g;
}

// ---------- 小道具 ----------
function signTex(text, bg = '#3d7dbf') { return canvasTex(512, 96, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = `900 56px ${FONT}`; c.textAlign = 'center'; c.fillText(text, w / 2, 70); }); }
function paperTex(kind) {
  return canvasTex(1024, 1320, (c, w, h) => {
    if (kind === 'memo') {
      c.fillStyle = '#fdf6c8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9c08a'; c.lineWidth = 3;
      for (let i = 0; i < 24; i++) { c.beginPath(); c.moveTo(40, 220 + i * 90); c.lineTo(w - 40, 220 + i * 90); c.stroke(); }
      c.fillStyle = '#333'; c.font = `900 56px ${FONT}`; c.fillText('当直メモ  1/14 深夜', 70, 160);
      const L = [['0:03 停電。非常灯に切替。', '#24407a'], ['入院室の方で犬が吠え続ける。', '#24407a'], ['見に行くと3番ケージの子犬が', '#24407a'], ['高熱。すぐ処置。', '#24407a'], ['', ''], ['…吠えていたのは、', '#24407a'], ['先月退院したはずの柴犬？', '#b22222']];
      c.font = `700 54px ${FONT}`; L.forEach(([s, col], i) => { c.fillStyle = col; c.fillText(s, 70, 290 + i * 90); });
    } else {
      c.fillStyle = '#f6f3ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#3d7dbf'; c.fillRect(0, 0, w, 150);
      c.fillStyle = '#fff'; c.font = `900 66px ${FONT}`; c.textAlign = 'center';
      c.fillText(kind === 'karte' ? '診療カルテ  No.0412' : '退院証明書', w / 2, 100); c.textAlign = 'left';
      c.fillStyle = '#222'; c.font = `700 52px ${FONT}`;
      const L = kind === 'karte' ? ['患者名：むぎ（柴犬・オス）', '入院：2018.11.20', '退院：2018.12.15', '', '', '', '', '', '※ 1/14 夜間の記録あり'] : ['患者名：むぎ', '退院日：2018.12.15', '', '上記の通り退院を証明します。', '', '', '', '', 'みなと動物病院'];
      L.forEach((s, i) => { c.fillStyle = s.startsWith('※') ? '#b22222' : '#222'; c.fillText(s, 80, 270 + i * 100); });
      if (kind !== 'karte') { c.strokeStyle = '#d0281e'; c.lineWidth = 12; c.beginPath(); c.arc(800, 1050, 110, 0, 7); c.stroke(); c.fillStyle = '#d0281e'; c.font = `900 70px ${FONT}`; c.fillText('退院', 730, 1075); }
      // 写真枠（むぎのイラスト）
      c.fillStyle = '#e0913f'; c.beginPath(); c.ellipse(760, 640, 120, 105, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(660, 590); c.lineTo(680, 470); c.lineTo(730, 560); c.fill(); c.beginPath(); c.moveTo(860, 590); c.lineTo(840, 470); c.lineTo(790, 560); c.fill();
      c.fillStyle = '#fff1dc'; c.beginPath(); c.ellipse(760, 690, 75, 50, 0, 0, 7); c.fill();
      c.fillStyle = '#1a0f08'; [[715, 620], [805, 620]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 13, 16, 0, 0, 7); c.fill(); }); c.beginPath(); c.ellipse(760, 665, 18, 12, 0, 0, 7); c.fill();
      c.strokeStyle = '#999'; c.lineWidth = 6; c.strokeRect(610, 450, 300, 330);
    }
  });
}

// ---------- モニター内のセット（サブシーン） ----------
const sub = new THREE.Scene(); sub.fog = new THREE.Fog(0x05070c, 6, 22);
const sets = {};
function addSet(name, build) { const g = new THREE.Group(); g.visible = false; build(g); sub.add(g); sets[name] = g; return g; }
const subAmb = new THREE.AmbientLight(0xffffff, .35); sub.add(subAmb);
const subDir = new THREE.DirectionalLight(0xffffff, .8); subDir.position.set(3, 6, 5); sub.add(subDir);

// A：夜の病院の外観
const lampLight = new THREE.PointLight(0xffd59a, 1.4, 9);
addSet('clinic', g => {
  g.add(mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), toon(0x262b35)));
  const bld = mesh(new THREE.BoxGeometry(7, 3.6, 2), toon(0x9aa6b8), .01); bld.position.set(0, 1.8, -2); g.add(bld);
  const sign = mesh(new THREE.PlaneGeometry(5, .9), basic(0xffffff, { map: signTex('みなと動物病院') })); sign.position.set(0, 3.1, -.99); g.add(sign);
  const door = mesh(new THREE.BoxGeometry(1.4, 2.2, .1), toon(0x2a3442)); door.position.set(0, 1.1, -.98); g.add(door); g.userData.door = door;
  [-2.4, 2.4].forEach(x => { const w = mesh(new THREE.PlaneGeometry(1.4, 1), basic(0x2a3442)); w.position.set(x, 1.7, -.99); g.add(w); });
  const pole = mesh(new THREE.CylinderGeometry(.05, .05, 3.2), toon(0x333333)); pole.position.set(2.6, 1.6, .6); g.add(pole);
  const bulb = mesh(new THREE.SphereGeometry(.16, 12, 10), basic(0xfff0c0)); bulb.position.set(2.6, 3.25, .6); g.add(bulb);
  lampLight.position.set(2.6, 3.1, .8); g.add(lampLight);
  const sky = mesh(new THREE.PlaneGeometry(60, 30), basic(0x0b1226)); sky.position.set(0, 8, -12); g.add(sky);
  // 雪
  const N = 400, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) pos.set([rnd() * 14 - 7, rnd() * 6, rnd() * 8 - 4], i * 3);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: .05, transparent: true, opacity: .8 })); g.add(snow); g.userData.snow = snow;
});
// B：非常灯の廊下
addSet('corridor', g => {
  const floor = mesh(new THREE.PlaneGeometry(4, 20).rotateX(-Math.PI / 2), toon(0x1b222c)); g.add(floor);
  [-2, 2].forEach(x => { const w = mesh(new THREE.PlaneGeometry(20, 3), toon(0x151b23)); w.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; w.position.set(x, 1.5, 0); g.add(w); });
  const ceil = mesh(new THREE.PlaneGeometry(4, 20).rotateX(Math.PI / 2), toon(0x0e1218)); ceil.position.y = 3; g.add(ceil);
  const exit = mesh(new THREE.PlaneGeometry(.8, .28), basic(0x2bd36a)); exit.position.set(0, 2.6, -9.9); g.add(exit);
  const el = new THREE.PointLight(0x2bff8a, 1.6, 12); el.position.set(0, 2.4, -8); g.add(el);
  for (let i = 0; i < 4; i++) [-1.99, 1.99].forEach(x => { const d = mesh(new THREE.PlaneGeometry(1, 2.1), toon(0x2a3340)); d.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; d.position.set(x, 1.05, -2 - i * 2.5); g.add(d); });
});
// C：入院室のケージ
addSet('cages', g => {
  g.add(mesh(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), toon(0x1a2029)));
  const back = mesh(new THREE.PlaneGeometry(20, 8), toon(0x141a22)); back.position.set(0, 4, -2.2); g.add(back);
  const bar = toon(0x7a8594);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const box = new THREE.Group(); box.position.set(-2.4 + c * 2.4, .55 + r * 1.9, -1.4);
    box.add(mesh(new THREE.BoxGeometry(2.2, 1.7, 1.4), toon(0x10151c, { side: THREE.BackSide })));
    for (let k = 0; k < 9; k++) { const b = mesh(new THREE.CylinderGeometry(.025, .025, 1.7), bar); b.position.set(-1 + k * .25, .85, .7); box.add(b); }
    const top = mesh(new THREE.BoxGeometry(2.2, .06, .06), bar); top.position.set(0, 1.7, .7); box.add(top);
    const lbl = mesh(new THREE.PlaneGeometry(.4, .2), basic(0xffffff, { map: signTex(String(r * 3 + c + 1), '#56606e') })); lbl.position.set(.8, 1.55, .72); box.add(lbl);
    g.add(box);
  }
  const l = new THREE.PointLight(0x7dffb0, 1.1, 10); l.position.set(0, 4, 2); g.add(l);
});
// D：昼の街（アニメ風）
addSet('town', g => {
  g.add(mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), toon(0xe9d3a6)));
  const sky = mesh(new THREE.PlaneGeometry(60, 30), basic(0x9fd8ff)); sky.position.set(0, 8, -12); g.add(sky);
  [[-3.5, 0xffb3a0, 2.5], [-1, 0xffe08a, 3.4], [2.2, 0xa8e6a0, 2.8], [4.6, 0xb3c8ff, 2.2]].forEach(([x, c, h]) => {
    const b = mesh(new THREE.BoxGeometry(2.2, h, 2), toon(c), .015); b.position.set(x, h / 2, -4); g.add(b);
    const roof = mesh(new THREE.ConeGeometry(1.7, 1, 4), toon(0xb5543a), .015); roof.rotation.y = Math.PI / 4; roof.position.set(x, h + .5, -4); g.add(roof);
  });
  const sun = mesh(new THREE.SphereGeometry(.8, 16, 12), basic(0xfff36b)); sun.position.set(4, 6, -10); g.add(sun);
});
// E：院長室
addSet('office', g => {
  g.add(mesh(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), toon(0x2e3540)));
  const back = mesh(new THREE.PlaneGeometry(20, 8), toon(0x3a414d)); back.position.set(0, 4, -2.5); g.add(back);
  const desk = mesh(new THREE.BoxGeometry(3, .9, 1.2), toon(0x6b4226), .01); desk.position.set(0, .45, -.8); g.add(desk);
  const plate = mesh(new THREE.PlaneGeometry(1.6, .45), basic(0xffffff, { map: signTex('院長室', '#55606e') })); plate.position.set(1.8, 2.6, -2.48); g.add(plate);
  const dr = makeHuman(); dr.position.set(0, 0, -1.7); g.add(dr); g.userData.dr = dr;
  const shelf = mesh(new THREE.BoxGeometry(1.6, 2.6, .5), toon(0x4e2f1a), .01); shelf.position.set(-2.4, 1.3, -2.2); g.add(shelf);
});
// F：朝の処置室
addSet('ward', g => {
  g.add(mesh(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), toon(0xe8eef2)));
  const back = mesh(new THREE.PlaneGeometry(20, 8), toon(0xcfe6f5)); back.position.set(0, 4, -2.5); g.add(back);
  const win = mesh(new THREE.PlaneGeometry(2.4, 1.6), basic(0xfff6d8)); win.position.set(1.6, 2.4, -2.48); g.add(win);
  const bed = mesh(new THREE.BoxGeometry(1.8, .7, 1), toon(0xffffff), .01); bed.position.set(.6, .35, -1); g.add(bed);
  const dr = makeHuman(); dr.position.set(2.2, 0, -1.2); dr.rotation.y = -.5; g.add(dr);
  const sun = new THREE.PointLight(0xfff0c8, 1.2, 10); sun.position.set(1.6, 2.6, -1); g.add(sun);
});
// G：紙（カルテ・証明書・メモ）を置いた机
const paperMats = { karte: paperTex('karte'), cert: paperTex('cert'), memo: paperTex('memo') };
addSet('paper', g => {
  g.add(mesh(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), toon(0x3a2416)));
  const p = mesh(new THREE.PlaneGeometry(2.2, 2.84).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: paperMats.karte })); p.position.y = .01; p.rotation.y = .08; g.add(p); g.userData.paper = p;
  const lamp = new THREE.SpotLight(0xffe2b0, 2.2, 12, .7, .6); lamp.position.set(-1.5, 4, 1); lamp.target = p; g.add(lamp);
  const pen = mesh(new THREE.CylinderGeometry(.04, .04, 1.4), toon(0x1d2f6b)); pen.rotation.set(0, .6, Math.PI / 2); pen.position.set(1.4, .05, .6); g.add(pen);
});
// H：扉（その夜だけ鍵を開けておく）
addSet('door', g => {
  g.add(mesh(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), toon(0x14100c)));
  const wall = mesh(new THREE.PlaneGeometry(20, 8), toon(0x231a12)); wall.position.set(0, 4, -.05); g.add(wall);
  const glowP = mesh(new THREE.PlaneGeometry(1.5, 2.5), basic(0xffd890)); glowP.position.set(0, 1.25, -.06); g.add(glowP);
  const hinge = new THREE.Group(); hinge.position.set(-.75, 0, 0); g.add(hinge);
  const d = mesh(new THREE.BoxGeometry(1.5, 2.5, .08), toon(0x5a3a22), .01); d.position.set(.75, 1.25, 0); hinge.add(d);
  const knob = mesh(new THREE.SphereGeometry(.06, 10, 8), toon(0xe9b949)); knob.position.set(1.32, 1.2, .07); hinge.add(knob);
  const open = mesh(new THREE.PlaneGeometry(.9, .3), basic(0xffffff, { map: signTex('OPEN', '#2a1a0e') })); open.position.set(.75, 1.95, .05); hinge.add(open);
  const l = new THREE.PointLight(0xffc870, 2, 8); l.position.set(0, 1.4, -1.2); g.add(l);
  g.userData.hinge = hinge;
});

// 登場犬
const mugi = makeDog(); sub.add(mugi);
const mugiGlow = makeDog({ glow: true }); sub.add(mugiGlow);
const shadowDog = makeDog({ sil: true }); sub.add(shadowDog);
const pup = makeDog({ fur: 0xf2e6d8, cream: 0xffffff, scale: .45, spots: true }); sub.add(pup);
const bigDog = makeDog({ fur: 0xf2e6d8, cream: 0xffffff, scale: 1.12, spots: true }); sub.add(bigDog);
const allDogs = [mugi, mugiGlow, shadowDog, pup, bigDog];

// ---------- 監視ルーム（メインシーン） ----------
const room = new THREE.Scene(); room.fog = new THREE.Fog(0x020305, 4, 14); room.background = new THREE.Color(0x020305);
room.add(new THREE.AmbientLight(0x8899bb, .18));
const plastic = toon(0x15171d), plastic2 = toon(0x1f2229);
const screenCanvas = document.createElement('canvas'); screenCanvas.width = SW; screenCanvas.height = SH;
const screenTex = new THREE.CanvasTexture(screenCanvas); screenTex.encoding = THREE.sRGBEncoding;
function monitor(w, h, tex, pos, rotY = 0, rotX = 0) {
  const g = new THREE.Group();
  const shell = mesh(new THREE.BoxGeometry(w + .18, h + .18, .5), plastic, .01); shell.position.z = -.25; g.add(shell);
  const back = mesh(new THREE.BoxGeometry(w * .7, h * .7, .5), plastic2); back.position.z = -.7; g.add(back);
  const scr = mesh(new THREE.PlaneGeometry(w, h), basic(0xffffff, { map: tex })); scr.position.z = .005; g.add(scr);
  g.position.copy(pos); g.rotation.set(rotX, rotY, 0); room.add(g); return g;
}
const mainMon = monitor(1.6, 1.2, screenTex, v3(0, 1.45, 0), 0, -.06);
const screenLight = new THREE.PointLight(0x9cc4ff, 1.2, 6); screenLight.position.set(0, 1.4, 1.2); room.add(screenLight);
// 周りのモニター（それぞれ別のセットの静止画）
const thumbTex = {};
const smallMons = [];
function addSmall(set, pos, ry, rx, w = .62, h = .46) { const t = new THREE.CanvasTexture(document.createElement('canvas')); t.encoding = THREE.sRGBEncoding; thumbTex[set + smallMons.length] = { t, set }; smallMons.push(monitor(w, h, t, pos, ry, rx)); }
addSmall('corridor', v3(-.55, 2.55, -.15), .1, -.15); addSmall('clinic', v3(.55, 2.55, -.15), -.1, -.15);
addSmall('cages', v3(-1.55, 1.5, .25), .6, 0, .8, .6); addSmall('clinic', v3(1.55, 1.5, .25), -.6, 0, .8, .6);
addSmall('corridor', v3(-1.75, .7, .55), .8, .2, .6, .45); addSmall('cages', v3(1.75, .7, .55), -.8, .2, .6, .45);
const desk = mesh(new THREE.BoxGeometry(5, .12, 2.2), toon(0x0f1116)); desk.position.set(0, .55, .9); room.add(desk);
const kb = mesh(new THREE.BoxGeometry(1.2, .05, .38), toon(0x1e2a33)); kb.position.set(0, .64, 1.1); kb.rotation.x = .05; room.add(kb);
for (let i = 0; i < 40; i++) { const k = mesh(new THREE.BoxGeometry(.08, .03, .07), toon(0x2c3a46)); k.position.set(-.52 + (i % 13) * .087, .68, .97 + Math.floor(i / 13) * .09); room.add(k); }
const mug = mesh(new THREE.CylinderGeometry(.09, .08, .2, 14), toon(0x8a3b2f), .02); mug.position.set(.9, .71, 1.1); room.add(mug);

// ---------- レンダラー ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.outputEncoding = THREE.sRGBEncoding; document.getElementById('stage').appendChild(renderer.domElement);
const subRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); subRenderer.setSize(SW, SH); subRenderer.setPixelRatio(1); subRenderer.outputEncoding = THREE.sRGBEncoding;
const camRoom = new THREE.PerspectiveCamera(42, W / H, .05, 40);
const camSubWide = new THREE.PerspectiveCamera(50, SW / SH, .05, 60);
const camSubTall = new THREE.PerspectiveCamera(55, W / H, .05, 60);
const overlay = document.getElementById('overlay').getContext('2d');
const flashEl = document.getElementById('flash');

// ---------- CCTV のオーバーレイ（録画時刻・REC・走査線） ----------
function cctv(ctx, w, h, ts, t, scale = 1) {
  ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < h; y += 3 * scale) ctx.fillRect(0, y, w, 1.2 * scale);
  if (!ts) return;
  const [a, b] = ts.split(' '); const sec = Math.floor(t);
  const tt = a.includes('?') ? a : a.replace(/(\d\d):(\d\d)$/, (m, mm, ss) => { const s = (+ss + sec) % 60, m2 = (+mm + Math.floor((+ss + sec) / 60)) % 60; return String(m2).padStart(2, '0') + ':' + String(s).padStart(2, '0'); });
  ctx.font = `700 ${18 * scale}px ${MONO}`; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(10 * scale, h - 60 * scale, 112 * scale, 50 * scale);
  ctx.fillStyle = '#fff'; ctx.fillText(tt, 16 * scale, h - 38 * scale); ctx.fillText(b, 16 * scale, h - 16 * scale);
  if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(w - 20 * scale, 22 * scale, 7 * scale, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#ff3b3b'; ctx.font = `700 ${15 * scale}px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText('REC', w - 34 * scale, 28 * scale); ctx.textAlign = 'left';
}
function noSignal(ctx, w, h, t) {
  const img = ctx.createImageData(w / 4, h / 4);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  const c = document.createElement('canvas'); c.width = w / 4; c.height = h / 4; c.getContext('2d').putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, w, h); ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, h / 2 - 34, w, 60); ctx.fillStyle = '#e6eefc'; ctx.font = `700 34px ${MONO}`; ctx.textAlign = 'center'; ctx.fillText('NO SIGNAL', w / 2, h / 2 + 8); ctx.textAlign = 'left';
}

// ---------- ショット定義 ----------
// set: モニター内のセット / view: 'room'（監視ルームから見る）か 'full'（映像を全画面）
// sub(t,p): セット内の配置とカメラ / room(p): 監視ルームのカメラ
const DAY = { town: 1, ward: 1, paper: 1, door: 1 };
const show = (setName, dogs) => { Object.values(sets).forEach(s => s.visible = false); sets[setName].visible = true;
  const day = DAY[setName]; subAmb.intensity = day ? .6 : .22; subAmb.color.set(day ? 0xffffff : 0x8fa6d8); subDir.intensity = day ? .9 : .28; subDir.color.set(day ? 0xffffff : 0x9fb4e8);
  sub.background = new THREE.Color(setName === 'town' ? 0x9fd8ff : setName === 'ward' ? 0xcfe6f5 : 0x05070c); allDogs.forEach(d => d.visible = dogs.includes(d)); };
const camAt = (cam, pos, look) => { cam.position.copy(pos); cam.lookAt(look); };
const roomCam = { push: p => camAt(camRoom, v3(lerp(.3, 0, p), lerp(1.9, 1.55, p), lerp(4.6, 2.9, p)), v3(0, 1.5, 0)),
  orbit: p => camAt(camRoom, v3(Math.sin(lerp(-.45, .35, p)) * 3.6, 1.7, Math.cos(lerp(-.45, .35, p)) * 3.6), v3(0, 1.5, 0)),
  pull: p => camAt(camRoom, v3(0, lerp(1.55, 2.2, p), lerp(2.8, 5.2, p)), v3(0, 1.45, 0)),
  low: p => camAt(camRoom, v3(lerp(-.8, .8, p), 1.0, 3.4), v3(0, 1.6, 0)),
  dive: p => camAt(camRoom, v3(0, lerp(1.6, 1.47, p), lerp(3.2, 1.25, ease(p))), v3(0, 1.45, 0)) };
const shots = {
  '01': { set: 'clinic', view: 'room', rc: 'push', sub: (t, p) => { show('clinic', [mugiGlow]); mugiGlow.position.set(0, 0, -.3); mugiGlow.rotation.y = 0; poseDog(mugiGlow, 'sit', t, { wag: .1, look: .25 }); camAt(camSubWide, v3(3.5, 4, 6), v3(0, 1, -.5)); } },
  '02': { set: 'town', view: 'full', sub: (t, p) => { show('town', [mugi]); mugi.position.set(0, 0, 0); mugi.rotation.y = Math.sin(t) * .2; poseDog(mugi, 'sit', t, { wag: .8, wagSpeed: 18, look: .3 }); camAt(camSubTall, v3(Math.sin(lerp(-.6, .6, p)) * 4.2, 1.6, Math.cos(lerp(-.6, .6, p)) * 4.2), v3(0, 1.1, 0)); } },
  '03': { set: 'office', view: 'room', rc: 'orbit', sub: (t, p) => { show('office', []); sets.office.userData.dr.rotation.y = Math.sin(t * 1.5) * .15; camAt(camSubWide, v3(lerp(-1, 1, p), 2.4, 4), v3(0, 1.4, -1.5)); } },
  '04': { set: 'paper', view: 'full', sub: (t, p) => { show('paper', []); sets.paper.userData.paper.material.map = paperMats.cert; camAt(camSubTall, v3(lerp(.4, -.2, p), lerp(3.6, 3, p), lerp(1.2, .6, p)), v3(0, 0, 0)); } },
  '05': { set: 'paper', view: 'full', sub: (t, p) => { show('paper', []); sets.paper.userData.paper.material.map = paperMats.karte; camAt(camSubTall, v3(lerp(-.5, .3, p), lerp(2.6, 3.3, p), lerp(1.6, .8, p)), v3(0, 0, -.1)); } },
  '06': { set: 'corridor', view: 'full', cctv: 1, sub: (t, p) => { show('corridor', []); camAt(camSubTall, v3(1.4, 2.8, 2), v3(lerp(-.2, .2, p), 1, -6)); } },
  '07': { set: 'clinic', view: 'room', rc: 'low', nosignal: 1, sub: (t, p) => { show('clinic', []); camAt(camSubWide, v3(3.5, 4, 6), v3(0, 1, -.5)); } },
  '08': { set: 'corridor', view: 'full', cctv: 1, sub: (t, p) => { show('corridor', [shadowDog]); shadowDog.position.set(lerp(-.3, .2, p), 0, lerp(-8.5, -1.5, p)); shadowDog.rotation.y = 0; poseDog(shadowDog, 'walk', t, { wag: .2 }); camAt(camSubTall, v3(1.4, 2.8, 2), v3(0, 1, -6)); } },
  '09': { set: 'cages', view: 'room', rc: 'dive', sub: (t, p) => { show('cages', [mugi]); const w = Math.min(1, p * 2.2); mugi.position.set(lerp(-4, 0, w), 0, 1.2); mugi.rotation.y = w < 1 ? Math.PI / 2 : lerp(Math.PI / 2, Math.PI, Math.min(1, (p - .45) * 4)); poseDog(mugi, w < 1 ? 'walk' : 'sit', t, { wag: .15 }); camAt(camSubWide, v3(2.5, 3.2, 5.5), v3(0, 1, -.5)); } },
  '10': { set: 'cages', view: 'full', cctv: 1, sub: (t, p) => { show('cages', [pup]); pup.position.set(0, .7, -1.3); pup.rotation.y = .4; poseDog(pup, 'curl', t, { wag: 0 }); camAt(camSubTall, v3(lerp(.6, .2, p), 2.2, lerp(2.2, 1.3, p)), v3(0, .7, -1.4)); } },
  '11': { set: 'paper', view: 'full', sub: (t, p) => { show('paper', []); sets.paper.userData.paper.material.map = paperMats.memo; camAt(camSubTall, v3(lerp(.2, -.3, p), lerp(3.4, 2.8, p), lerp(1, 1.4, p)), v3(0, 0, .1)); } },
  '12': { set: 'ward', view: 'room', rc: 'push', sub: (t, p) => { show('ward', [mugi, pup]); pup.position.set(.6, .7, -1); pup.rotation.y = -.6; poseDog(pup, 'sit', t, { wag: .6, wagSpeed: 16 }); mugi.position.set(-1.2, 0, -.2); mugi.rotation.y = .5; poseDog(mugi, 'sit', t, { wag: .7 }); camAt(camSubWide, v3(lerp(-.5, .5, p), 2.6, 5), v3(0, 1, -1)); } },
  '13': { set: 'clinic', view: 'full', sub: (t, p) => { show('clinic', [mugi]); sets.clinic.userData.door.material.color.set(0xffe7a8); mugi.position.set(0, 0, .3); mugi.rotation.y = 0; poseDog(mugi, 'sit', t, { wag: .2, look: .3 }); camAt(camSubTall, v3(lerp(-1.5, 1.5, p), lerp(1.2, 1.8, p), 5), v3(0, 1.4, 0)); } },
  '14': { set: 'door', view: 'full', sub: (t, p) => { show('door', []); sets.door.userData.hinge.rotation.y = lerp(0, -1.1, ease(Math.min(1, p * 1.3))); camAt(camSubTall, v3(lerp(.6, 0, p), 1.3, lerp(4.5, 3.2, p)), v3(0, 1.3, 0)); } },
  '15': { set: 'clinic', view: 'room', rc: 'orbit', sub: (t, p) => { show('clinic', [mugiGlow, shadowDog]); sets.clinic.userData.door.material.color.set(0xffe7a8); mugiGlow.position.set(-.7, 0, -.1); mugiGlow.rotation.y = 0; poseDog(mugiGlow, 'sit', t, { wag: .2 }); const w = Math.min(1, p * 1.6); shadowDog.position.set(lerp(5, 1, w), 0, -.1); shadowDog.rotation.y = -Math.PI / 2; poseDog(shadowDog, w < 1 ? 'walk' : 'stand', t); camAt(camSubWide, v3(3.5, 4, 6), v3(0, 1, -.5)); } },
  '16': { set: 'clinic', view: 'full', cctv: 1, sub: (t, p) => { show('clinic', [mugi, bigDog]); sets.clinic.userData.door.material.color.set(0xffe7a8); mugi.position.set(-.8, 0, .1); mugi.rotation.y = .25; poseDog(mugi, 'sit', t, { wag: .6 }); bigDog.position.set(.9, 0, .1); bigDog.rotation.y = -.25; poseDog(bigDog, 'sit', t + 1, { wag: .7, wagSpeed: 16 }); camAt(camSubTall, v3(2.6, 3.4, lerp(5.6, 4.6, p)), v3(0, 1, 0)); } },
  '17': { set: 'clinic', view: 'room', rc: 'pull', follow: 1, sub: (t, p) => { show('clinic', [mugi]); sets.clinic.userData.door.material.color.set(0xffe7a8); mugi.position.set(0, 0, .6); mugi.rotation.y = 0; poseDog(mugi, 'sit', t, { wag: .9, wagSpeed: 18, nod: Math.sin(t * 3) * .1 }); camAt(camSubWide, v3(0, 1.6, 3.6), v3(0, 1.2, 0)); } },
};

// 周りの小モニターに静止画を入れる
function fillThumbs() {
  Object.values(thumbTex).forEach(({ t, set }, i) => {
    show(set, set === 'clinic' ? [mugiGlow] : set === 'cages' ? [pup] : []);
    if (set === 'clinic') { mugiGlow.position.set(0, 0, -.3); poseDog(mugiGlow, 'sit', i); camAt(camSubWide, v3(-3, 4, 6), v3(0, 1, -.5)); }
    else if (set === 'cages') { pup.position.set(0, .7, -1.3); poseDog(pup, 'curl', 0); camAt(camSubWide, v3(-2.5, 3, 5), v3(0, 1, -.5)); }
    else camAt(camSubWide, v3(1.4, 2.8, 2), v3(0, 1, -6));
    subRenderer.render(sub, camSubWide);
    const c = document.createElement('canvas'); c.width = SW; c.height = SH; const x = c.getContext('2d');
    x.filter = 'brightness(.55) saturate(.6)'; x.drawImage(subRenderer.domElement, 0, 0); x.filter = 'none'; cctv(x, SW, SH, '00:00:00 14.01.19', i);
    t.image = c; t.needsUpdate = true;
  });
}

// ---------- 1フレーム描画 ----------
let thumbsReady = false;
window.renderFrame = f => {
  if (!thumbsReady) { fillThumbs(); thumbsReady = true; }
  const T = f / FPS;
  let k = TIMELINE.findIndex(s => T < s.start + s.dur); if (k < 0) k = TIMELINE.length - 1;
  const seg = TIMELINE[k], t = T - seg.start, p = Math.min(1, t / seg.dur), sh = shots[seg.id];
  // セットの共通アニメ
  const snow = sets.clinic.userData.snow; snow.position.y = -((T * .35) % 2); sets.clinic.userData.door.material.color.set(0x2a3442);
  lampLight.intensity = 1.2 + Math.sin(T * 13) * .08;
  sh.sub(t, p);
  overlay.clearRect(0, 0, W, H);
  if (sh.view === 'full') {
    renderer.render(sub, camSubTall);
    if (sh.cctv) cctv(overlay, W, H, seg.ts, t, 1.8);
    else { overlay.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < H; y += 4) overlay.fillRect(0, y, W, 1); }
  } else {
    const sx = screenCanvas.getContext('2d');
    if (sh.nosignal && t > .35) noSignal(sx, SW, SH, t);
    else { subRenderer.render(sub, camSubWide); sx.drawImage(subRenderer.domElement, 0, 0); }
    cctv(sx, SW, SH, seg.ts, t);
    if (sh.follow) { sx.font = `900 54px ${FONT}`; sx.textAlign = 'center'; sx.lineWidth = 8; sx.strokeStyle = '#000'; sx.strokeText('フォロー', SW / 2, 70); sx.fillStyle = '#ffcf6a'; sx.fillText('フォロー', SW / 2, 70); sx.textAlign = 'left'; }
    screenTex.needsUpdate = true;
    // 停電：部屋の明かりがちらつく
    screenLight.intensity = sh.nosignal ? (Math.random() < .3 ? .2 : 1.4) : 1.1 + Math.sin(T * 9) * .08;
    roomCam[sh.rc](ease(p));
    renderer.render(room, camRoom);
  }
  // 周辺減光
  const gr = overlay.createRadialGradient(W / 2, H * .42, H * .25, W / 2, H * .45, H * .75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.85)');
  overlay.fillStyle = gr; overlay.fillRect(0, 0, W, H);
  // 白フラッシュ（場面の頭）
  flashEl.style.opacity = seg.flash ? Math.max(0, 1 - t / .35) : 0;
  return k;
};
window.ready = true;
