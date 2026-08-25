/**
 * [CONTROLLER] usePrecificacaoController
 *
 * O QUE FAZ: calcula o valor de venda do produto e valida se um valor
 * digitado manualmente respeita a margem do grupo de precificação.
 *
 * COMO FARÁ: dado o valor de custo e o grupo de precificação escolhido,
 * devolve `valorVendaSugerido = custo * (1 + margem/100)` (RN0013 e
 * RF0052). `validarMargem(valorInformado)` devolve se o valor está dentro
 * da margem; se estiver abaixo, sinaliza `exigeAutorizacaoGerente: true`
 * em vez de simplesmente recusar, que é o comportamento da RN0014.
 *
 * ATENDE: RF0052, RN0013, RN0014
 */

'use client';

import { useCallback, useMemo } from 'react';

import { useDominiosController } from '@/controllers/dominios/useDominiosController';

interface ResultadoMargem {
  dentroDaMargem: boolean;
  /** RN0014: abaixo da margem não é proibido — depende de autorização. */
  exigeAutorizacaoGerente: boolean;
  valorMinimo: number;
  mensagem?: string;
}

export const usePrecificacaoController = (
  valorCusto: number,
  grupoPrecificacaoId?: number,
) => {
  const { gruposPrecificacao } = useDominiosController();

  const grupo = useMemo(
    () => gruposPrecificacao.find(g => g.id === grupoPrecificacaoId),
    [gruposPrecificacao, grupoPrecificacaoId],
  );

  // RN0013/RF0052: valor de venda = custo + margem do grupo.
  const valorVendaSugerido = useMemo(() => {
    if (!valorCusto || !grupo) return 0;

    return Number((valorCusto * (1 + grupo.margemLucro / 100)).toFixed(2));
  }, [valorCusto, grupo]);

  const validarMargem = useCallback(
    (valorInformado: number): ResultadoMargem => {
      if (!grupo || !valorCusto) {
        return {
          dentroDaMargem: true,
          exigeAutorizacaoGerente: false,
          valorMinimo: 0,
        };
      }

      const dentroDaMargem = valorInformado >= valorVendaSugerido;

      return {
        dentroDaMargem,
        // RN0014: abaixo da margem exige autorização do gerente de vendas.
        exigeAutorizacaoGerente: !dentroDaMargem,
        valorMinimo: valorVendaSugerido,
        mensagem: dentroDaMargem
          ? undefined
          : `O valor está abaixo da margem de ${grupo.margemLucro}% do grupo "${grupo.nome}". É necessária a autorização de um gerente de vendas.`,
      };
    },
    [grupo, valorCusto, valorVendaSugerido],
  );

  return {
    grupo,
    margemLucro: grupo?.margemLucro ?? 0,
    valorVendaSugerido,
    validarMargem,
  };
};
