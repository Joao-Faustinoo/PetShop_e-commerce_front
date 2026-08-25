/**
 * [CONTROLLER] useBloqueioItemController
 *
 * O QUE FAZ: controla o prazo de bloqueio dos itens no carrinho, o aviso
 * ao usuário e a liberação automática ao expirar.
 *
 * COMO FARÁ: lê o tempo limite parametrizado do service e mantém um
 * temporizador sobre o item mais recente do carrinho (a RN0044 conta o
 * prazo a partir da última inclusão). Emite um toast 5 minutos antes de
 * expirar. No vencimento, chama `liberarItensExpirados`, o que retira do
 * carrinho todos os itens do mesmo produto (RN0045) e os move para
 * `itensRemovidos`, que a tela exibe com a compra desabilitada (RNF0042).
 *
 * ATENDE: RN0044, RN0045, RNF0042
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { carrinhoService } from '@/service/carrinho/service';
import { ItemCarrinho } from '@/types/carrinho/types';

const UM_SEGUNDO = 1000;

export const useBloqueioItemController = (itens: ItemCarrinho[]) => {
  const queryClient = useQueryClient();
  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(
    null,
  );
  // Garante que o aviso dos 5 minutos saia uma vez por ciclo de bloqueio.
  const avisoEmitido = useRef(false);

  const { data: parametros } = useQuery({
    queryKey: ['carrinho', 'parametrosBloqueio'],
    queryFn: carrinhoService.fetchParametrosBloqueio,
    staleTime: Infinity,
  });

  /**
   * RN0044: o prazo conta a partir da última inclusão no carrinho, ou
   * seja, do item cujo bloqueio expira por último.
   */
  const expiraEm = useMemo(() => {
    if (itens.length === 0) return null;

    return itens.reduce(
      (maisRecente, item) =>
        Math.max(maisRecente, new Date(item.bloqueadoAte).getTime()),
      0,
    );
  }, [itens]);

  useEffect(() => {
    if (!expiraEm || !parametros) {
      setSegundosRestantes(null);

      return undefined;
    }

    avisoEmitido.current = false;

    const tick = async () => {
      const restante = Math.round((expiraEm - Date.now()) / UM_SEGUNDO);
      setSegundosRestantes(Math.max(0, restante));

      // RN0044: avisa o usuário antes de o bloqueio expirar.
      const segundosDeAviso = parametros.minutosAviso * 60;

      if (
        restante > 0 &&
        restante <= segundosDeAviso &&
        !avisoEmitido.current
      ) {
        avisoEmitido.current = true;
        toast.warn(
          `Seus itens ficam reservados por mais ${parametros.minutosAviso} minutos. Finalize a compra para não perdê-los.`,
        );
      }

      // RN0045/RNF0042: no vencimento, os itens saem do carrinho e são
      // desbloqueados para os demais clientes.
      if (restante <= 0) {
        await carrinhoService.liberarItensExpirados();
        queryClient.invalidateQueries({ queryKey: ['carrinho'] });
        queryClient.invalidateQueries({ queryKey: ['estoque'] });
      }
    };

    tick();
    const intervalo = setInterval(tick, UM_SEGUNDO);

    return () => clearInterval(intervalo);
  }, [expiraEm, parametros, queryClient]);

  /** mm:ss para o contador exibido na tela do carrinho. */
  const tempoFormatado = useMemo(() => {
    if (segundosRestantes === null) return null;

    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(
      2,
      '0',
    )}`;
  }, [segundosRestantes]);

  return {
    parametros,
    segundosRestantes,
    tempoFormatado,
    proximoDoFim:
      segundosRestantes !== null &&
      !!parametros &&
      segundosRestantes <= parametros.minutosAviso * 60,
  };
};
