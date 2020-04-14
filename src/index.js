"use strict";

const puppeteer = require("puppeteer");
const { logoAscii } = require("./config/contents");
const createPages = require("./util");
const parameters = require("./cli")();
if (!parameters) {
  return;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--window-size=200,1000"],
  });

  const page = await browser.newPage();

  // console.log('\x1b[35m', logoAscii);

  const { runLogin, vote, listenEvents } = createPages(parameters);
  runLogin(page, parameters.fix);
  vote(page);

  listenEvents(page, browser, parameters.mode);
})();
