import styled, { css } from 'styled-components';

/**
 * Declarado aqui, e não no index, porque é o styled-component que o
 * consome — importá-lo de volta do index criaria ciclo entre os dois.
 */
export type VarianteImagem = 'miniatura' | 'card' | 'detalhe';

const alturaDaFonte: Record<VarianteImagem, string> = {
  miniatura: '1.75rem',
  card: '3rem',
  detalhe: '7rem',
};

/**
 * Moldura da imagem. Precisa de `position: relative` porque o `next/image`
 * usa `fill`, que se posiciona em relação ao ancestral posicionado mais
 * próximo — sem isso a imagem escapa e cobre a tela inteira.
 */
export const Moldura = styled.div<{ $variante: VarianteImagem }>`
  ${({ theme, $variante }) => css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-size: ${alturaDaFonte[$variante]};
    background: ${theme.colors.grayf6};

    img {
      /* Recorta em vez de distorcer: as fotos são quadradas, as molduras não. */
      object-fit: cover;
    }
  `}
`;
