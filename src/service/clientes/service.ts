/**
 * [MODEL] Service de clientes
 *
 * O QUE FAZ: expõe o acesso aos dados cadastrais de cliente e às suas
 * transações.
 *
 * COMO FARÁ: cada função chama o endpoint correspondente da API pelo
 * `api()`. `fetchClientes(filtros)` monta a query string com os campos
 * preenchidos, combináveis entre si (RF0024), e devolve os itens da
 * página. `fetchClientePorId(id)` traz o detalhe com endereços, cartões e
 * pets (RF0022). `criarCliente` faz o autocadastro (RF0021);
 * `alterarCliente` altera (RF0022); `inativarCliente` e `ativarCliente`
 * mudam a situação (RF0023). O código único da RNF0035 e o ranking
 * inicial da RN0027 são atribuídos pelo servidor.
 *
 * O cadastro nunca é apagado: não existe função de exclusão aqui, porque
 * não existe DELETE na API — a RF0023 manda inativar.
 *
 * ATENDE: RF0021-RF0025, RN0021, RN0022, RN0026, RN0027, RNF0035
 */

import { mockPedidos } from '@/mock/pedidos/mock';
import { api } from '@/service/api/request';
import {
  AlterarClientePayload,
  Cliente,
  ClienteFiltros,
  CriarClientePayload,
  InativarClientePayload,
} from '@/types/clientes/types';
import { Pagina } from '@/types/common/types';
import { Pedido } from '@/types/pedidos/types';

/**
 * RN0027: o ranking sai do perfil de compras — quanto mais o cliente
 * gastou em compras efetivadas, maior a nota, de 1 a 5.
 *
 * PENDENTE: continua sobre `mockPedidos` porque a fatia de vendas ainda
 * não existe na API. O back tem a mesma função em `clientesService`,
 * esperando a tabela Pedido; quando ela chegar, esta sai daqui.
 */
export const calcularRanking = (clienteId: number): number => {
  const efetivadas = mockPedidos.filter(
    p => p.clienteId === clienteId && p.status !== 'REPROVADA',
  );
  const totalGasto = efetivadas.reduce((soma, p) => soma + p.total, 0);

  if (totalGasto >= 1500) return 5;
  if (totalGasto >= 800) return 4;
  if (totalGasto >= 400) return 3;
  if (totalGasto > 0) return 2;

  return 1;
};

/** Só os filtros preenchidos entram na URL; os vazios sairiam como "". */
const montarQuery = (filtros: ClienteFiltros): string => {
  const params = new URLSearchParams();

  if (filtros.nome) params.set('nome', filtros.nome.trim());
  if (filtros.codigo) params.set('codigo', filtros.codigo.trim());
  if (filtros.cpf) params.set('cpf', filtros.cpf.trim());
  if (filtros.email) params.set('email', filtros.email.trim());
  if (filtros.genero) params.set('genero', filtros.genero);
  if (filtros.rankingMinimo !== undefined) {
    params.set('rankingMinimo', String(filtros.rankingMinimo));
  }
  if (filtros.ativo !== undefined) params.set('ativo', String(filtros.ativo));

  // A consulta do administrador é uma tela única, sem paginação visível;
  // 100 é o teto que a API aceita por página.
  params.set('itensPorPagina', '100');

  return params.toString();
};

export const clientesService = {
  /** RF0024: consulta por qualquer campo identificador, isolado ou combinado. */
  async fetchClientes(filtros: ClienteFiltros = {}): Promise<Cliente[]> {
    const pagina = await api<Pagina<Cliente>>(
      `/clientes?${montarQuery(filtros)}`,
    );

    return pagina.itens;
  },

  /** RF0022: detalhe com endereços, cartões e pets. */
  async fetchClientePorId(id: number): Promise<Cliente> {
    return api<Cliente>(`/clientes/${id}`);
  },

  /** RF0025: todas as transações já realizadas pelo cliente. */
  async fetchTransacoesCliente(clienteId: number): Promise<Pedido[]> {
    return api<Pedido[]>(`/clientes/${clienteId}/transacoes`);
  },

  /** RF0021: autocadastro, com os dois endereços da RN0021/RN0022. */
  async criarCliente(payload: CriarClientePayload): Promise<Cliente> {
    return api<Cliente>('/clientes', { method: 'POST', body: payload });
  },

  /** RF0022: alteração dos dados cadastrais. */
  async alterarCliente(payload: AlterarClientePayload): Promise<Cliente> {
    const { id, ...dados } = payload;

    return api<Cliente>(`/clientes/${id}`, { method: 'PUT', body: dados });
  },

  /** RF0023: inativa sem apagar, registrando a justificativa. */
  async inativarCliente(payload: InativarClientePayload): Promise<Cliente> {
    return api<Cliente>(`/clientes/${payload.id}/situacao`, {
      method: 'PATCH',
      body: { ativo: false, justificativa: payload.justificativa },
    });
  },

  /** RF0023: reativa o cadastro, também com justificativa registrada. */
  async ativarCliente(payload: InativarClientePayload): Promise<Cliente> {
    return api<Cliente>(`/clientes/${payload.id}/situacao`, {
      method: 'PATCH',
      body: { ativo: true, justificativa: payload.justificativa },
    });
  },

  /**
   * RN0027: reavalia o ranking após uma compra ser efetivada.
   *
   * PENDENTE: a API ainda não expõe rota para isto — o service do back tem
   * a regra, mas ela depende da tabela Pedido. Enquanto o checkout também
   * é mockado, o cálculo fica aqui e não viaja para o servidor.
   */
  async atualizarRanking(clienteId: number): Promise<number> {
    return calcularRanking(clienteId);
  },
};
