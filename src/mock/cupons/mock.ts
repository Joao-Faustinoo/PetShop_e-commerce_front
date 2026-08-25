/**
 * [MODEL] Mock de cupons
 *
 * O QUE FAZ: fornece os cupons de troca e promocionais disponíveis para
 * pagamento.
 *
 * COMO FARÁ: exporta `mockCupons` com cupons promocionais válidos e
 * vencidos e cupons de troca nominais do cliente de id 1. Os valores são
 * escolhidos para reproduzir o exemplo da RN0036 (cupons de 20, 40 e 35
 * reais numa compra de 50) e permitir testar a geração de cupom com a
 * diferença.
 *
 * ATENDE: RF0037, RF0045, RN0033, RN0035, RN0036
 */

import { Cupom } from '@/types/cupons/types';

const hoje = new Date();

const emDias = (dias: number): string => {
  const data = new Date(hoje);
  data.setDate(data.getDate() + dias);

  return data.toISOString().slice(0, 10);
};

/** Mutável: o cuponsService marca como utilizado e gera novos cupons. */
export const mockCupons: Cupom[] = [
  // RN0036: os três cupons de troca do exemplo do DRS (20 + 40 + 35).
  {
    id: 1,
    codigo: 'TROCA-A20',
    tipo: 'TROCA',
    valor: 20,
    validade: emDias(180),
    utilizado: false,
    clienteId: 1,
  },
  {
    id: 2,
    codigo: 'TROCA-B40',
    tipo: 'TROCA',
    valor: 40,
    validade: emDias(180),
    utilizado: false,
    clienteId: 1,
  },
  {
    id: 3,
    codigo: 'TROCA-C35',
    tipo: 'TROCA',
    valor: 35,
    validade: emDias(180),
    utilizado: false,
    clienteId: 1,
  },
  {
    id: 4,
    codigo: 'TROCA-D15',
    tipo: 'TROCA',
    valor: 15,
    validade: emDias(90),
    utilizado: true,
    clienteId: 1,
  },
  {
    id: 5,
    codigo: 'TROCA-E60',
    tipo: 'TROCA',
    valor: 60,
    validade: emDias(-10),
    utilizado: false,
    clienteId: 1,
  },
  {
    id: 6,
    codigo: 'TROCA-F30',
    tipo: 'TROCA',
    valor: 30,
    validade: emDias(150),
    utilizado: false,
    clienteId: 2,
  },
  // RN0033: promocionais valem para qualquer cliente, um por compra.
  {
    id: 7,
    codigo: 'BEMVINDO10',
    tipo: 'PROMOCIONAL',
    valor: 10,
    validade: emDias(365),
    utilizado: false,
  },
  {
    id: 8,
    codigo: 'PETLOVER25',
    tipo: 'PROMOCIONAL',
    valor: 25,
    validade: emDias(60),
    utilizado: false,
  },
  {
    id: 9,
    codigo: 'INVERNO50',
    tipo: 'PROMOCIONAL',
    valor: 50,
    validade: emDias(30),
    utilizado: false,
  },
  {
    id: 10,
    codigo: 'NATAL2024',
    tipo: 'PROMOCIONAL',
    valor: 40,
    validade: emDias(-200),
    utilizado: false,
  },
];

export const proximoIdCupom = (): number =>
  mockCupons.reduce((maior, c) => Math.max(maior, c.id), 0) + 1;
