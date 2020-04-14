const { links, XPathContents, logoAscii, users } = require("./config/contents");
const { getShitDone } = require("./bbb-filter");
const fs = require("fs");
const axios = require("axios");
const instance = axios.create({
  baseURL: links.mainApi,
});

let availableImages = [];

const fsExtra = require("fs-extra");

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const runLogin = (auth, fix) => async (page) => {
  await page.goto(links.loginUrl);

  const emailField = await page.waitForXPath(XPathContents.email);
  const passField = await page.waitForXPath(XPathContents.password);
  await emailField.type(auth.email);
  await passField.type(auth.password);

  const loginBtn = await page.waitForXPath(XPathContents.loginBtn);
  await loginBtn.click();

  if (fix == "yes") {
    await page.waitForNavigation();
  } else {
    await page.waitForNavigation({ waitUntil: "networkidle0" });
  }

  await page.goto(links.voteUrl);

  removeCss(page);
};

const configs = async () => {
  // let config = await instance.get("/config");
  // results = config.data.results;
  availableImages = JSON.parse(fs.readFileSync("results.json"));
};

const removeCss = async (page) => {
  let css = `* {
    --animarion-duration: 0s !important;
    animation-duration: 0s !important;
    transition-duration: 0s !important;
    opacity: 1 !important;
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
  }
  .tag-manager-publicidade-container, .tag-manager-publicidade-container--carregado tag-manager-publicidade-container--visivel {
    display: none !important;
  }
  .tag-manager-publicidade-container--visivel div { 
    display: none !important;
  }
  `;
  await page.$eval("#banner_votacao1", (e) => {
    var me = $("#banner_votacao1");
    var newMe = $(
      '<img style="width: 100%;" src="https://i.imgur.com/4XShvht.gif">'
    );
    newMe.html(me.html());
    me.replaceWith(newMe);
  });
  await page.addStyleTag({ content: css });
};

const isWhite = (pixel) => pixel >= 250;
const isBlack = (pixel) => pixel <= 10;
const isGrey = (pixel) => pixel > 10 && pixel < 250;

const checkImage = ({ width, height, lines }) => {
  let results = {
    white: 0,
    grey: 0,
    black: 0,
    width,
    height,
  };
  for (let i = 0; i < width; i++) {
    for (let y = 0; y < height; y++) {
      const pixel = lines[y][i];
      if (isGrey(pixel)) {
        results.grey++;
      } else if (isBlack(pixel)) {
        results.black++;
      } else if (isWhite(pixel)) {
        results.white++;
      }
    }
  }
  return results;
};

const vote = (victim) => async (page) => {
  const userCard = await page.waitForXPath(users[victim]);
  await userCard.click();
};

const revote = (victim) => async (page) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const retryBtn = await page.waitForXPath(XPathContents.revoteBtn);

  await retryBtn.click();

  await new Promise((resolve) => setTimeout(resolve, 400));
  vote(victim)(page);
};

const cleanFiles = () => {
  for (let i = 0; i < 5; i++) {
    fsExtra.emptyDirSync("images/filtered/", (err) => {
      console.log(err);
    });
    fsExtra.emptyDirSync("images/chunked/", (err) => {
      console.log(err);
    });
    fsExtra.emptyDirSync("images/captchas/", (err) => {
      console.log(err);
    });
  }
  //file removed
};

const CAPTCHA_SELECTOR =
  "#roulette-root div > div > div > div > img:nth-child(1)";
const getBoundingClientRect = (page, selector) =>
  page.$eval(selector, (el) => {
    const position = el.getBoundingClientRect();
    return [position.top, position.left];
  });
const selectCaptcha = async (page, index) => {
  const [top, left] = await getBoundingClientRect(page, CAPTCHA_SELECTOR);
  await page.mouse.click(index * 53 + left + 25, top + 25);
};

const RESET_CAPTCHA =
  "#roulette-root div > div > div > div button:nth-child(1)";
const resetCaptcha = async (page) => {
  const [top, left] = await getBoundingClientRect(page, RESET_CAPTCHA);
  await page.mouse.click(left + 50, top + 10);
};

