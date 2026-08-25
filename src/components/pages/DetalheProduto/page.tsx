/**
 * [VIEW] Tela: Detalhe do produto
 *
 * O QUE FAZ: exibe um produto e permite escolher a quantidade e mandar para o carrinho.
 *
 * COMO FARÁ: lê o id da rota, consome o useProdutoController e mostra imagens, ficha
 * técnica e dimensões. O seletor de quantidade é limitado ao saldo em
 * estoque e o botão de comprar fica desabilitado sem saldo (RN0031).
 *
 * ATENDE: RF0015, RF0031, RF0032, RN0031
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';

import ImagemProduto from '@/components/Cards/ImagemProduto';
import PrimaryButton from '@/components/Buttons/Primary/button';
import QuantidadeInput from '@/components/Inputs/QuantidadeInput/input';
import { useCarrinhoController } from '@/controllers/carrinho/useCarrinhoController';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { useProdutoController } from '@/controllers/produtos/useProdutoController';
import { Especie } from '@/types/dominios/types';
import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

const rotuloDaEspecie: Record<Especie, string> = {
  CAO: 'Cão',
  GATO: 'Gato',
  OUTRO: 'Outro',
};

const DetalheProduto = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { produto, podeComprar, saldoDisponivel, isLoading } =
    useProdutoController(Number(id));
  const { marcas, categorias, cores, materiais } = useDominiosController();
  const { adicionarItem, isPending } = useCarrinhoController();

  const [quantidade, setQuantidade] = useState(1);

  if (isLoading) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando produto...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  if (!produto) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Produto não encontrado</strong>
          <p>
            O produto que você procura não está mais disponível no catálogo.
          </p>
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Voltar type="button" onClick={() => router.push('/produtos')}>
        <FiArrowLeft size={16} /> Voltar ao catálogo
      </S.Voltar>

      <S.Conteudo>
        <S.Imagem>
          <ImagemProduto
            nome={produto.nome}
            especie={produto.especie}
            imagem={produto.imagem}
            variante="detalhe"
            prioritaria
          />
        </S.Imagem>

        <S.Info>
          <S.Marca>{nomeDoDominio(marcas, produto.marcaId)}</S.Marca>
          <S.Nome>{produto.nome}</S.Nome>
          <S.Preco>{formatCurrency(produto.valorVenda)}</S.Preco>
          <S.Descricao>{produto.descricao}</S.Descricao>

          {/* RN0031: sem saldo, não dá para adicionar ao carrinho. */}
          {!podeComprar && (
            <S.Alerta $tipo="alerta">
              Este produto está sem estoque no momento.
            </S.Alerta>
          )}

          <S.Compra>
            <QuantidadeInput
              value={quantidade}
              onChange={setQuantidade}
              max={saldoDisponivel}
              disabled={!podeComprar}
              mostrarLimite
            />

            <PrimaryButton
              label="Adicionar ao carrinho"
              icon={<FiShoppingCart size={17} />}
              loading={isPending}
              disabled={!podeComprar}
              onClick={() =>
                adicionarItem({ produtoId: produto.id, quantidade })
              }
            />
          </S.Compra>

          <S.Ficha>
            <S.TituloSecao>Ficha técnica</S.TituloSecao>

            <S.Dados>
              <div>
                <dt>Código (SKU)</dt>
                <dd>{produto.sku}</dd>
              </div>
              <div>
                <dt>Espécie de destino</dt>
                <dd>{rotuloDaEspecie[produto.especie]}</dd>
              </div>
              <div>
                <dt>Porte / tamanho</dt>
                <dd>{produto.porte}</dd>
              </div>
              <div>
                <dt>Categorias</dt>
                <dd>
                  {produto.categoriaIds
                    .map(categoriaId => nomeDoDominio(categorias, categoriaId))
                    .join(', ')}
                </dd>
              </div>
              <div>
                <dt>Cor</dt>
                <dd>{nomeDoDominio(cores, produto.corId)}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{nomeDoDominio(materiais, produto.materialId)}</dd>
              </div>
              <div>
                <dt>Dimensões (A × L × P)</dt>
                <dd>
                  {produto.dimensoes.altura} × {produto.dimensoes.largura} ×{' '}
                  {produto.dimensoes.profundidade} cm
                </dd>
              </div>
              <div>
                <dt>Peso</dt>
                <dd>{produto.dimensoes.peso} kg</dd>
              </div>
              <div>
                <dt>Código de barras</dt>
                <dd>{produto.codigoBarras}</dd>
              </div>
            </S.Dados>
          </S.Ficha>
        </S.Info>
      </S.Conteudo>
    </S.Container>
  );
};

export default DetalheProduto;
