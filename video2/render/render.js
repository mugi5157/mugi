// node render/render.js : scenes.csv の各行を images/NN.png に描き出す
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { scene, W, H } = require('./scenes');
const rows = fs.readFileSync(path.join(__dirname, '..', 'scenes.csv'), 'utf8').trim().split('\n').slice(1)
  .map(l => { const p = l.split(','); return { id: p[0], ts: p[p.length - 1] }; });
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  for (const r of rows) {
    await page.setContent(`<body style="margin:0;background:#000"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${scene(r.id, r.ts)}</svg></body>`);
    await page.screenshot({ path: path.join(__dirname, '..', 'images', r.id + '.png') });
  }
  await b.close(); console.log('rendered', rows.length);
})();
