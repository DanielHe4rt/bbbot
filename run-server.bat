SET /P email= Digite seu email da grobo: 
SET /P senha= Digite sua senha da grobo: 

SET /P voto= Digite sua senha da grobo [prior | manu | mari]: 
node src/index.js %voto% %email% %senha% 