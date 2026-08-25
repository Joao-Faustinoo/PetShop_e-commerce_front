/**
 * Script temporário de verificação: dirige o Chrome via CDP, injeta a
 * sessão mockada no localStorage e coleta o texto renderizado de cada
 * tela, além dos erros de console. Não faz parte do sistema.
 */

const BASE = 'http://localhost:3111';
const CDP = 'http://localhost:9222';

const USUARIOS = {
  CLIENTE: {
    token: 'mock-token-cliente-1',
    user: {
      id: 1,
      nome: 'Ana Beatriz Faustino',
      email: 'ana.cliente@petshop.com',
      perfil: 'CLIENTE',
      clienteId: 1,
    },
  },
  ADMIN: {
    token: 'mock-token-admin-2',
    user: {
      id: 2,
      nome: 'Rodrigo Rocha Silva',
      email: 'admin@petshop.com',
      perfil: 'ADMIN',
    },
  },
};

const ROTAS = [
  ['CLIENTE', '/produtos'],
  ['CLIENTE', '/produtos/1'],
  ['CLIENTE', '/carrinho'],
  ['CLIENTE', '/checkout'],
  ['CLIENTE', '/meus-pedidos'],
  ['CLIENTE', '/meus-pedidos/9'],
  ['CLIENTE', '/perfil'],
  ['CLIENTE', '/perfil/pets'],
  ['CLIENTE', '/perfil/enderecos'],
  ['CLIENTE', '/perfil/cartoes'],
  ['CLIENTE', '/perfil/cupons'],
  ['CLIENTE', '/assistente'],
  ['ADMIN', '/admin/pedidos'],
  ['ADMIN', '/admin/produtos'],
  ['ADMIN', '/admin/produtos/novo'],
  ['ADMIN', '/admin/produtos/1'],
  ['ADMIN', '/admin/estoque'],
  ['ADMIN', '/admin/trocas'],
  ['ADMIN', '/admin/clientes'],
  ['ADMIN', '/admin/clientes/1'],
  ['ADMIN', '/admin/analise'],
  ['ADMIN', '/admin/dominios'],
];

const espera = ms => new Promise(r => setTimeout(r, ms));

class Sessao {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pendentes = new Map();
    this.erros = [];

    ws.addEventListener('message', evento => {
      const msg = JSON.parse(evento.data);

      if (msg.id && this.pendentes.has(msg.id)) {
        this.pendentes.get(msg.id)(msg);
        this.pendentes.delete(msg.id);
      }

      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        this.erros.push(msg.params.args.map(a => a.value ?? a.description).join(' '));
      }

      if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        this.erros.push(d.exception?.description ?? d.text);
      }
    });
  }

  enviar(method, params = {}) {
    this.id += 1;
    const id = this.id;

    return new Promise(resolve => {
      this.pendentes.set(id, resolve);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async avaliar(expression) {
    const r = await this.enviar('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });

    return r.result?.result?.value;
  }
}

const main = async () => {
  const alvos = await (await fetch(`${CDP}/json/list`)).json();
  const pagina = alvos.find(a => a.type === 'page');

  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  const s = new Sessao(ws);
  await s.enviar('Page.enable');
  await s.enviar('Runtime.enable');

  let perfilAtual = null;
  const resultados = [];

  for (const [perfil, rota] of ROTAS) {
    if (perfil !== perfilAtual) {
      // Precisa estar na origem certa para gravar no localStorage.
      await s.enviar('Page.navigate', { url: `${BASE}/` });
      await espera(1200);

      const { token, user } = USUARIOS[perfil];
      await s.avaliar(
        `localStorage.setItem('@petshop: accessToken', ${JSON.stringify(token)});
         localStorage.setItem('@petshop: user', ${JSON.stringify(JSON.stringify(user))});
         true`,
      );
      perfilAtual = perfil;
    }

    s.erros.length = 0;
    await s.enviar('Page.navigate', { url: `${BASE}${rota}` });
    await espera(2500);

    const texto = await s.avaliar('document.body.innerText.replace(/\\s+/g, " ").trim()');
    const url = await s.avaliar('location.pathname');

    resultados.push({
      perfil,
      rota,
      urlFinal: url,
      chars: (texto ?? '').length,
      amostra: (texto ?? '').slice(0, 110),
      erros: [...new Set(s.erros)].slice(0, 2),
    });
  }

  for (const r of resultados) {
    const redirecionou = r.urlFinal !== r.rota ? ` -> ${r.urlFinal}` : '';
    const status = r.chars > 120 && r.erros.length === 0 ? 'OK ' : 'FALHA';
    console.log(`${status} [${r.perfil}] ${r.rota}${redirecionou} (${r.chars} chars)`);
    if (r.chars <= 120) console.log(`      vazio: "${r.amostra}"`);
    r.erros.forEach(e => console.log(`      ERRO: ${String(e).slice(0, 160)}`));
  }

  ws.close();
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
