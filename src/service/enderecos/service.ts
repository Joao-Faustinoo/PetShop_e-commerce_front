/**
 * [MODEL] Service de endereços
 *
 * O QUE FAZ: expõe o CRUD dos endereços de entrega e cobrança do cliente,
 * de forma independente dos demais dados cadastrais.
 *
 * COMO FARÁ: `fetchEnderecosPorCliente(clienteId)`, `criarEndereco`,
 * `alterarEndereco` e `removerEndereco` operam direto sobre
 * `mockEnderecos`. A separação em service próprio é o que permite à
 * RNF0034 alterar ou adicionar endereço sem tocar no cadastro do cliente.
 *
 * ATENDE: RF0026, RF0035, RNF0034
 */

import { mockEnderecos, proximoIdEndereco } from '@/mock/enderecos/mock';
import { delay, delayErro } from '@/service/api/delay';
import {
  AlterarEnderecoPayload,
  CriarEnderecoPayload,
  Endereco,
} from '@/types/enderecos/types';

export const enderecosService = {
  fetchEnderecosPorCliente(clienteId: number): Promise<Endereco[]> {
    return delay(mockEnderecos.filter(e => e.clienteId === clienteId));
  },

  fetchEnderecoPorId(id: number): Promise<Endereco> {
    const endereco = mockEnderecos.find(e => e.id === id);

    if (!endereco) {
      return delayErro('Endereço não encontrado.');
    }

    return delay(endereco);
  },

  criarEndereco(payload: CriarEnderecoPayload): Promise<Endereco> {
    const endereco: Endereco = { ...payload, id: proximoIdEndereco() };
    mockEnderecos.push(endereco);

    return delay(endereco);
  },

  alterarEndereco(payload: AlterarEnderecoPayload): Promise<Endereco> {
    const indice = mockEnderecos.findIndex(e => e.id === payload.id);

    if (indice < 0) {
      return delayErro('Endereço não encontrado.');
    }

    mockEnderecos[indice] = { ...mockEnderecos[indice], ...payload };

    return delay(mockEnderecos[indice]);
  },

  removerEndereco(id: number): Promise<void> {
    const indice = mockEnderecos.findIndex(e => e.id === id);

    if (indice < 0) {
      return delayErro('Endereço não encontrado.');
    }

    const alvo = mockEnderecos[indice];
    const doMesmoTipo = mockEnderecos.filter(
      e => e.clienteId === alvo.clienteId && e.tipo === alvo.tipo,
    );

    // RN0021/RN0022: o cliente não pode ficar sem endereço de cobrança
    // nem sem endereço de entrega.
    if (doMesmoTipo.length <= 1) {
      const rotulo = alvo.tipo === 'COBRANCA' ? 'cobrança' : 'entrega';

      return delayErro(
        `É obrigatório manter ao menos um endereço de ${rotulo} no cadastro.`,
      );
    }

    mockEnderecos.splice(indice, 1);

    return delay(undefined);
  },
};
