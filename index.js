const puppeteer = require('puppeteer');
const configs = require('./config');
const fs = require('fs');

const { installMouseHelper } = require('./mouseHelper');
const {
  refreshCaptcha,
  clickXPath,
  scrollToTop,
  resolveImages,
  revote,
  removeSponsor
} = require('./helper');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=200,1000']
  });

  const page = await browser.newPage();
  await installMouseHelper(page);
  await page.goto(configs.links.globoLoginUrl, {
    waitUntil: 'networkidle2'
  });
  await page.waitForNavigation();

  await page.type('#login', configs.credentials.username);
  await page.type('#password', configs.credentials.password);
  await page.click("[class='button ng-scope']");
  await page.waitForNavigation();
  await page.goto(configs.links.paredaoUrl, {
    waitUntil: 'networkidle2'
  });

  removeSponsor(page);

  await page.waitForXPath(configs.xpaths.user).then(async () => {
    await clickXPath(page, configs.xpaths.user);
  });

  await page.waitForXPath(configs.xpaths.buttonCaptcha).then(async () => {
    await clickXPath(page, configs.xpaths.buttonCaptcha);
  });
  await page.waitForXPath(configs.xpaths.imgCaptcha).then(async () => {
    let handler = await page.$x(configs.xpaths.imgCaptcha);
    setTimeout(() => {
      handler[0].focus();
    }, 1000);
  });
  // Aqui começa a palhaçada dos hooks

  page.on('response', async response => {
    let calcPosition;
    let hookUrl = response.url();
    let request = response.request();
    let status = response.status();
    if (hookUrl.startsWith(configs.links.challengeUrl)) {
      let res = await response.json();
      let { symbol, image } = res.data;
      if (symbol === 'calculadora') {
        fs.writeFileSync('alo.png', image, 'base64');
        calcPosition = await resolveImages();
        await setTimeout(async () => {
          if (!calcPosition) {
            await refreshCaptcha(page, configs.xpaths.buttonCaptcha);
            return false;
          }
          let finalPosition = 100 + calcPosition[0] + 30 * 1.5;
          console.log('position', finalPosition, calcPosition);
          calcPosition = false;
          setTimeout(async () => {
            await scrollToTop(page);
            await page.mouse.click(finalPosition, 560);
          }, 500);
          revote(page);
        }, 2300);
      } else {
        await refreshCaptcha(page, configs.xpaths.buttonCaptcha);
      }
    }
    if (
      hookUrl.startsWith(configs.links.challengeAccepted) &&
      parseInt(response.status()) === 200 &&
      request.method() === 'POST'
    ) {
      console.log('deu bom');
    }
  });
})();
