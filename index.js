if (process.argv.length < 4) {
  console.log("Como usar: node index.js usuario@usuario.com senha");
  return false;
}

const puppeteer = require("puppeteer");
const configs = require("./config");
const fs = require("fs");
let voteCounter = 0;

const { installMouseHelper } = require("./mouseHelper");
const {
  refreshCaptcha,
  clickXPath,
  scrollToTop,
  resolveImages,
  revote,
  removeSponsor
} = require("./helper");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--window-size=200,1000"] 
  });

  const [ page ] = await browser.pages();
  await installMouseHelper(page);
  await page.goto(configs.links.globoLoginUrl, {
    waitUntil: "networkidle2"
  });

  try {
    const visibleInput = await page.waitForSelector('.ng-pristine ng-invalid ng-invalid-required', {visible: true, timeout: 3000 })
    console.log('Encontrado elemento visivel')
  } catch (e) {
    console.log('Não foi possivel encontrar o elemento visivel, output: ', e.message)
  }

  if (process.argv[4] === "login") {
    await page.waitForNavigation();
  }

  await page.type("#login", process.argv[2]);
  await page.type("#password", process.argv[3]);
  await page.click("[class='button ng-scope']");
  await page.waitForNavigation();
  await page.goto(configs.links.paredaoUrl, {
    waitUntil: "networkidle2"
  });

  await removeSponsor(page);

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

  page.on("response", async response => {
    let calcPosition;
    let hookUrl = response.url();
    let request = response.request();
    let status = response.status();
    if (
      hookUrl.startsWith(configs.links.challengeAccepted) &&
      parseInt(response.status()) === 200 &&
      request.method() === "POST"
    ) {
      voteCounter++;
      console.log("Votos computados: " + voteCounter);
      await revote(page);
    }
    if (
      hookUrl.startsWith(configs.links.challengeAccepted) &&
      parseInt(response.status()) >= 403 &&
      request.method() === "POST"
    ) {
      console.log("Voto não computado =/");

      await page.waitForXPath(configs.xpaths.buttonCaptcha).then(async () => {
        await clickXPath(page, configs.xpaths.buttonCaptcha);
      });
    }

    if (hookUrl.startsWith(configs.links.challengeUrl)) {
      let res = await response.json();
      let { symbol, image } = res.data;
      if (symbol === "calculadora") {
        fs.writeFileSync("alo.png", image, "base64");
        calcPosition = await resolveImages();
        await setTimeout(async () => {
          if (!calcPosition) {
            await refreshCaptcha(page, configs.xpaths.buttonCaptcha);
            return false;
          }
          let finalPosition = 100 + calcPosition[0] + 30 * 1.5;
          calcPosition = false;
          await scrollToTop(page);
          await page.mouse.move(finalPosition, 555);
          setTimeout(async () => {
            await page.mouse.click(finalPosition, 550);
          }, 1000);
        }, 2300);
      } else {
        await refreshCaptcha(page, configs.xpaths.buttonCaptcha);
      }
    }
  });
})();
