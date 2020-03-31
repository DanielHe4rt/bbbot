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
    'https://gshow.globo.com/realities/bbb/bbb20/votacao/paredao-bbb20-quem-voce-quer-eliminar-felipe-manu-ou-mari-a9f49f90-84e2-4c12-a9af-b262e2dd5be4.ghtml',
  challengeUrl: 'https://captcha.globo.com/api/challenge/generate',
  challengeAcceptedUrl:
    'https://royale.globo.com/polls/8e81660d-89b5-4777-a324-6f2da878c5c7',
  mainApi: 'http://bots.heartdevs.com/'
};

const XPathContents = {
  email:
    '/html/body/div[1]/main/div[2]/div/div/div/div[2]/div[1]/form/div[1]/input',
  password:
    '/html/body/div[1]/main/div[2]/div/div/div/div[2]/div[1]/form/div[3]/div[1]/input',
  loginBtn:
    '/html/body/div[1]/main/div[2]/div/div/div/div[2]/div[1]/form/div[6]/button',
  revoteBtn: '/html/body/div[1]/div[4]/div/div[3]/div/div/div[1]/div[2]/button',
  captchaImage:
    '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div[2]/div/div/div[2]/div/div[2]/img'
};

const users = [
  '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[1]/div',
  '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[2]/div',
  '/html/body/div[2]/div[4]/div/div[1]/div[4]/div[3]/div'
];

/* 
  PRIOR = 0
  MANU = 1 
  MARI = 2
*/

module.exports = {
  links,
  XPathContents,
  logoAscii,
  users
};
