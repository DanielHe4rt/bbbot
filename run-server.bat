$email = Read-Host -Prompt 'Digite seu email da grobo'
$senha = Read-Host -Prompt 'Digite sua senha da grobo'

SET /P email= Digite seu email da grobo: 
SET /P senha= Digite sua senha da grobo: 

node index.js %email% %senha%