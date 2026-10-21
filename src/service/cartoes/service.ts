/**
 * [MODEL] Service de cartões
 *
 * O QUE FAZ: lista os cartões do cliente e incorpora um novo ao perfil.
 *
 * COMO FARÁ: cada função chama o endpoint correspondente. O número e o
 * código de segurança nunca chegam inteiros ao navegador: a API devolve
 * apenas os quatro últimos dígitos, que é o que o cliente usa para
 * reconhecer o cartão.
 *
 * ATENDE: RF0027, RF0036, RN0024, RN0025
 */

import { api } from '@/service/api/request';
import {
  AlterarCartaoPayload,
  Cartao,
  CriarCartaoPayload,
} from '@/types/cartoes/types';

export const cartoesService = {
  /** O cliente é o da sessão; o id não viaja. */
  async fetchCartoesPorCliente(): Promise<Cartao[]> {
    return api<Cartao[]>('/cartoes');
  },

  /** RF0036: cartão novo incorporado ao perfil, para poder pagar com ele. */
  async criarCartao(payload: CriarCartaoPayload): Promise<Cartao> {
    return api<Cartao>('/cartoes', { method: 'POST', body: payload });
  },

  async alterarCartao(payload: AlterarCartaoPayload): Promise<Cartao> {
    const { id, ...dados } = payload;

    return api<Cartao>(`/cartoes/${id}`, { method: 'PUT', body: dados });
  },

  async removerCartao(id: number): Promise<void> {
    await api<void>(`/cartoes/${id}`, { method: 'DELETE' });
  },

  /** Um preferencial por cliente: o novo destrona o anterior. */
  async definirPreferencial(cartaoId: number): Promise<Cartao> {
    return api<Cartao>(`/cartoes/${cartaoId}/preferencial`, {
      method: 'PATCH',
    });
  },
};
