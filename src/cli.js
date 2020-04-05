'use strict';
require('dotenv/config');

const getVictim = victim => {

  if ( victim >= 0 && victim <= 2 )
  {
    return victim; 
  }

  throw new Error('candidato invalido, use 0 | 1 | 2');
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
  Utilize: node src/index.js [0 | 1 | 2] seu@email.com sua_senha
  Exemplo: node src/index.js 1 eduardo@gmail.com minhasenha123`
      .split('\n')
      .map(str => str.trim())
      .join('\n')
  );
  return null;
};
