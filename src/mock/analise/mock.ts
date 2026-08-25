/**
 * [MODEL] Mock da análise de vendas
 *
 * O QUE FAZ: fornece a série histórica que alimenta o gráfico de linhas
 * do painel gerencial.
 *
 * COMO FARÁ: exporta `mockSeriesVendas` com uma série por categoria
 * cobrindo 24 meses (o máximo permitido pela RN0072), cada uma com cor
 * distinta para a legenda da RNF0045. Meses sem venda vêm com valor zero,
 * mantendo a linha contínua conforme a RN0073. Os valores derivam apenas
 * de pedidos APROVADA, EM_TRANSPORTE e ENTREGUE (RN0074).
 *
 * Esta série é o razão histórico de vendas já consolidado. O
 * analiseService soma a ele as compras de `mockPedidos` que caem na
 * janela consultada, para que uma venda feita durante a sessão apareça
 * no gráfico.
 *
 * ATENDE: RF0055-RF0058, RNF0043-RNF0046, RN0071-RN0074
 */

import { mockCategorias } from '@/mock/dominios/mock';
import { theme } from '@/styles/theme';
import { SerieCategoria } from '@/types/analise/types';

/** RN0072: 24 meses é o intervalo máximo de análise. */
export const MESES_HISTORICO = 24;

/**
 * Rótulos MM/AAAA dos últimos `quantidade` meses, do mais antigo ao mais
 * recente, terminando no mês corrente.
 */
export const periodosRecentes = (quantidade: number): string[] => {
  const hoje = new Date();

  return Array.from({ length: quantidade }, (_, indice) => {
    const data = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - (quantidade - 1 - indice),
      1,
    );

    return `${String(data.getMonth() + 1).padStart(
      2,
      '0',
    )}/${data.getFullYear()}`;
  });
};

/**
 * Gerador congruente linear: mantém os valores estáveis entre recargas,
 * para que o gráfico não mude de forma a cada render.
 */
const geradorPseudoAleatorio = (semente: number) => {
  let estado = semente;

  return (): number => {
    estado = (estado * 1103515245 + 12345) % 2147483648;

    return estado / 2147483648;
  };
};

/** Patamar médio mensal de cada categoria, em reais. */
const patamarPorCategoria: Record<number, number> = {
  1: 9000,
  2: 5200,
  3: 6400,
  4: 3800,
  5: 11000,
};

export const mockSeriesVendas: SerieCategoria[] = mockCategorias.map(
  (categoria, indice) => {
    const sortear = geradorPseudoAleatorio(categoria.id * 7919);
    const patamar = patamarPorCategoria[categoria.id] ?? 4000;

    return {
      categoriaId: categoria.id,
      nome: categoria.nome,
      // RNF0043/RNF0045: uma cor distinta por linha, com legenda.
      cor: theme.chart[indice % theme.chart.length],
      pontos: periodosRecentes(MESES_HISTORICO).map((periodo, mes) => {
        const sazonalidade = 1 + 0.35 * Math.sin((mes / 12) * Math.PI * 2);
        const ruido = 0.7 + sortear() * 0.6;
        // RN0073: alguns meses ficam zerados de propósito, e a linha
        // segue contínua passando pelo zero.
        const semVenda = sortear() < 0.06;

        return {
          periodo,
          valor: semVenda
            ? 0
            : Number((patamar * sazonalidade * ruido).toFixed(2)),
        };
      }),
    };
  },
);
