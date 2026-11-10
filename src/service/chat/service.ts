/**
 * [MODEL] Service do assistente de recomendação
 *
 * O QUE FAZ: conduz a conversa com o assistente e entrega a saudação
 * inicial.
 *
 * COMO FARÁ: a pergunta vai para a API, que monta o contexto do cliente —
 * pets, histórico de compras, categorias e marcas preferidas —, consulta o
 * modelo e devolve a resposta já com os produtos sugeridos. Nada disso
 * acontece aqui: o contexto depende de dados que o navegador não tem, e a
 * chave do modelo não pode sair do servidor.
 *
 * ATENDE: RNF0047
 */

import { api } from '@/service/api/request';
import { Mensagem } from '@/types/chat/types';

/** Ids das mensagens que o próprio cliente escreve, só para a lista. */
let proximoIdLocal = 0;

/**
 * A saudação não vem da API: é texto de interface, não resposta do
 * modelo. Gastar uma consulta ao Gemini para dizer "olá" seria cobrar por
 * uma frase que nunca muda.
 */
const SAUDACAO: Mensagem = {
  id: 0,
  autor: 'ASSISTENTE',
  texto:
    'Oi! Me conte sobre seu pet ou o que você procura, e eu sugiro o que combina com ele.',
  dataHora: new Date().toISOString(),
};

export const chatService = {
  fetchConversaInicial(): Promise<Mensagem[]> {
    return Promise.resolve([{ ...SAUDACAO, dataHora: new Date().toISOString() }]);
  },

  enviarMensagem(texto: string): Promise<Mensagem> {
    return api<Mensagem>('/assistente/mensagens', {
      method: 'POST',
      body: { texto },
    });
  },

  /** Id sequencial para as mensagens que o próprio cliente envia. */
  proximoId(): number {
    proximoIdLocal += 1;

    return proximoIdLocal;
  },
};
