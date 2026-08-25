/**
 * [VIEW] ProdutoCard
 *
 * O QUE FAZ: cartão de produto usado na vitrine, nas sugestões do assistente e nos
 * resultados de busca.
 *
 * COMO FARÁ: recebe um Produto por prop e exibe imagem, nome, marca, porte, preço
 * formatado em real e o selo de indisponível quando não há saldo. Clicar
 * leva ao detalhe do produto.
 *
 * ATENDE: RF0015, RN0031
 */

'use client';

import ImagemProduto from '@/components/Cards/ImagemProduto';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { Produto } from '@/types/produtos/types';
import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

interface ProdutoCardProps {
  produto: Produto;
}

const ProdutoCard = ({ produto }: ProdutoCardProps) => {
  const { marcas, cores } = useDominiosController();

  // RN0031: sem saldo o produto aparece, mas marcado como indisponível.
  const indisponivel = produto.quantidadeEstoque === 0;

  return (
    <S.Card href={`/produtos/${produto.id}`} $indisponivel={indisponivel}>
      <S.Imagem>
        <ImagemProduto
          nome={produto.nome}
          especie={produto.especie}
          imagem={produto.imagem}
          variante="card"
        />
      </S.Imagem>

      {indisponivel && <S.Selo>Sem estoque</S.Selo>}

      <S.Conteudo>
        <S.Marca>{nomeDoDominio(marcas, produto.marcaId)}</S.Marca>
        <S.Nome>{produto.nome}</S.Nome>

        <S.Atributos>
          Porte {produto.porte} · {nomeDoDominio(cores, produto.corId)}
        </S.Atributos>

        <S.Preco>{formatCurrency(produto.valorVenda)}</S.Preco>
      </S.Conteudo>
    </S.Card>
  );
};

export default ProdutoCard;
