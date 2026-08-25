/**
 * [CONTROLLER] useExportarAnaliseController
 *
 * O QUE FAZ: exporta em planilha os dados que estão sendo exibidos no
 * gráfico gerencial.
 *
 * COMO FARÁ: pega as séries já carregadas pelo
 * `useAnaliseVendasController`, achata para linhas de período, categoria
 * e valor de venda, e passa ao utilitário `exportToSheet`, que gera o
 * arquivo. Exporta exatamente o recorte visível — mesmo período e mesmas
 * categorias do filtro atual.
 *
 * ATENDE: RF0058
 */

'use client';

import { useCallback } from 'react';

import { AnaliseVendas, LinhaExportacao } from '@/types/analise/types';
import { exportToSheet } from '@/utils/exportToSheet';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useExportarAnaliseController = (analise?: AnaliseVendas) => {
  const exportar = useCallback(() => {
    if (!analise || analise.series.length === 0) {
      handleError(new Error('Não há dados no período para exportar.'));

      return;
    }

    // RF0058: uma linha por período e categoria, exatamente o recorte
    // que está no gráfico.
    const linhas: LinhaExportacao[] = analise.series.flatMap(serie =>
      serie.pontos.map(ponto => ({
        Periodo: ponto.periodo,
        Categoria: serie.nome,
        'Valor de venda': ponto.valor,
      })),
    );

    const carimbo = new Date().toISOString().slice(0, 10);
    exportToSheet(linhas, `analise-vendas-${carimbo}`);

    handleSuccess('Planilha gerada com os dados do gráfico.');
  }, [analise]);

  return { exportar, podeExportar: (analise?.series.length ?? 0) > 0 };
};
