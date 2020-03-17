let credentials = {
  username: "email",
  password: "password"
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

module.exports = { credentials, xpaths };
