/** Script temporário: imprime o texto renderizado das telas indicadas. */

const BASE = 'http://localhost:3111';
const CDP = 'http://localhost:9222';

const ADMIN = {
  token: 'mock-token-admin-2',
  user: { id: 2, nome: 'Rodrigo Rocha Silva', email: 'admin@petshop.com', perfil: 'ADMIN' },
};
const CLIENTE = {
  token: 'mock-token-cliente-1',
  user: {
    id: 1,
    nome: 'Ana Beatriz Faustino',
    email: 'ana.cliente@petshop.com',
    perfil: 'CLIENTE',
    clienteId: 1,
  },
};

const ALVOS = [
  [CLIENTE, '/perfil/cartoes'],
  [CLIENTE, '/perfil/pets'],
  [CLIENTE, '/produtos/1'],
  [ADMIN, '/admin/trocas'],
  [ADMIN, '/admin/dominios'],
  [ADMIN, '/admin/analise'],
];

const espera = ms => new Promise(r => setTimeout(r, ms));

const main = async () => {
  const alvos = await (await fetch(`${CDP}/json/list`)).json();
  const pagina = alvos.find(a => a.type === 'page');
  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let id = 0;
  const pend = new Map();
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) {
      pend.get(m.id)(m);
      pend.delete(m.id);
    }
  });

  const enviar = (method, params = {}) => {
    id += 1;
    const meu = id;
    return new Promise(r => {
      pend.set(meu, r);
      ws.send(JSON.stringify({ id: meu, method, params }));
    });
  };

  const avaliar = async expression => {
    const r = await enviar('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return r.result?.result?.value;
  };

  await enviar('Page.enable');
  await enviar('Runtime.enable');

  let atual = null;

  for (const [sessao, rota] of ALVOS) {
    if (sessao !== atual) {
      await enviar('Page.navigate', { url: `${BASE}/` });
      await espera(1200);
      await avaliar(
        `localStorage.setItem('@petshop: accessToken', ${JSON.stringify(sessao.token)});
         localStorage.setItem('@petshop: user', ${JSON.stringify(JSON.stringify(sessao.user))});
         true`,
      );
      atual = sessao;
    }

    await enviar('Page.navigate', { url: `${BASE}${rota}` });
    // Espera generosa: alguns dados dependem de várias queries encadeadas.
    await espera(4000);

    const texto = await avaliar('document.body.innerText');
    console.log(`\n${'='.repeat(70)}\n${rota}\n${'='.repeat(70)}`);
    console.log(texto);
  }

  ws.close();
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
