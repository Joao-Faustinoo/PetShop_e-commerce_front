/**
 * [MODEL] Service de carrinho
 *
 * O QUE FAZ: mantém os itens que o cliente separou para comprar.
 *
 * COMO FARÁ: cada função chama o endpoint correspondente da API, que
 * devolve o carrinho inteiro — itens ativos, itens retirados pelo prazo
 * (RNF0042), subtotal e total. O bloqueio da RN0044 e a validação de
 * estoque da RN0031 acontecem no servidor: é lá que está o saldo.
 *
 * O carrinho é sempre o de quem está logado; o id do cliente não viaja.
 *
 * ATENDE: RF0031, RF0032, RN0031, RN0032, RN0044, RNF0042
 */

import { api } from '@/service/api/request';
import {
  AlertaDisponibilidade,
  Carrinho,
  ParametrosBloqueio,
} from '@/types/carrinho/types';

export const carrinhoService = {
  async fetchCarrinho(): Promise<Carrinho> {
    return api<Carrinho>('/carrinho');
  },

  /** RN0044: os prazos são parâmetros do sistema, lidos do servidor. */
  async fetchParametrosBloqueio(): Promise<ParametrosBloqueio> {
    return api<ParametrosBloqueio>('/carrinho/parametros');
  },

  /** RF0034: subtotal, frete e total para o endereço escolhido. */
  async fetchResumo(
    enderecoEntregaId: number,
  ): Promise<{ subtotal: number; frete: number; total: number }> {
    return api(`/carrinho/resumo?enderecoEntregaId=${enderecoEntregaId}`);
  },

  /** RF0031 e RN0031: o servidor recusa o que passa do disponível. */
  async adicionarItem({
    produtoId,
    quantidade,
  }: {
    produtoId: number;
    quantidade: number;
  }): Promise<Carrinho> {
    return api<Carrinho>('/carrinho/itens', {
      method: 'POST',
      body: { produtoId, quantidade },
    });
  },

  /** RF0032: zero remove o item. */
  async alterarQuantidade({
    produtoId,
    quantidade,
  }: {
    produtoId: number;
    quantidade: number;
  }): Promise<Carrinho> {
    return api<Carrinho>(`/carrinho/itens/${produtoId}`, {
      method: 'PUT',
      body: { quantidade },
    });
  },

  async removerItem(produtoId: number): Promise<Carrinho> {
    return api<Carrinho>(`/carrinho/itens/${produtoId}`, { method: 'DELETE' });
  },

  /**
   * RNF0042: devolve ao carrinho um item que o prazo havia retirado. Passa
   * pela mesma validação de estoque, porque nesse meio-tempo o produto
   * pode ter sido vendido para outro cliente.
   */
  async restaurarItemRemovido(produtoId: number): Promise<Carrinho> {
    return api<Carrinho>(`/carrinho/itens/${produtoId}/restaurar`, {
      method: 'POST',
    });
  },

  /**
   * RN0044: a colheita dos expirados acontece no servidor a cada leitura,
   * então basta reler o carrinho para a lista chegar atualizada.
   */
  async liberarItensExpirados(): Promise<Carrinho> {
    return this.fetchCarrinho();
  },

  /**
   * RN0032: a conferência de disponibilidade roda dentro da transação da
   * compra, no servidor. Se algo mudou, a finalização é recusada com a
   * mensagem explicando — não há o que revalidar por fora.
   */
  async revalidarDisponibilidade(): Promise<{
    carrinho: Carrinho;
    alertas: AlertaDisponibilidade[];
  }> {
    return { carrinho: await this.fetchCarrinho(), alertas: [] };
  },

  async limpar(): Promise<Carrinho> {
    return api<Carrinho>('/carrinho', { method: 'DELETE' });
  },
};
