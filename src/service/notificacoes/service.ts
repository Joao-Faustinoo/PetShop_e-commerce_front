/**
 * [MODEL] Service de notificações
 *
 * O QUE FAZ: traz os avisos que o sistema gerou para o cliente e marca um
 * aviso como lido.
 *
 * COMO FARÁ: chama a API, que guarda as notificações por cliente. É o que
 * faz a autorização da troca ser algo que o cliente RECEBE, e não apenas
 * um status que mudou na lista de pedidos.
 *
 * ATENDE: RNF0046
 */

import { api } from '@/service/api/request';

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
  pedidoId?: number;
}

export const notificacoesService = {
  async fetchNotificacoes(): Promise<Notificacao[]> {
    return api<Notificacao[]>('/notificacoes');
  },

  async marcarComoLida(id: number): Promise<void> {
    await api(`/notificacoes/${id}/lida`, { method: 'PATCH' });
  },
};
