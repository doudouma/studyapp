import { chromium } from 'playwright';
const url = 'https://waytoagi.feishu.cn/wiki/XGWswzvtZiax9JkVnxjcvNHfnxh';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ locale: 'zh-CN', viewport: { width: 1400, height: 1000 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(9000);
const info = await page.evaluate(() => {
  const res = {};
  const sels = ['.docx-block', '.render-unit-wrapper', '.page-block', '[data-block-id]', '.docx-text-block', '.zone-container', '.docx-editor', '.docx-page', '#mainBox', '.page-main-content'];
  for (const s of sels) res[s] = document.querySelectorAll(s).length;
  // scrollable containers
  res.scrollers = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 200 && e.clientHeight > 200).slice(0,10).map(e => (e.className||'').toString().slice(0,80) + '|' + e.scrollHeight + '/' + e.clientHeight);
  return res;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
