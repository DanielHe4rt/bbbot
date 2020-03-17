const configs = require('./config');

const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(265, 53);
const ctx = canvas.getContext('2d');
const isColumnWhite = (ctx, height, x) => {
  for (let y = 0; y < height; y++) {
    let data = ctx.getImageData(x, y, 1, 1).data;
    if (!isWhite(data)) return false;
  }
  return true;
};

const resolveImages = async () => {
  return await loadImage('alo.png').then(async img => {
    let result = false;
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
        result = item;
      }
    });
    return result;
  });
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

const isWhite = data => {
  return data[0] == 255 && data[1] == 255 && data[2] == 255 ? true : false;
};

const refreshCaptcha = async (page, xpath) => {
  let handler = await page.$x(xpath);
  setTimeout(() => {
    handler[0].click();
  }, 10);
};

const clickXPath = async (page, xpath) => {
  let handler = await page.$x(xpath);
  setTimeout(() => {
    handler[0].click();
  }, 1000);
};

const removeSponsor = async page => {
  await page.evaluate(_ => {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML =
      '.tag-manager-publicidade-container { display: none; !important}';
    document.getElementsByTagName('head')[0].appendChild(style);
  });
};

const scrollToTop = async page => {
  await page.evaluate(_ => {
    window.scrollBy(0, -10000);
  });
};

const revote = async page => {
  setTimeout(async () => {
    await page.waitForXPath(configs.xpaths.finishText).then(async () => {
      const retryBtn = await page.$x(configs.xpaths.finishButton);
      // retryBtn[0].click();
      setTimeout(async () => {
        retryBtn[0].click();
      }, 500);
      setTimeout(async () => {
        await scrollToTop(page);
        setTimeout(async () => {
          await clickXPath(page, configs.xpaths.user);
        }, 1000);
        setTimeout(async () => {
          await clickXPath(page, configs.xpaths.user);
          const refreshBtn = await page.waitForXPath(
            configs.xpaths.buttonCaptcha
          );
          refreshBtn.click();
          setTimeout(() => {
            refreshBtn.click();
            scrollToTop(page);
          }, 200);
        }, 1000);
      }, 750);
    });
  }, 3000);
};

module.exports = {
  resolveImages,
  refreshCaptcha,
  clickXPath,
  scrollToTop,
  revote,
  removeSponsor
};
