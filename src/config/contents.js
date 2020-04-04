const logoAscii = `
\`-+syhhys+:\`     ./syhhhs:         
/hmmmmmmmmmd+  \`:ymmmmmmy-          
smmmmmdhhddo. \`/hmmmmmds-     \`:.    
/mmmmms.  .. \`+hmmmmmdo.     \`:ymy    
+mmmmm/    .+dmmmmmdo.     \`/hmmmh    
.dmmmmdo-.odmmmmmh+. .+s-.+hmmmmm/    
-ymmmmmddmmmmmh/\` .odmmmdmmmmmd/     
\`:ymmmmmmmmh/\`   .smmmmmmmmh+.      
  \`:ymmmmy:\`     .smmmmmmh/\`        
     -sy:\`     -sdmmmmmh/\`          
             -ymmmmmmy:\`            
           -ymmmmmmy-               
           \`+dmmms-                 
             \`+s.    
        HE4RT DEVELOPERS
        DISCORD.IO/HE4RT      
`;

const links = {
  loginUrl: 'https://minhaconta.globo.com',
  voteUrl:
    'https://gshow.globo.com/realities/bbb/bbb20/votacao/paredao-bbb20-quem-voce-quer-eliminar-babu-gabi-ou-thelma-305135b8-b442-4cc8-888f-2a01ed79cc2d.ghtml',
  challengeUrl: 'https://captcha.globo.com/api/challenge/generate',
  challengeAcceptedUrl:
    'https://royale.globo.com/polls/d4846f06-6560-4991-a1a8-934a037bc1f3',
  mainApi: 'http://bots.heartdevs.com/'
};

const XPathContents = {
  email:
    '/html/body/div[1]/main/div[2]/div/div/div/div[2]/div[1]/form/div[1]/input',
  password:
    '/html/body/div[1]/main/div[2]/div/div/div/div[2]/div[1]/form/div[3]/div[1]/input',
  loginBtn:
    '/html/body/div[1]/main/div[2]/div/div/div/div[2]/div[1]/form/div[6]/button',
  revoteBtn: '/html/body/div[2]/div[4]/div/div[3]/div/div/div[1]/div[2]/button',
  captchaImage:
    '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[2]/div/div[2]/img'
};

const users = [
  '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[1]/div',
  '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div',
  '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[3]/div'
];

/* 
  BABU = 0
  GABI = 1 
  THELMA = 2
*/

module.exports = {
  links,
  XPathContents,
  logoAscii,
  users
};
