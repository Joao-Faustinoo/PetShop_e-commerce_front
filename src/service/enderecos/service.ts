/**
 * [MODEL] Service de endereços
 *
 * O QUE FAZ: lista os endereços do cliente e incorpora um novo ao perfil.
 *
 * COMO FARÁ: cada função chama o endpoint correspondente. O endereço
 * usado numa compra precisa existir no cadastro, porque o pedido aponta
 * para ele — é por isso que o "novo endereço" do checkout é gravado antes
 * de a compra fechar.
 *
 * ATENDE: RF0026, RF0035, RN0023, RNF0034
 */

import { api } from '@/service/api/request';
import {
  AlterarEnderecoPayload,
  CriarEnderecoPayload,
  Endereco,
  TipoEndereco,
} from '@/types/enderecos/types';

export const enderecosService = {
  /** O cliente é o da sessão; o id não viaja. */
  async fetchEnderecosPorCliente(
    tipo?: TipoEndereco,
    incluirNaoSalvos = false,
  ): Promise<Endereco[]> {
    const params = new URLSearchParams();

    if (tipo) params.set('tipo', tipo);
    /*
     * RF0035: o checkout também precisa ver o endereço que acabou de ser
     * criado para aquela compra sem ir para o perfil — sem isto ele some
     * da lista no instante seguinte ao cadastro.
     */
    if (incluirNaoSalvos) params.set('incluirNaoSalvos', 'true');

    return api<Endereco[]>(`/enderecos?${params.toString()}`);
  },

  async fetchEnderecoPorId(id: number): Promise<Endereco> {
    const todos = await this.fetchEnderecosPorCliente();
    const endereco = todos.find(e => e.id === id);

    if (!endereco) throw new Error('Endereço não encontrado.');

    return endereco;
  },

  /** RF0035 e RNF0034: acrescenta sem mexer no resto do cadastro. */
  /** RF0035: `salvarNoPerfil` decide se ele fica guardado no cadastro. */
  async criarEndereco(
    payload: CriarEnderecoPayload,
    salvarNoPerfil = true,
  ): Promise<Endereco> {
    return api<Endereco>('/enderecos', {
      method: 'POST',
      body: { ...payload, salvarNoPerfil },
    });
  },

  async alterarEndereco(payload: AlterarEnderecoPayload): Promise<Endereco> {
    const { id, ...dados } = payload;

    return api<Endereco>(`/enderecos/${id}`, { method: 'PUT', body: dados });
  },

  /** RN0021/RN0022: a API recusa deixar o cliente sem um dos tipos. */
  async removerEndereco(id: number): Promise<void> {
    await api<void>(`/enderecos/${id}`, { method: 'DELETE' });
  },
};
