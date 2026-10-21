/**
 * [CONTROLLER] useCupomController
 *
 * O QUE FAZ: conduz a aplicação de cupons de troca e promocionais no
 * pagamento, com todas as regras de combinação.
 *
 * COMO FARÁ: `useQuery` ['cupons', clienteId] para listar os disponíveis
 * e uma ação `aplicarCupom` que valida antes de aceitar. Bloqueia o
 * segundo cupom promocional na mesma compra (RN0033). Ao montar a
 * combinação, sempre consome o valor máximo dos cupons (RN0035) e impede
 * o uso de cupons além do necessário (RN0036) — se a soma superar o
 * total, marca a diferença para virar um novo cupom de troca. Expõe
 * `valorCobertoPorCupons` e `valorRestante` ao pagamento.
 *
 * ATENDE: RF0037, RN0033, RN0035, RN0036
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { cuponsService } from '@/service/cupons/service';
import { Cupom, CupomAplicado } from '@/types/cupons/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useCupomController = (
  clienteId: number | undefined,
  valorTotal: number,
) => {
  const [aplicados, setAplicados] = useState<Cupom[]>([]);

  const { data: disponiveis = [], isLoading } = useQuery({
    queryKey: ['cupons', clienteId],
    queryFn: () => cuponsService.fetchCuponsDisponiveis(),
    enabled: !!clienteId,
  });

  /**
   * RN0035: os cupons são sempre consumidos pelo valor máximo, na ordem
   * em que foram aplicados. RN0036: o que sobrar do último cupom não se
   * perde — vira o troco, que depois é emitido como novo cupom de troca.
   */
  const { cuponsAplicados, valorCobertoPorCupons, troco } = useMemo(() => {
    let restante = valorTotal;
    const detalhados: CupomAplicado[] = [];

    aplicados.forEach(cupom => {
      const valorConsumido = Math.min(cupom.valor, Math.max(0, restante));
      restante = Number((restante - valorConsumido).toFixed(2));

      detalhados.push({ cupom, valorConsumido });
    });

    const somaDosCupons = aplicados.reduce((soma, c) => soma + c.valor, 0);

    return {
      cuponsAplicados: detalhados,
      valorCobertoPorCupons: Number((valorTotal - restante).toFixed(2)),
      troco: Number(Math.max(0, somaDosCupons - valorTotal).toFixed(2)),
    };
  }, [aplicados, valorTotal]);

  const valorRestante = Number(
    Math.max(0, valorTotal - valorCobertoPorCupons).toFixed(2),
  );

  const aplicarCupom = useCallback(
    async (codigo: string) => {
      if (!clienteId) return;

      const jaAplicado = aplicados.some(
        c => c.codigo.toLowerCase() === codigo.trim().toLowerCase(),
      );

      if (jaAplicado) {
        handleError(new Error('Este cupom já foi aplicado nesta compra.'));

        return;
      }

      // RN0036: com a compra já coberta, mais um cupom seria desperdício.
      if (valorRestante <= 0) {
        handleError(
          new Error(
            'O valor da compra já está totalmente coberto. Não é possível usar mais cupons.',
          ),
        );

        return;
      }

      const { valido, motivo, cupom } = await cuponsService.validarCupom(
        codigo,
      );

      if (!valido || !cupom) {
        handleError(new Error(motivo ?? 'Cupom inválido.'));

        return;
      }

      // RN0033: apenas um cupom promocional por compra.
      if (
        cupom.tipo === 'PROMOCIONAL' &&
        aplicados.some(c => c.tipo === 'PROMOCIONAL')
      ) {
        handleError(
          new Error('Apenas um cupom promocional pode ser usado por compra.'),
        );

        return;
      }

      setAplicados(atuais => [...atuais, cupom]);
      handleSuccess(`Cupom ${cupom.codigo} aplicado.`);
    },
    [clienteId, aplicados, valorRestante],
  );

  const removerCupom = useCallback((codigo: string) => {
    setAplicados(atuais => atuais.filter(c => c.codigo !== codigo));
  }, []);

  const limparCupons = useCallback(() => setAplicados([]), []);

  return {
    disponiveis,
    isLoading,
    cuponsAplicados,
    valorCobertoPorCupons,
    valorRestante,
    /** RN0036: sobra que vira um novo cupom de troca ao finalizar. */
    troco,
    aplicarCupom,
    removerCupom,
    limparCupons,
  };
};
