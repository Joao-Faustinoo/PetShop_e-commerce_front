/**
 * [VIEW] ImagemProduto
 *
 * O QUE FAZ: mostra a foto de um produto onde antes havia só o emoji da
 * espécie — no card do catálogo, no detalhe e na miniatura do carrinho.
 *
 * COMO FARÁ: o caminho vem do próprio produto (`imagem`), preenchido a
 * partir do SKU. Usa `next/image` com `fill` para que o otimizador
 * entregue WebP no tamanho da variante: os arquivos originais têm mais de
 * 2 MB e o catálogo mostra 18 de uma vez. Se o arquivo não existir — caso
 * de produto cadastrado depois, cujo SKU ainda não tem foto — cai para o
 * emoji da espécie, que era o visual anterior. Concentra aqui o mapa de
 * emojis que antes estava duplicado em três telas.
 *
 * ATENDE: apoio às telas de produto (RF0031, RF0032)
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Especie } from '@/types/dominios/types';

import * as S from './styles';
import { VarianteImagem } from './styles';

export type { VarianteImagem };

/** Fallback quando o produto não tem arquivo de imagem. */
const emojiDaEspecie: Record<Especie, string> = {
  CAO: '🐶',
  GATO: '🐱',
  OUTRO: '🐾',
};

/**
 * Quanto do viewport a imagem ocupa em cada variante. Sem isto o Next
 * assume 100vw e baixa um arquivo maior do que o necessário.
 */
const tamanhos: Record<VarianteImagem, string> = {
  miniatura: '64px',
  card: '(max-width: 768px) 50vw, 15rem',
  detalhe: '(max-width: 900px) 100vw, 640px',
};

interface ImagemProdutoProps {
  nome: string;
  especie: Especie;
  variante: VarianteImagem;
  imagem?: string;
  /** Só o detalhe do produto carrega imagem grande acima da dobra. */
  prioritaria?: boolean;
}

const ImagemProduto = ({
  nome,
  especie,
  variante,
  imagem,
  prioritaria = false,
}: ImagemProdutoProps) => {
  const [falhou, setFalhou] = useState(false);

  const mostrarEmoji = !imagem || falhou;

  return (
    <S.Moldura $variante={variante} aria-hidden={mostrarEmoji}>
      {mostrarEmoji ? (
        emojiDaEspecie[especie]
      ) : (
        <Image
          src={imagem}
          alt={nome}
          fill
          sizes={tamanhos[variante]}
          priority={prioritaria}
          onError={() => setFalhou(true)}
        />
      )}
    </S.Moldura>
  );
};

export default ImagemProduto;
