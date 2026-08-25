/**
 * [VIEW] TabelaSkeleton
 *
 * O QUE FAZ: placeholder genérico de tabela, usado nas listagens do admin.
 *
 * COMO FARÁ: recebe o número de colunas e de linhas por prop e desenha as barras
 * cinza correspondentes, servindo às telas de produtos, clientes, estoque,
 * pedidos e trocas.
 *
 * ATENDE: RF0015, RF0024, RNF0011
 */

'use client';

import * as S from './styles';

interface TabelaSkeletonProps {
  colunas?: number;
  linhas?: number;
}

const TabelaSkeleton = ({ colunas = 5, linhas = 6 }: TabelaSkeletonProps) => {
  return (
    <S.Container aria-hidden>
      <S.Linha $colunas={colunas}>
        {Array.from({ length: colunas }, (_, indice) => (
          // eslint-disable-next-line react/no-array-index-key
          <S.Celula key={`cabecalho-${indice}`} $cabecalho />
        ))}
      </S.Linha>

      {Array.from({ length: linhas }, (_, linha) => (
        // eslint-disable-next-line react/no-array-index-key
        <S.Linha key={`linha-${linha}`} $colunas={colunas}>
          {Array.from({ length: colunas }, (_, coluna) => (
            // eslint-disable-next-line react/no-array-index-key
            <S.Celula key={`celula-${linha}-${coluna}`} />
          ))}
        </S.Linha>
      ))}
    </S.Container>
  );
};

export default TabelaSkeleton;
