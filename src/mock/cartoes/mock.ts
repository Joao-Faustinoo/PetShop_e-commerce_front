/**
 * [MODEL] Mock de cartões de crédito
 *
 * O QUE FAZ: fornece os cartões salvos no perfil dos clientes.
 *
 * COMO FARÁ: exporta `mockCartoes` com números mascarados e bandeiras
 * existentes em `mockBandeiras` (RN0025). O cliente de id 1 tem mais de
 * um cartão, sendo exatamente um marcado como preferencial, como exige
 * a RF0027.
 *
 * ATENDE: RF0027, RF0036, RN0024, RN0025
 */

import { Cartao } from '@/types/cartoes/types';

/** Mutável: o cartoesService inclui, altera e remove neste array. */
export const mockCartoes: Cartao[] = [
  {
    id: 1,
    clienteId: 1,
    numero: '4111111111111111',
    nomeImpresso: 'ANA B FAUSTINO',
    bandeiraId: 1,
    codigoSeguranca: '123',
    preferencial: true,
  },
  {
    id: 2,
    clienteId: 1,
    numero: '5555444433332222',
    nomeImpresso: 'ANA BEATRIZ FAUSTINO',
    bandeiraId: 2,
    codigoSeguranca: '456',
    preferencial: false,
  },
  {
    id: 3,
    clienteId: 2,
    numero: '6362970000457013',
    nomeImpresso: 'CARLOS H MOURA',
    bandeiraId: 3,
    codigoSeguranca: '789',
    preferencial: true,
  },
  {
    id: 4,
    clienteId: 3,
    numero: '4024007153949128',
    nomeImpresso: 'MARIANA L CARDOSO',
    bandeiraId: 1,
    codigoSeguranca: '321',
    preferencial: true,
  },
  {
    id: 5,
    clienteId: 4,
    numero: '3782822463100050',
    nomeImpresso: 'RODRIGO A PINTO',
    bandeiraId: 4,
    codigoSeguranca: '1234',
    preferencial: true,
  },
  {
    id: 6,
    clienteId: 5,
    numero: '5411779999888777',
    nomeImpresso: 'JULIANA F DIAS',
    bandeiraId: 2,
    codigoSeguranca: '654',
    preferencial: true,
  },
  {
    id: 7,
    clienteId: 7,
    numero: '6062825624233334',
    nomeImpresso: 'FERNANDA S LIMA',
    bandeiraId: 5,
    codigoSeguranca: '987',
    preferencial: true,
  },
  {
    id: 8,
    clienteId: 8,
    numero: '4485960000112233',
    nomeImpresso: 'BRUNO T NOGUEIRA',
    bandeiraId: 1,
    codigoSeguranca: '112',
    preferencial: true,
  },
];

export const proximoIdCartao = (): number =>
  mockCartoes.reduce((maior, c) => Math.max(maior, c.id), 0) + 1;
