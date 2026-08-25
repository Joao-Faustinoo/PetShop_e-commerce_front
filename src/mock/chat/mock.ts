/**
 * [MODEL] Mock do assistente de recomendação
 *
 * O QUE FAZ: simula as respostas da IA generativa enquanto não há
 * integração real com um modelo.
 *
 * COMO FARÁ: exporta `mockConversaInicial` (mensagem de boas-vindas do
 * assistente) e `mockRespostas`, um conjunto de respostas casadas por
 * palavra-chave que devolvem produtos sugeridos do mockProdutos
 * compatíveis com a espécie e o porte do pet do cliente.
 *
 * ATENDE: RNF0047
 */

import { Mensagem } from '@/types/chat/types';
import { Produto } from '@/types/produtos/types';

/**
 * Regra de resposta do assistente simulado. `palavras` casa a intenção do
 * cliente; `filtrar` escolhe, dentro do catálogo, os produtos coerentes
 * com o pet e com o histórico que o service passa no contexto.
 */
export interface RespostaAssistente {
  palavras: string[];
  /** `{pet}` é trocado pelo nome do pet considerado na recomendação. */
  texto: string;
  filtrar: (produtos: Produto[]) => Produto[];
}

export const mockConversaInicial: Mensagem[] = [
  {
    id: 1,
    autor: 'ASSISTENTE',
    texto:
      'Olá! Sou o assistente da loja. Posso sugerir roupas e acessórios sob medida para o seu pet — é só me dizer o que você procura, por exemplo "uma roupa de frio" ou "uma coleira".',
    dataHora: new Date().toISOString(),
  },
];

export const mockRespostas: RespostaAssistente[] = [
  {
    palavras: [
      'frio',
      'inverno',
      'casaco',
      'moletom',
      'suéter',
      'sueter',
      'agasalho',
    ],
    texto:
      'Para os dias frios, estas peças fechadas são as mais indicadas para {pet}. Todas estão no tamanho que corresponde ao porte dele.',
    filtrar: produtos =>
      produtos.filter(
        p =>
          p.categoriaIds.includes(1) &&
          /moletom|casaco|suéter|pijama|body/i.test(p.nome),
      ),
  },
  {
    palavras: ['chuva', 'impermeável', 'impermeavel', 'capa'],
    texto:
      'Estas são as opções impermeáveis do catálogo — protegem {pet} sem limitar o movimento no passeio.',
    filtrar: produtos =>
      produtos.filter(p =>
        /capa de chuva|impermeável/i.test(p.nome + p.descricao),
      ),
  },
  {
    palavras: ['coleira', 'peitoral', 'guia', 'passeio'],
    texto:
      'Para o passeio de {pet}, recomendo estes itens de condução. O peitoral distribui melhor a tração do que a coleira de pescoço.',
    filtrar: produtos =>
      produtos.filter(
        p => p.categoriaIds.includes(3) || /guia|peitoral/i.test(p.nome),
      ),
  },
  {
    palavras: ['brinquedo', 'brincar', 'mordedor', 'diversão', 'diversao'],
    texto:
      'Separei os brinquedos que combinam com o porte e a espécie de {pet}.',
    filtrar: produtos => produtos.filter(p => p.categoriaIds.includes(4)),
  },
  {
    palavras: ['cama', 'dormir', 'descanso', 'sono', 'colchão', 'colchao'],
    texto:
      'Estas camas têm a dimensão adequada para o porte de {pet} — ele consegue se esticar por completo.',
    filtrar: produtos => produtos.filter(p => p.categoriaIds.includes(5)),
  },
  {
    palavras: ['festa', 'aniversário', 'aniversario', 'elegante', 'gravata'],
    texto:
      'Para uma ocasião especial, estes acessórios deixam {pet} com visual de gala.',
    filtrar: produtos =>
      produtos.filter(
        p => p.categoriaIds.includes(2) && /gravata|bandana/i.test(p.nome),
      ),
  },
  {
    palavras: ['tamanho', 'medida', 'porte', 'serve', 'cabe'],
    texto:
      'Considerando o peso e o porte de {pet}, o tamanho indicado é o que já apliquei no filtro abaixo. Na dúvida entre dois tamanhos, prefira o maior.',
    filtrar: produtos => produtos.filter(p => p.categoriaIds.includes(1)),
  },
];

/** Usada quando nenhuma palavra-chave casa com a mensagem do cliente. */
export const respostaPadrao =
  'Ainda não tenho uma sugestão específica para isso. Posso ajudar com roupas de frio, capas de chuva, coleiras e guias, brinquedos, camas ou dúvidas de tamanho para {pet}.';

/** Usada quando o cliente ainda não cadastrou nenhum pet (RF0028). */
export const respostaSemPet =
  'Para eu acertar o tamanho, cadastre primeiro o seu pet em Meu perfil › Meus pets. Enquanto isso, aqui vão os itens mais procurados da loja.';
