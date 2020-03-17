const puppeteer = require("puppeteer");
const configs = require("./config");
const fs = require("fs");

const { installMouseHelper } = require("./mouseHelper");
const {
  refreshCaptcha,
  clickXPath,
  scrollToTop,
  resolveImages
} = require("./helper");

let calcPosition;

let globoLoginUrl = "https://minhaconta.globo.com";
let paredaoUrl =
  "https://gshow.globo.com/realities/bbb/bbb20/votacao/paredao-bbb20-quem-voce-quer-eliminar-babu-pyong-ou-rafa-6bb86a70-ac24-48e7-bdb8-a6cd83009ef3.ghtml";
let challengeUrl = "https://captcha.globo.com/api/challenge/generate";
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--window-size=200,600"]
  });

  const page = await browser.newPage();
  await installMouseHelper(page);
  await page.goto(globoLoginUrl, {
    waitUntil: "networkidle2"
  });

  await page.type("#login", configs.credentials.username);
  await page.type("#password", configs.credentials.password);
  await page.click("[class='button ng-scope']");
  await page.waitForNavigation();
  await page.goto(paredaoUrl, {
    waitUntil: "networkidle2"
  });

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
    let hookUrl = response.url();
    if (hookUrl.startsWith(challengeUrl)) {
      let res = await response.json();
      let { symbol, image } = res.data;
      if (symbol === "calculadora") {
        fs.writeFileSync("alo.png", image, "base64");
        calcPosition = await resolveImages();
        console.log(calcPosition);

        await setTimeout(async () => {
          console.log(calcPosition);
          if (!calcPosition) {
            await refreshCaptcha(page, configs.xpaths.buttonCaptcha);
          }
          let finalPosition = 100 + calcPosition[0] + 30 * 1.5;
          console.log(finalPosition, calcPosition);
          calcPosition = false;
          setTimeout(async () => {
            await page.mouse.click(finalPosition, 400);
          }, 500);
          setTimeout(async () => {
            await page
              .waitForXPath(configs.xpaths.finishText)
              .then(async () => {
                const retryBtn = await page.$x(configs.xpaths.finishButton);
                console.log(retryBtn);
                retryBtn[0].click();
                setTimeout(async () => {
                  retryBtn[0].click();
                  await page
                    .waitForXPath(configs.xpaths.user)
                    .then(async () => {
                      await clickXPath(page, configs.xpaths.user);
                    });
                  await scrollToTop(page);
                  setTimeout(async () => {
                    await clickXPath(page, configs.xpaths.user);
                  }, 1000);
                  await page
                    .waitForXPath(configs.xpaths.buttonCaptcha)
                    .then(async () => {
                      await refreshCaptcha(page, configs.xpaths.buttonCaptcha);
                    });
                }, 1000);
              });
          }, 3000);
        }, 2300);
      } else {
        await refreshCaptcha(page, configs.xpaths.buttonCaptcha);
      }
    }
  });
})();
