// node render3d/render.js [開始フレーム] [終了フレーム] [間引き]
// frames/000000.png ... を書き出す（ローカル HTTP サーバー経由で index.html を開く）
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('playwright');
const dir = __dirname, out = path.join(dir, 'frames'); fs.mkdirSync(out, { recursive: true });
const tl = JSON.parse(fs.readFileSync(path.join(dir, 'timeline.json')));
fs.writeFileSync(path.join(dir, 'timeline.js'), 'window.TIMELINE=' + JSON.stringify(tl));
const total = Math.ceil((tl.at(-1).start + tl.at(-1).dur) * 30);
const [a = 0, b = total, step = 1] = process.argv.slice(2).map(Number);
const srv = http.createServer((q, r) => { const f = path.join(dir, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { r.writeHead(e ? 404 : 200); r.end(d); }); }).listen(0);
(async () => {
  const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await br.newPage({ viewport: { width: 576, height: 1024 } });
  pg.on('pageerror', e => console.error('PAGE', e.message));
  await pg.goto(`http://localhost:${srv.address().port}/index.html`); await pg.waitForFunction('window.ready');
  const el = await pg.$('#wrap'); const t0 = Date.now();
  for (let f = a; f < b; f += step) {
    await pg.evaluate(f => window.renderFrame(f), f);
    await el.screenshot({ path: path.join(out, String(f).padStart(6, '0') + '.png') });
    if (f % 300 === 0) console.log(f, '/', total, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  await br.close(); srv.close(); console.log('done', total);
})();
