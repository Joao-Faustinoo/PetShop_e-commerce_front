/**
 * [VIEW] LineChart
 *
 * O QUE FAZ: gráfico de linhas da evolução de vendas por categoria.
 *
 * COMO FARÁ: usa o LineChart do recharts dentro de um ResponsiveContainer. Eixo X com
 * os períodos em mês/ano, eixo Y com os valores em real formatados por
 * formatCurrency e escala automática, uma Line de cor distinta por
 * categoria, Legend na parte inferior e Tooltip exibindo o valor exato do
 * ponto sob o cursor.
 *
 * ATENDE: RNF0043, RNF0044, RNF0045, RNF0046
 */

'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from 'styled-components';

import { AnaliseVendas } from '@/types/analise/types';
import { formatCurrency, formatCurrencyCompact } from '@/utils/formatCurrency';

import * as S from './styles';

interface LineChartProps {
  dados: AnaliseVendas;
}

/** RNF0046: valor exato da categoria no período sob o cursor. */
const TooltipCustomizado = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  return (
    <S.Tooltip>
      <strong>{label}</strong>

      {payload.map(serie => (
        <S.TooltipLinha key={serie.name} $cor={serie.color ?? '#000'}>
          {serie.name}
          <span>{formatCurrency(Number(serie.value ?? 0))}</span>
        </S.TooltipLinha>
      ))}
    </S.Tooltip>
  );
};

const LineChart = ({ dados }: LineChartProps) => {
  const theme = useTheme();

  if (dados.series.length === 0 || dados.periodos.length === 0) {
    return (
      <S.Container>
        <S.Vazio>Nenhuma venda no período selecionado.</S.Vazio>
      </S.Container>
    );
  }

  /**
   * O recharts espera uma linha por ponto do eixo X, com uma chave por
   * série. RN0073: mês sem venda entra como zero, e não como buraco, para
   * a linha seguir contínua.
   */
  const pontos = dados.periodos.map((periodo, indice) => {
    const linha: Record<string, string | number> = { periodo };

    dados.series.forEach(serie => {
      linha[serie.nome] = serie.pontos[indice]?.valor ?? 0;
    });

    return linha;
  });

  return (
    <S.Container>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={pontos}
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.grayf6} />

          {/* RNF0043: eixo X com os períodos em mês/ano. */}
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 12, fill: theme.colors.gray88 }}
            stroke={theme.colors.graydf}
          />

          {/* RNF0044: valores em real, com escala automática. */}
          <YAxis
            tickFormatter={formatCurrencyCompact}
            tick={{ fontSize: 12, fill: theme.colors.gray88 }}
            stroke={theme.colors.graydf}
            width={90}
          />

          <Tooltip content={<TooltipCustomizado />} />

          {/* RNF0045: legenda na parte inferior identificando cada linha. */}
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '0.85rem', paddingTop: '0.75rem' }}
          />

          {/* RNF0043: uma linha de cor distinta por categoria. */}
          {dados.series.map(serie => (
            <Line
              key={serie.categoriaId}
              type="monotone"
              dataKey={serie.nome}
              name={serie.nome}
              stroke={serie.cor}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </S.Container>
  );
};

export default LineChart;
