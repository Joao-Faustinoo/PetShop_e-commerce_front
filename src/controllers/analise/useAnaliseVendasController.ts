/**
 * [CONTROLLER] useAnaliseVendasController
 *
 * O QUE FAZ: entrega ao gráfico gerencial as séries de vendas por
 * categoria dentro do período escolhido, validando o filtro antes.
 *
 * COMO FARÁ: mantém o filtro (dataInicio, dataFim, categoriaIds) e só
 * habilita o `useQuery` ['analise', filtro] quando ele é válido: data de
 * fim não anterior à de início (RF0056) e intervalo entre 1 e 24 meses
 * (RN0072). Permite selecionar várias categorias para comparação
 * simultânea (RF0057) e atribui a cada série uma cor distinta para a
 * legenda (RNF0043, RNF0045). Devolve os pontos já agregados por mês
 * (RN0071), com zero nos meses sem venda (RN0073).
 *
 * ATENDE: RF0055-RF0057, RNF0043, RNF0045, RN0071-RN0074
 */

'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { analiseService } from '@/service/analise/service';
import { AnaliseFiltro } from '@/types/analise/types';
import {
  MESES_MAXIMO,
  MESES_MINIMO,
  mesesEntre,
} from '@/validations/AnaliseFiltroSchema';
import { hojeISO, mesesAtrasISO } from '@/utils/formatDate';

/** RN0072 e RF0056 reunidas: por que um filtro está (ou não) válido. */
export const validarFiltro = (filtro: AnaliseFiltro): string | null => {
  if (!filtro.dataInicio || !filtro.dataFim) {
    return 'Informe a data de início e a data de fim.';
  }

  // RF0056: a data de fim não pode ser anterior à data de início.
  if (filtro.dataFim < filtro.dataInicio) {
    return 'A data de fim não pode ser anterior à data de início.';
  }

  // RN0072: o intervalo vai de 1 a 24 meses.
  const meses = mesesEntre(filtro.dataInicio, filtro.dataFim);

  if (meses < MESES_MINIMO || meses > MESES_MAXIMO) {
    return `O período deve ter entre ${MESES_MINIMO} e ${MESES_MAXIMO} meses.`;
  }

  // RF0057: sem categoria não há o que comparar no gráfico.
  if (filtro.categoriaIds.length === 0) {
    return 'Selecione ao menos uma categoria.';
  }

  return null;
};

/** Últimos 12 meses e todas as categorias: ponto de partida da tela. */
const filtroInicial: AnaliseFiltro = {
  dataInicio: mesesAtrasISO(12),
  dataFim: hojeISO(),
  categoriaIds: [1, 2, 3, 4, 5],
};

export const useAnaliseVendasController = () => {
  const [filtro, setFiltro] = useState<AnaliseFiltro>(filtroInicial);

  const erroFiltro = useMemo(() => validarFiltro(filtro), [filtro]);

  const {
    data: analise,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['analise', filtro],
    queryFn: () => analiseService.fetchAnaliseVendas(filtro),
    // Só consulta com o filtro válido.
    enabled: !erroFiltro,
  });

  return {
    filtro,
    aplicarFiltro: setFiltro,
    erroFiltro,
    analise,
    series: analise?.series ?? [],
    total: analise?.total ?? 0,
    isLoading: isLoading || isFetching,
    isError,
  };
};
