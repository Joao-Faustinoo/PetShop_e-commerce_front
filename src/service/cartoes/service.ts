/**
 * [MODEL] Service de cartões de crédito
 *
 * O QUE FAZ: expõe o CRUD dos cartões salvos no perfil do cliente.
 *
 * COMO FARÁ: `fetchCartoesPorCliente(clienteId)`, `criarCartao`,
 * `alterarCartao`, `removerCartao` e `definirPreferencial(cartaoId)` —
 * esta última desmarca os demais cartões do cliente antes de marcar o
 * novo, garantindo o cartão preferencial único da RF0027.
 *
 * ATENDE: RF0027, RF0036
 */

import { mockCartoes, proximoIdCartao } from '@/mock/cartoes/mock';
import { mockBandeiras } from '@/mock/dominios/mock';
import { delay, delayErro } from '@/service/api/delay';
import {
  AlterarCartaoPayload,
  Cartao,
  CriarCartaoPayload,
} from '@/types/cartoes/types';

/** Deixa exatamente um cartão do cliente marcado como preferencial. */
const marcarPreferencialUnico = (clienteId: number, cartaoId: number): void => {
  mockCartoes.forEach((cartao, indice) => {
    if (cartao.clienteId !== clienteId) return;

    mockCartoes[indice] = { ...cartao, preferencial: cartao.id === cartaoId };
  });
};

export const cartoesService = {
  fetchCartoesPorCliente(clienteId: number): Promise<Cartao[]> {
    return delay(mockCartoes.filter(c => c.clienteId === clienteId));
  },

  criarCartao(payload: CriarCartaoPayload): Promise<Cartao> {
    // RN0025: a bandeira precisa estar registrada no sistema.
    const bandeiraValida = mockBandeiras.some(b => b.id === payload.bandeiraId);

    if (!bandeiraValida) {
      return delayErro('Bandeira de cartão não registrada no sistema.');
    }

    const cartao: Cartao = { ...payload, id: proximoIdCartao() };
    mockCartoes.push(cartao);

    const primeiroDoCliente =
      mockCartoes.filter(c => c.clienteId === cartao.clienteId).length === 1;

    // RF0027: o primeiro cartão do cliente já nasce preferencial.
    if (cartao.preferencial || primeiroDoCliente) {
      marcarPreferencialUnico(cartao.clienteId, cartao.id);
    }

    return delay(mockCartoes.find(c => c.id === cartao.id)!);
  },

  alterarCartao(payload: AlterarCartaoPayload): Promise<Cartao> {
    const indice = mockCartoes.findIndex(c => c.id === payload.id);

    if (indice < 0) {
      return delayErro('Cartão não encontrado.');
    }

    mockCartoes[indice] = { ...mockCartoes[indice], ...payload };

    if (payload.preferencial) {
      marcarPreferencialUnico(payload.clienteId, payload.id);
    }

    return delay(mockCartoes[indice]);
  },

  removerCartao(id: number): Promise<void> {
    const indice = mockCartoes.findIndex(c => c.id === id);

    if (indice < 0) {
      return delayErro('Cartão não encontrado.');
    }

    const { clienteId, preferencial } = mockCartoes[indice];
    mockCartoes.splice(indice, 1);

    // RF0027: se o preferencial saiu, promove o próximo cartão do cliente.
    if (preferencial) {
      const proximo = mockCartoes.find(c => c.clienteId === clienteId);

      if (proximo) marcarPreferencialUnico(clienteId, proximo.id);
    }

    return delay(undefined);
  },

  definirPreferencial(cartaoId: number): Promise<Cartao> {
    const cartao = mockCartoes.find(c => c.id === cartaoId);

    if (!cartao) {
      return delayErro('Cartão não encontrado.');
    }

    marcarPreferencialUnico(cartao.clienteId, cartaoId);

    return delay(mockCartoes.find(c => c.id === cartaoId)!);
  },
};
