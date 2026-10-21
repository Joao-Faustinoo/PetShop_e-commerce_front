/**
 * [MODEL] Service de cupons
 *
 * O QUE FAZ: lista os cupons que o cliente pode usar e valida um código
 * informado no checkout.
 *
 * COMO FARÁ: cada função chama o endpoint correspondente. A emissão do
 * cupom de troca e o consumo dos cupons de uma compra acontecem no
 * servidor, dentro da transação do pedido — não há como gastar um cupom
 * sem a compra existir.
 *
 * ATENDE: RF0037, RF0044, RN0033, RN0036, RN0037
 */

import { api } from '@/service/api/request';
import { Cupom, ValidacaoCupom } from '@/types/cupons/types';

export const cuponsService = {
  /** Os cupons do cliente logado; o id não viaja, vem do token. */
  async fetchCuponsPorCliente(): Promise<Cupom[]> {
    return api<Cupom[]>('/cupons');
  },

  /** Disponível é o que a API já devolve: válido e não utilizado. */
  async fetchCuponsDisponiveis(): Promise<Cupom[]> {
    return api<Cupom[]>('/cupons');
  },

  /** RN0037: validade e veracidade conferidas antes de aplicar. */
  async validarCupom(codigo: string): Promise<ValidacaoCupom> {
    return api<ValidacaoCupom>(`/cupons/${encodeURIComponent(codigo.trim())}`);
  },
};
