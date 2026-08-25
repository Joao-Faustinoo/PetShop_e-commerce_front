/**
 * [MODEL] Mock do log de transação
 *
 * O QUE FAZ: fornece registros de auditoria já existentes e serve de
 * destino para os novos registros gerados em memória durante a sessão.
 *
 * COMO FARÁ: exporta `mockLogs` com exemplos de inserção e alteração em
 * diferentes entidades, contendo data, hora, usuário responsável e os
 * dados alterados, como exige a RNF0012.
 *
 * ATENDE: RNF0012
 */

import { LogTransacao } from '@/types/log/types';

const diasAtras = (dias: number, hora: number): string => {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(hora, 0, 0, 0);

  return data.toISOString();
};

/** Mutável: o logService acrescenta cada operação de escrita aqui. */
export const mockLogs: LogTransacao[] = [
  {
    id: 1,
    dataHora: diasAtras(45, 9),
    usuarioId: 2,
    usuarioNome: 'João Faustino',
    entidade: 'Produto',
    entidadeId: 16,
    operacao: 'INSERCAO',
    dadosAlterados: [],
  },
  {
    id: 2,
    dataHora: diasAtras(30, 14),
    usuarioId: 2,
    usuarioNome: 'João Faustino',
    entidade: 'Produto',
    entidadeId: 15,
    operacao: 'ALTERACAO',
    dadosAlterados: [
      { campo: 'ativo', de: true, para: false },
      { campo: 'motivoSituacaoId', de: null, para: 1 },
    ],
  },
  {
    id: 3,
    dataHora: diasAtras(22, 11),
    usuarioId: 2,
    usuarioNome: 'João Faustino',
    entidade: 'Estoque',
    entidadeId: 1,
    operacao: 'INSERCAO',
    dadosAlterados: [],
  },
  {
    id: 4,
    dataHora: diasAtras(12, 16),
    usuarioId: 1,
    usuarioNome: 'João Faustino',
    entidade: 'Pet',
    entidadeId: 3,
    operacao: 'INSERCAO',
    dadosAlterados: [],
  },
  {
    id: 5,
    dataHora: diasAtras(6, 10),
    usuarioId: 1,
    usuarioNome: 'João Faustino',
    entidade: 'Cliente',
    entidadeId: 1,
    operacao: 'ALTERACAO',
    dadosAlterados: [
      { campo: 'telefone.numero', de: '98877-0000', para: '98877-1234' },
    ],
  },
  {
    id: 6,
    dataHora: diasAtras(2, 15),
    usuarioId: 2,
    usuarioNome: 'João Faustino',
    entidade: 'Pedido',
    entidadeId: 12,
    operacao: 'ALTERACAO',
    dadosAlterados: [
      { campo: 'status', de: 'APROVADA', para: 'EM_TRANSPORTE' },
    ],
  },
];

export const proximoIdLog = (): number =>
  mockLogs.reduce((maior, l) => Math.max(maior, l.id), 0) + 1;
