'use strict';
require('dotenv/config');

const getVictim = name => {
  name = name.toLowerCase();
  switch (name) {
    case 'babu':
      return 0;
    case 'gabi':
      return 1;
    case 'thelma':
      return 2;
  }

  throw new Error('candidato invalido, use babu | gabi | thelma');
};

module.exports = () => {
  const victim = process.argv[2] || 'gabi';
  const email = process.argv[3] || process.env.EMAIL;
  const password = process.argv[4] || process.env.PASSWORD;

  if (email && password && victim) {
    return {
      victim: getVictim(victim),
      login: { email, password }
    };
  }

  console.log(
    `[❌] Erro: Comando invalido
  Utilize: node src/index.js [prior | manu | mari] seu@email.com sua_senha
  Exemplo: node src/index.js prior eduardo@gmail.com minhasenha123`
      .split('\n')
      .map(str => str.trim())
      .join('\n')
  );
  return null;
};
