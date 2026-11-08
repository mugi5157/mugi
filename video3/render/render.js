// node render/render.js : scenes.csv の各行を images/NN.png に描き出す
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { page: makePage, W, H } = require('./scenes');
const rows = fs.readFileSync(path.join(__dirname, '..', 'scenes.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(','));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  for (const [id, , , ts] of rows) {
    await p.setContent(makePage(id, ts));
    await p.screenshot({ path: path.join(__dirname, '..', 'images', id + '.png') });
  }
  await b.close(); console.log('rendered', rows.length);
})();
