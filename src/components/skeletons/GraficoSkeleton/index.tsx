/**
 * [VIEW] GraficoSkeleton
 *
 * O QUE FAZ: placeholder do gráfico gerencial enquanto a análise carrega.
 *
 * COMO FARÁ: desenha a moldura dos eixos e uma área cinza no lugar das linhas,
 * preservando a altura do LineChart.
 *
 * ATENDE: RF0055, RNF0043
 */

'use client';

import * as S from './styles';

const GraficoSkeleton = () => {
  return (
    <S.Container aria-hidden>
      <S.EixoY>
        {Array.from({ length: 5 }, (_, indice) => (
          // eslint-disable-next-line react/no-array-index-key
          <S.Marca key={`y-${indice}`} $largura="3.5rem" />
        ))}
      </S.EixoY>

      <S.Area />

      <S.EixoX>
        {Array.from({ length: 8 }, (_, indice) => (
          // eslint-disable-next-line react/no-array-index-key
          <S.Marca key={`x-${indice}`} $largura="2.5rem" />
        ))}
      </S.EixoX>
    </S.Container>
  );
};

export default GraficoSkeleton;
