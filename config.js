let credentials = {
  username: "email",
  password: "password"
};

let links = {
  challengeAccepted:
    "https://royale.globo.com/polls/6816223c-7508-4267-a9e2-dcce85edd7f2/votes",
  globoLoginUrl: "https://minhaconta.globo.com",
  paredaoUrl:
    "https://gshow.globo.com/realities/bbb/bbb20/votacao/paredao-bbb20-quem-voce-quer-eliminar-babu-pyong-ou-rafa-6bb86a70-ac24-48e7-bdb8-a6cd83009ef3.ghtml",
  challengeUrl: "https://captcha.globo.com/api/challenge/generate"
};

let xpaths = {
  user: "/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div",
  buttonCaptcha:
    "/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[3]/button",
  imgCaptcha:
    "/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[2]/div/div[2]/img",
  finishButton:
    "/html/body/div[2]/div[4]/div/div[3]/div/div/div[1]/div[2]/button",
  finishText:
    "/html/body/div[2]/div[4]/div/div[3]/div/div/div[1]/div[1]/div[1]/span[1]",
  topButtom: "/html/body/div[1]]"
};

module.exports = { credentials, xpaths, links };
