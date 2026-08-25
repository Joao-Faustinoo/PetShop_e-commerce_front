/**
 * [VIEW] CatalogoSkeleton
 *
 * O QUE FAZ: placeholder da grade de produtos enquanto a consulta carrega.
 *
 * COMO FARÁ: repete blocos cinza no formato do ProdutoCard com animação de shimmer,
 * mantendo a altura da grade estável e evitando o pulo de layout.
 *
 * ATENDE: RF0015, RNF0011
 */

'use client';

import * as S from './styles';

interface CatalogoSkeletonProps {
  quantidade?: number;
}

const CatalogoSkeleton = ({ quantidade = 8 }: CatalogoSkeletonProps) => {
  return (
    <S.Grid aria-hidden>
      {Array.from({ length: quantidade }, (_, indice) => (
        // eslint-disable-next-line react/no-array-index-key
        <S.Card key={indice}>
          <S.Bloco $altura="10rem" />
          <S.Bloco $altura="1rem" $largura="80%" />
          <S.Bloco $altura="0.75rem" $largura="55%" />
          <S.Bloco $altura="1.5rem" $largura="40%" />
        </S.Card>
      ))}
    </S.Grid>
  );
};

export default CatalogoSkeleton;
