SET /P email= Digite seu email da grobo: 
SET /P senha= Digite sua senha da grobo: 

SET /P voto= Seu voto é no(a): 
node src/index.js %voto% %email% %senha% 