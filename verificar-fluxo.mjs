/**
 * Script temporário: dirige a UI real no Chrome e percorre o fluxo de
 * compra do cliente, conferindo as regras de negócio pelo que aparece na
 * tela. Não faz parte do sistema.
 *
 * Importante: os mocks vivem em memória no browser, então um reload
 * zera o estado. A navegação daqui é feita clicando nos links da própria
 * aplicação (SPA), preservando carrinho, estoque e pedidos.
 */

const BASE = 'http://localhost:3111';
const CDP = 'http://localhost:9222';

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

const espera = ms => new Promise(r => setTimeout(r, ms));

let passou = 0;
let falhou = 0;

const checar = (descricao, condicao, detalhe = '') => {
  if (condicao) {
    passou += 1;
    console.log(`  OK    ${descricao}`);
  } else {
    falhou += 1;
    console.log(`  FALHA ${descricao}${detalhe ? `\n        ${detalhe}` : ''}`);
  }
};

const main = async () => {
  const alvos = await (await fetch(`${CDP}/json/list`)).json();
  const ws = new WebSocket(alvos.find(a => a.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let id = 0;
  const pend = new Map();
  const excecoes = [];

  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) {
      pend.get(m.id)(m);
      pend.delete(m.id);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      excecoes.push(m.params.exceptionDetails.exception?.description ?? '');
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

  const texto = () => avaliar('document.body.innerText');
  const rota = () => avaliar('location.pathname');

  /** Clica no primeiro elemento habilitado cujo texto contenha o alvo. */
  const clicar = async (alvo, msEspera = 1400) => {
    const ok = await avaliar(`(() => {
      const alvo = ${JSON.stringify(alvo)};
      const nos = [...document.querySelectorAll('button, a')];
      const el = nos.find(n => n.innerText.trim().includes(alvo) && !n.disabled);
      if (!el) return false;
      el.click();
      return true;
    })()`);
    await espera(msEspera);
    return ok;
  };

  const habilitado = alvo =>
    avaliar(`(() => {
      const el = [...document.querySelectorAll('button')].find(b =>
        b.innerText.trim().includes(${JSON.stringify(alvo)}));
      return el ? !el.disabled : null;
    })()`);

  // Sessão do cliente: um único carregamento, o resto é navegação SPA.
  await enviar('Page.navigate', { url: `${BASE}/` });
  await espera(1500);
  await avaliar(
    `localStorage.setItem('@petshop: accessToken', ${JSON.stringify(CLIENTE.token)});
     localStorage.setItem('@petshop: user', ${JSON.stringify(JSON.stringify(CLIENTE.user))});
     true`,
  );
  await enviar('Page.navigate', { url: `${BASE}/produtos` });
  await espera(3000);

  console.log('\n--- Catálogo e detalhe do produto (RF0015, RN0031) ---');

  const catalogo = await texto();
  checar('RF0015: catálogo lista os produtos ativos', /produto\(s\) encontrado/.test(catalogo));

  // RN0031: produto sem estoque não pode ir ao carrinho.
  await clicar('Gravata Borboleta Pet', 2200);
  const semEstoque = await texto();
  checar('RN0031: produto zerado avisa que está sem estoque', /sem estoque/i.test(semEstoque));
  checar(
    'RN0031: botão de adicionar fica desabilitado sem saldo',
    (await habilitado('Adicionar ao carrinho')) === false,
  );

  console.log('\n--- Carrinho e bloqueio de itens (RF0031, RN0044, RNF0042) ---');

  await clicar('Carrinho', 2200);
  let carrinho = await texto();
  checar('RN0044: carrinho exibe o prazo de reserva', /reservados por mais/i.test(carrinho));
  checar(
    'RNF0042: itens expirados aparecem em bloco próprio',
    /Itens removidos por expiração/i.test(carrinho),
  );
  checar(
    'RNF0042: com item expirado, finalizar a compra fica bloqueado',
    (await habilitado('Finalizar compra')) === false,
  );

  // Devolve o item expirado ao carrinho, o que destrava a compra.
  await clicar('Adicionar de novo', 2000);
  checar(
    'RNF0042: readicionar o item expirado libera a compra',
    (await habilitado('Finalizar compra')) === true,
  );

  // Esvazia o carrinho para partir de um total conhecido.
  for (let i = 0; i < 6; i += 1) {
    const removeu = await avaliar(`(() => {
      const b = document.querySelector('button[aria-label^="Remover"]');
      if (!b) return false; b.click(); return true;
    })()`);
    if (!removeu) break;
    await espera(1100);
  }
  carrinho = await texto();
  checar('RF0031: itens podem ser removidos do carrinho', /carrinho está vazio/i.test(carrinho));

  console.log('\n--- Compra com cupons (RF0033-RF0038, RN0033-RN0036) ---');

  // Bandana Pet Xadrez custa R$ 12,00: os cupons cobrem o total e sobra troco.
  await clicar('Ir para o catálogo', 2200);
  await clicar('Bandana Pet Xadrez', 2200);

  const estoqueAntes = Number((await texto()).match(/(\d+) em estoque/)?.[1] ?? 0);
  checar('RF0015: detalhe do produto mostra o saldo em estoque', estoqueAntes > 0);

  await clicar('Adicionar ao carrinho', 1800);
  await clicar('Carrinho', 2200);
  checar(
    'RF0031: produto adicionado aparece no carrinho',
    /Bandana Pet Xadrez/.test(await texto()),
  );

  await clicar('Finalizar compra', 3000);
  checar('Checkout alcançado a partir do carrinho', (await rota()) === '/checkout');

  let checkout = await texto();
  checar('RF0035: checkout lista os endereços de entrega', /Casa/.test(checkout));
  checar('RF0034: frete calculado para o endereço escolhido', /Frete[\s\S]{0,60}R\$/.test(checkout));

  // RN0033: o segundo cupom promocional tem de ser recusado.
  await clicar('BEMVINDO10', 1600);
  await clicar('PETLOVER25', 1800);
  checkout = await texto();
  const promocionais = (checkout.match(/\(promocional\)/g) ?? []).length;
  checar(
    'RN0033: apenas um cupom promocional por compra',
    promocionais === 1,
    `promocionais aplicados: ${promocionais}`,
  );

  // RN0035/RN0036: cupom de troca cobre o restante e a sobra vira troco.
  await clicar('TROCA-A20', 2000);
  checkout = await texto();

  checar(
    'RN0035: cupons cobrem o total e dispensam o cartão',
    /não é necessário informar cartão/i.test(checkout),
    checkout.slice(checkout.indexOf('Pagamento no cartão'), checkout.indexOf('Pagamento no cartão') + 160),
  );
  checar(
    'RN0036: excedente dos cupons é sinalizado como cupom de troco',
    /Sobra de/i.test(checkout),
  );

  checar(
    'RF0038: finalizar habilita com o total coberto',
    (await habilitado('Finalizar compra')) === true,
  );
  await clicar('Finalizar compra', 5000);

  const sucesso = await texto();
  checar('RF0038: compra leva à tela de sucesso', (await rota()) === '/checkout/sucesso', await rota());
  checar('RF0038: pedido criado com número', /PED-\d{4}/.test(sucesso), sucesso.slice(0, 120));
  checar('RN0038: status do pedido exibido após a validação', /Aprovada|Em processamento/i.test(sucesso));
  checar(
    'RN0036: cupom de troco gerado e informado ao cliente',
    /TROCA-\w+/.test(sucesso) && /cupom/i.test(sucesso),
  );

  // RF0053/RN0028: baixa em estoque só após a compra ser efetivada.
  await clicar('Continuar comprando', 2500);
  await clicar('Bandana Pet Xadrez', 2500);
  const estoqueDepois = Number((await texto()).match(/(\d+) em estoque/)?.[1] ?? -1);
  checar(
    `RF0053/RN0028: estoque baixado após a compra (${estoqueAntes} -> ${estoqueAntes - 1})`,
    estoqueDepois === estoqueAntes - 1,
    `estoque agora: ${estoqueDepois}`,
  );

  console.log('\n--- Pedido e troca do cliente (RF0025, RN0043) ---');

  await clicar('Meus pedidos', 2500);
  const meusPedidos = await texto();
  checar('RF0025: histórico de compras do cliente lista os pedidos', /PED-\d{4}/.test(meusPedidos));
  checar(
    'RN0043: troca oferecida apenas em pedidos entregues',
    /Solicitar troca/.test(meusPedidos),
  );

  console.log(`\n${'='.repeat(52)}`);
  console.log(`Passou: ${passou}  |  Falhou: ${falhou}`);
  if (excecoes.length) {
    console.log(`Exceções não tratadas: ${excecoes.length}`);
    [...new Set(excecoes)].slice(0, 3).forEach(e => console.log(`  ${e.slice(0, 160)}`));
  }

  ws.close();
  process.exit(falhou > 0 ? 1 : 0);
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
