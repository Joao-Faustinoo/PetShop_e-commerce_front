/**
 * [MODEL] Service da análise gerencial
 *
 * O QUE FAZ: entrega a série de vendas agregada que o gráfico de linhas
 * consome.
 *
 * COMO FARÁ: `fetchAnaliseVendas(filtro)` recorta `mockSeriesVendas` pelo
 * período e pelas categorias pedidas, agregando por mês (RN0071) e
 * preenchendo com zero os meses sem venda para não quebrar a linha
 * (RN0073). Considera apenas pedidos APROVADA, EM_TRANSPORTE e ENTREGUE
 * (RN0074). A validação de intervalo mínimo/máximo é do controller, não
 * daqui.
 *
 * ATENDE: RF0055, RF0057, RN0071, RN0073, RN0074
 */

import { mockSeriesVendas } from '@/mock/analise/mock';
import { mockCategorias } from '@/mock/dominios/mock';
import { mockPedidos } from '@/mock/pedidos/mock';
import { delay } from '@/service/api/delay';
import { STATUS_VENDA_EFETIVADA } from '@/service/pedidos/service';
import { theme } from '@/styles/theme';
import {
  AnaliseFiltro,
  AnaliseVendas,
  SerieCategoria,
} from '@/types/analise/types';

/** RN0071: a granularidade da análise é o mês (MM/AAAA). */
const periodoDe = (dataISO: string): string => {
  const data = new Date(dataISO);

  return `${String(data.getMonth() + 1).padStart(
    2,
    '0',
  )}/${data.getFullYear()}`;
};

/** Lista todos os meses entre as duas datas, inclusive as pontas. */
const periodosEntre = (dataInicio: string, dataFim: string): string[] => {
  const inicio = new Date(`${dataInicio}T00:00:00`);
  const fim = new Date(`${dataFim}T00:00:00`);
  const periodos: string[] = [];

  const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  const ultimo = new Date(fim.getFullYear(), fim.getMonth(), 1);

  while (cursor <= ultimo) {
    periodos.push(
      `${String(cursor.getMonth() + 1).padStart(
        2,
        '0',
      )}/${cursor.getFullYear()}`,
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return periodos;
};

/**
 * Soma, por categoria e por mês, as vendas dos pedidos da sessão. Só
 * entram os status que a RN0074 considera efetivados — REPROVADA e
 * canceladas ficam de fora.
 *
 * Quando um item pertence a mais de uma categoria (RN0012), o valor é
 * rateado entre elas para que o total do período não seja inflado.
 */
const vendasDosPedidos = (): Map<string, number> => {
  const acumulado = new Map<string, number>();

  mockPedidos
    .filter(pedido => STATUS_VENDA_EFETIVADA.includes(pedido.status))
    .forEach(pedido => {
      const periodo = periodoDe(pedido.dataCompra);

      pedido.itens.forEach(item => {
        if (item.categoriaIds.length === 0) return;

        const rateio = item.subtotal / item.categoriaIds.length;

        item.categoriaIds.forEach(categoriaId => {
          const chave = `${categoriaId}|${periodo}`;
          acumulado.set(chave, (acumulado.get(chave) ?? 0) + rateio);
        });
      });
    });

  return acumulado;
};

export const analiseService = {
  fetchAnaliseVendas(filtro: AnaliseFiltro): Promise<AnaliseVendas> {
    const periodos = periodosEntre(filtro.dataInicio, filtro.dataFim);
    const vendasSessao = vendasDosPedidos();

    const categoriasSelecionadas =
      filtro.categoriaIds.length > 0
        ? filtro.categoriaIds
        : mockCategorias.map(c => c.id);

    // RF0057: uma linha por categoria selecionada, comparáveis no mesmo eixo.
    const series: SerieCategoria[] = categoriasSelecionadas.map(
      (categoriaId, indice) => {
        const historico = mockSeriesVendas.find(
          s => s.categoriaId === categoriaId,
        );
        const categoria = mockCategorias.find(c => c.id === categoriaId);

        return {
          categoriaId,
          nome:
            historico?.nome ?? categoria?.nome ?? `Categoria ${categoriaId}`,
          // RNF0043/RNF0045: cor distinta por linha, com legenda.
          cor: historico?.cor ?? theme.chart[indice % theme.chart.length],
          pontos: periodos.map(periodo => {
            const doHistorico =
              historico?.pontos.find(p => p.periodo === periodo)?.valor ?? 0;
            const daSessao = vendasSessao.get(`${categoriaId}|${periodo}`) ?? 0;

            // RN0073: mês sem venda entra como zero e a linha segue contínua.
            return {
              periodo,
              valor: Number((doHistorico + daSessao).toFixed(2)),
            };
          }),
        };
      },
    );

    const total = Number(
      series
        .reduce(
          (soma, serie) => soma + serie.pontos.reduce((s, p) => s + p.valor, 0),
          0,
        )
        .toFixed(2),
    );

    return delay({ series, periodos, total });
  },
};
