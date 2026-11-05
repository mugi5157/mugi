// SVG シーンを PNG に書き出す: node render/render.js [id...]
const path = require('path');
const { chromium } = require('playwright');
const { scenes, W, H } = require('./scenes');

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(scenes);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  for (const id of ids) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${scenes[id]()}</svg>`;
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.screenshot({ path: path.join(__dirname, '..', 'images', `${id}.png`) });
    process.stdout.write(id + ' ');
  }
  await browser.close();
  console.log('done');
})();
