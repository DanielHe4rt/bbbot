#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { installMouseHelper } = require('./mouseHelper');
const canvas = createCanvas(265, 53);
const ctx = canvas.getContext('2d');

let globoLoginUrl = 'https://minhaconta.globo.com';
let paredaoUrl =
  'https://gshow.globo.com/realities/bbb/bbb20/votacao/paredao-bbb20-quem-voce-quer-eliminar-babu-pyong-ou-rafa-6bb86a70-ac24-48e7-bdb8-a6cd83009ef3.ghtml';
let challengeUrl = 'https://captcha.globo.com/api/challenge/generate';
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=200,600']
  });

  const page = await browser.newPage();
  await installMouseHelper(page);
  await page.goto(globoLoginUrl);

  await page.type('#login', process.argv[2]);
  await page.type('#password', process.argv[3]);
  await page.click("[class='button ng-scope']");
  await page.waitForNavigation();
  await page.goto(paredaoUrl, {
    waitUntil: 'networkidle2'
  });

  let handles = await page.$x(
    '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div'
  );
  setTimeout(() => {
    console.log(handles[0], handles[1]);
    handles[0].click();
  }, 2000);

  await page
    .waitForXPath(
      '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[3]/button'
    )
    .then(async () => {
      let handler = await page.$x(
        '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[3]/button'
      );
      setTimeout(() => {
        handler[0].click();
      }, 1000);
    });
  await page
    .waitForXPath(
      '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[2]/div/div[2]/img'
    )
    .then(async () => {
      let handler = await page.$x(
        '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[2]/div/div[2]/img'
      );
      setTimeout(() => {
        handler[0].focus();
      }, 1000);
    });
  // Aqui começa a palhaçada dos hooks
  const isWhite = data => {
    return data[0] == 255 && data[1] == 255 && data[2] == 255 ? true : false;
  };

  const isColumnWhite = (ctx, height, x) => {
    for (let y = 0; y < height; y++) {
      let data = ctx.getImageData(x, y, 1, 1).data;
      if (!isWhite(data)) return false;
    }
    return true;
  };

  const isRowWhite = (ctx, width, y) => {
    for (let x = 0; x < width; x++) {
      let data = ctx.getImageData(x, y, 1, 1).data;
      if (!isWhite(data)) return false;
    }
    return true;
  };

  const checkImage = (canvas, ctx, width) => {
    let results = {
      white: 0,
      black: 0
    };
    for (let i = 0; i <= width; i++) {
      for (let y = 0; y <= 53; y++) {
        let data = ctx.getImageData(i, y, 1, 1).data;
        isWhite(data) ? results.white++ : results.black++;
      }
    }
    return results;
  };

  const findInflections = (ctx, width) => {
    let results = {
      highest: 0,
      lowest: 0
    };

    for (let y = 0; y < 53; y++) {
      if (!isRowWhite(ctx, width, y) && !results.highest) {
        results.highest = y;
      }
      if (!isRowWhite(ctx, width, y)) {
        results.lowest = y;
      }
    }

    return results;
  };

  const findLines = ctx => {
    let results = {
      first: 0,
      last: 0
    };
    for (let y = 0; y < 53; y++) {
      let data = ctx.getImageData(0, y, 1, 1).data;
      if (results.first === 0 && !isWhite(data)) {
        results.first = y;
      }
      if (!isWhite(data)) {
        results.last = y;
      }
    }

    return results;
  };
  page.on('response', async response => {
    let hookUrl = response.url();
    if (hookUrl.startsWith(challengeUrl)) {
      let res = await response.json();
      let { symbol, image } = res.data;
      if (symbol === 'calculadora') {
        let calcPosition;
        fs.writeFileSync('alo.png', image, 'base64');
        await loadImage('alo.png').then(img => {
          let w2 = img.width;
          let h2 = img.height;

          ctx.drawImage(img, 0, 0);
          let item = [];
          let items = [];
          let isLastColorWhite = true;

          for (let i = 0; i <= w2; i++) {
            let isColumnWhiteHolder = isColumnWhite(ctx, h2, i);
            if (!isColumnWhiteHolder && isLastColorWhite) {
              item.push(i);
            }
            if (isColumnWhiteHolder && !isLastColorWhite) {
              item.push(i);
              items.push(item);
              item = [];
            }
            isLastColorWhite = isColumnWhiteHolder;
          }
          items.forEach((item, index) => {
            let width = item[1] - item[0];
            let newCanvas = createCanvas(width, 53);
            let newCtx = newCanvas.getContext('2d');
            newCtx.drawImage(img, item[0], 0, width, 53, 0, 0, width, 53);
            let lines = findLines(newCtx, 53);
            let inflections = findInflections(newCtx, width);
            let data = {
              color: checkImage(newCanvas, newCtx, width),
              lines: findLines(newCtx, 53),
              inflections: findInflections(newCtx, width),
              diffHigh: lines.first - inflections.highest,
              diffLow: inflections.lowest - lines.last
            };
            if (
              (data.diffHigh == 6 || data.diffHigh == 7) &&
              data.diffLow >= 4 &&
              data.diffLow <= 9 &&
              data.color.black >= 1150 &&
              data.color.black <= 1265
            ) {
              calcPosition = item;
            } else {
            }
          });
        });

        setTimeout(async () => {
          let finalPosition = 100 + calcPosition[0] + 30 * 1.5;
          setTimeout(async () => {
            // TODO: Falta fazer o 'votar novamente'.
            await page.mouse.click(finalPosition, 400);
          }, 500);
        }, 1000);
      } else {
        let handler = await page.$x(
          '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[3]/button'
        );
        setTimeout(() => {
          handler[0].click();
        }, 10);
      }
    }
  });
})();
