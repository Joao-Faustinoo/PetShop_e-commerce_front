/**
 * [MODEL] Service de cupons
 *
 * O QUE FAZ: expõe a consulta e a validação dos cupons, além da geração
 * de cupom de troca.
 *
 * COMO FARÁ: `fetchCuponsPorCliente(clienteId)` lista os cupons de troca
 * nominais e os promocionais vigentes; `validarCupom(codigo)` devolve
 * `ValidacaoCupom` checando existência, validade e se já foi utilizado
 * (RN0037); `gerarCupomTroca(valor, clienteId)` cria um cupom novo com o
 * valor informado e o devolve — usado tanto pela RF0045 (troca recebida)
 * quanto pela RN0036 (sobra de cupons na compra).
 *
 * ATENDE: RF0037, RF0045, RN0036, RN0037
 */

import { mockCupons, proximoIdCupom } from '@/mock/cupons/mock';
import { delay } from '@/service/api/delay';
import { Cupom, ValidacaoCupom } from '@/types/cupons/types';

const hojeISO = (): string => new Date().toISOString().slice(0, 10);

const gerarCodigo = (id: number): string =>
  `TROCA-${String(id).padStart(4, '0')}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;

export const cuponsService = {
  fetchCuponsPorCliente(clienteId: number): Promise<Cupom[]> {
    const resultado = mockCupons.filter(
      cupom =>
        // Cupons de troca são nominais; promocionais valem para todos.
        cupom.clienteId === clienteId || cupom.tipo === 'PROMOCIONAL',
    );

    return delay(resultado);
  },

  /** Só os que podem efetivamente ser aplicados numa compra agora. */
  fetchCuponsDisponiveis(clienteId: number): Promise<Cupom[]> {
    const hoje = hojeISO();
    const resultado = mockCupons.filter(
      cupom =>
        !cupom.utilizado &&
        cupom.validade >= hoje &&
        (cupom.clienteId === clienteId || cupom.tipo === 'PROMOCIONAL'),
    );

    return delay(resultado);
  },

  /** RN0037: valida existência, titularidade, validade e uso anterior. */
  validarCupom(codigo: string, clienteId: number): Promise<ValidacaoCupom> {
    const cupom = mockCupons.find(
      c => c.codigo.toLowerCase() === codigo.trim().toLowerCase(),
    );

    if (!cupom) {
      return delay({ valido: false, motivo: 'Cupom inexistente.' });
    }

    if (cupom.utilizado) {
      return delay({ valido: false, motivo: 'Este cupom já foi utilizado.' });
    }

    if (cupom.validade < hojeISO()) {
      return delay({
        valido: false,
        motivo: 'Cupom fora do prazo de validade.',
      });
    }

    if (cupom.tipo === 'TROCA' && cupom.clienteId !== clienteId) {
      return delay({
        valido: false,
        motivo: 'Este cupom de troca pertence a outro cliente.',
      });
    }

    return delay({ valido: true, cupom });
  },

  /** RF0045/RN0036: cria o cupom de troca (ou o de troco da compra). */
  gerarCupomTroca(
    valor: number,
    clienteId: number,
    trocaId?: number,
  ): Promise<Cupom> {
    const id = proximoIdCupom();
    const validade = new Date();
    validade.setMonth(validade.getMonth() + 6);

    const cupom: Cupom = {
      id,
      codigo: gerarCodigo(id),
      tipo: 'TROCA',
      valor: Number(valor.toFixed(2)),
      validade: validade.toISOString().slice(0, 10),
      utilizado: false,
      clienteId,
      trocaId,
    };

    mockCupons.push(cupom);

    return delay(cupom);
  },

  /** Marca como consumidos os cupons usados na finalização da compra. */
  marcarComoUtilizados(codigos: string[]): Promise<void> {
    codigos.forEach(codigo => {
      const indice = mockCupons.findIndex(c => c.codigo === codigo);

      if (indice >= 0) {
        mockCupons[indice] = { ...mockCupons[indice], utilizado: true };
      }
    });

    return delay(undefined, 100);
  },
};

/**
 * RN0036: escolhe o menor conjunto de cupons que cobre a compra, sem
 * empilhar cupons desnecessariamente. Devolve os cupons a aplicar e o
 * troco que virará um novo cupom de troca.
 *
 * Exemplo do DRS: compra de R$ 50,00 com cupons de 20, 40 e 35 — o
 * sistema aceita apenas dois deles e gera um cupom com a diferença.
 */
export const selecionarCuponsParaValor = (
  cupons: Cupom[],
  valorCompra: number,
): { selecionados: Cupom[]; troco: number } => {
  // Do maior para o menor: chega ao valor com a menor quantidade de cupons.
  const ordenados = [...cupons].sort((a, b) => b.valor - a.valor);
  const selecionados: Cupom[] = [];
  let acumulado = 0;

  ordenados.forEach(cupom => {
    if (acumulado >= valorCompra) return;

    selecionados.push(cupom);
    acumulado += cupom.valor;
  });

  return {
    selecionados,
    troco: Number(Math.max(0, acumulado - valorCompra).toFixed(2)),
  };
};
