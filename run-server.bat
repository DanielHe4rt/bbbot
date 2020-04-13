SET /P voto= Digite sua opcao de voto [0 | 1 | 2]:
SET /P email= Digite seu email da grobo:
SET /P senha= Digite sua senha da grobo:

node src/index.js %voto% %email% %senha%