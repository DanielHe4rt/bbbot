SET /P email= Digite seu email da grobo: 
SET /P senha= Digite sua senha da grobo: 
echo "prior | manu | mari"
SET /P voto= Escolha sua vitima: 

node src/index.js %voto% %email% %senha% 