const fetchSymbolData = async (symbol) => {
  try {
    symbol = symbol
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(" ", "-");
    let response = await instance.get("/symbols/" + symbol);
    return response.data;
  } catch (e) {
    console.log(e.response.data);
  }
};
const challengePage = async (page, response, setToSave, mode) => {
  let { data } = await response.json();
  let { symbol, image } = data;
  let mainSymbol = (await fetchSymbolData(symbol)) || [];

  cleanFiles();
  const imageName = `images/captchas/${symbol}-${
    Math.floor(Math.random() * 8888888) + 99999
  }.png`;
  fs.writeFileSync(imageName, image, "base64");
  const resultImages = await getShitDone(imageName);

  const results = resultImages.map(checkImage);

  if (true) {
    (async () => {
      const offsetX = await page
        .evaluate(
          async () =>
            new Promise((resolve) => {
              window.document.onclick = (el) =>
                el.target instanceof HTMLImageElement
                  ? resolve(el.offsetX)
                  : reject("não foi dessa vez");
            })
        )
        .catch(console.error);
      console.log(offsetX);
      if (offsetX && results.length === 5) {
        const index = parseInt(offsetX / 52);
        console.log("index", index);
        setToSave({
          key: symbol,
          value: { ...results[index], imageName },
        });
      }
    })();
    if (mainSymbol.length === 0) {
      return false;
    }
  }

  if (mainSymbol.length === 1 && mainSymbol[1] === "no existe") {
    return resetCaptcha(page);
  }

  const scoreFiltered = results
    .map((result) => ({
      ...result,
      scores: mainSymbol.map((available) => ({
        grey: Math.abs(available.grey - result.grey),
        black: Math.abs(available.black - result.black),
        size: Math.abs(
          available.width + available.height - result.width - result.height
        ),
        width: Math.abs(available.width - result.width),
        height: Math.abs(available.height - result.height),
      })),
    }))
    .map((result) => ({
      ...result,
      score: result.scores
        .map(({ grey, black, width, height }) => grey + black + width + height)
        .sort()[0],
    }));

  const [bestBet, index] = scoreFiltered
    .slice()
    .map((el, i) => [el, i])
    .sort(([a], [b]) => a.score - b.score)[0];

  console.log("Symbol", symbol);
  console.log(mode);
  if (mode === "training") {
    if (bestBet.score === undefined) {
      console.log("Periodo de testes: figura não encontrada");
      console.log("Vote manualmente para próximo reconhecimento");
      return false;
    } else {
      if (bestBet.score > 100) {
        console.log("Chute de posição:", index + 1, bestBet.score);
      } else {
        console.log("Posição mais provável:", index + 1, bestBet.score);
      }
    }
    console.log("Modo treino ativado. Selecione uma opção para continuar.");
  } else {
    if (bestBet.score === undefined) {
      console.log("Periodo de testes: figura não encontrada");
      console.log("Vote manualmente para próximo reconhecimento");
      return resetCaptcha(page);
    }
    return selectCaptcha(page, index);
  }
};
const challengeAcceptedPage = (victim) => async (
  _page,
  response,
  toSave,
  setToSave
) => {
  let status = response.status();

  if (parseInt(status) === 200) {
    revote(victim)(_page);
    if (toSave) {
      try {
        const res = await instance.post("/vote", {
          success: true,
          data: toSave.value,
          image: toSave.key,
        });
        console.log("votou");

        const { localVotes, totalVotes } = res.data;
        console.clear();
        console.log("\x1b[35m", logoAscii);
        console.log(
          "\x1b[32m",
          `
    [✅] TOTAIS DE VOTOS: ${totalVotes}
    [✅] VOTOS COMPUTADOS: ${localVotes}
        `
        );
      } catch (e) {
        console.log(e.response.data);
      }
    }
  } else {
    console.clear();
    console.log("\x1b[35m", logoAscii);
    console.log(
      "\x1b[31m",
      `
    [❌] VOTO NÃO COMPUTADO!
    `
    );
  }

  setToSave(null);
};
const listenEvents = (victim) => async (page, browser, mode) => {
  let toSave = null;
  const setToSave = (toSaveData) => {
    toSave = toSaveData;
  };

  await timeout(500);

  browser.on("targetcreated", async (target) => {
    const { type } = target._targetInfo;
    const newPage = await target.page();

    if (type !== "page") return;
    console.log("Fechando página com propaganda.");
    await newPage.close();
  });

  page.on("response", async (response) => {
    let hookUrl = response.url();
    let request = response.request();

    if (hookUrl.startsWith(links.voteUrl)) {
      vote(victim)(page);
    }
    if (
      hookUrl.startsWith(links.challengeAcceptedUrl) &&
      request.method() === "POST"
    ) {
      console.log(toSave);
      challengeAcceptedPage(victim)(page, response, toSave, setToSave);
    }

    if (hookUrl.startsWith(links.challengeUrl)) {
      challengePage(page, response, setToSave, mode);
    }
  });
};

module.exports = ({ victim, login }) => ({
  runLogin: runLogin(login),
  vote: vote(victim),
  listenEvents: listenEvents(victim),
  configs,
  fetchSymbolData,
});
