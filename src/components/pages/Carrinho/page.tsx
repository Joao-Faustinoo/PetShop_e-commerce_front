/**
 * [VIEW] Tela: Carrinho
 *
 * O QUE FAZ: lista os itens do carrinho, permite editar quantidade e remover itens.
 *
 * COMO FARÁ: consome o useCarrinhoController para a lista e o useBloqueioItemController
 * para o cronômetro de bloqueio. Exibe em bloco separado os itens removidos
 * por expiração e, enquanto houver algum, desabilita o botão de comprar,
 * oferecendo readicioná-los (RNF0042). Mostra subtotal e total.
 *
 * ATENDE: RF0031, RF0032, RN0031, RN0032, RN0044, RN0045, RNF0042
 */

'use client';

import { useRouter } from 'next/navigation';
import { FiClock, FiRotateCcw, FiTrash2 } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import ResumoCard from '@/components/Cards/ResumoCard';
import ImagemProduto from '@/components/Cards/ImagemProduto';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import QuantidadeInput from '@/components/Inputs/QuantidadeInput/input';
import { useBloqueioItemController } from '@/controllers/carrinho/useBloqueioItemController';
import { useCarrinhoController } from '@/controllers/carrinho/useCarrinhoController';
import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

const Carrinho = () => {
  const router = useRouter();

  const {
    itens,
    itensRemovidos,
    subtotal,
    total,
    compraBloqueada,
    alterarQuantidade,
    removerItem,
    restaurarItem,
    isLoading,
    isPending,
  } = useCarrinhoController();

  // RN0044: cronômetro do bloqueio, contado da última inclusão.
  const { tempoFormatado, proximoDoFim } = useBloqueioItemController(itens);
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();

  if (isLoading) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando carrinho...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Carrinho</h1>
          <p>{itens.length} produto(s) reservado(s) para você</p>
        </S.Titulo>
      </S.Cabecalho>

      {/* RN0044: o usuário vê quanto tempo resta da reserva. */}
      {tempoFormatado && itens.length > 0 && (
        <S.Cronometro $alerta={proximoDoFim}>
          <FiClock size={16} />
          Seus itens ficam reservados por mais <strong>{tempoFormatado}</strong>
          . Depois desse prazo eles voltam a ficar disponíveis para outros
          clientes.
        </S.Cronometro>
      )}

      {/* RNF0042: os itens expirados continuam listados abaixo. */}
      {itensRemovidos.length > 0 && (
        <S.Alerta $tipo="alerta">
          Alguns itens saíram do carrinho porque o prazo de reserva expirou.
          {compraBloqueada
            ? ' Adicione-os novamente para poder finalizar a compra.'
            : ' Você pode adicioná-los de novo ou seguir com o restante da compra.'}
        </S.Alerta>
      )}

      {itens.length === 0 && itensRemovidos.length === 0 ? (
        <S.Vazio>
          <strong>Seu carrinho está vazio</strong>
          <p>Explore o catálogo e escolha as peças ideais para o seu pet.</p>
          <SecondaryButton
            label="Ir para o catálogo"
            onClick={() => router.push('/produtos')}
          />
        </S.Vazio>
      ) : (
        <S.DuasColunas>
          <div>
            <S.Lista>
              {itens.map(item => (
                <S.Item key={item.produto.id}>
                  <S.Miniatura>
                    <ImagemProduto
                      nome={item.produto.nome}
                      especie={item.produto.especie}
                      imagem={item.produto.imagem}
                      variante="miniatura"
                    />
                  </S.Miniatura>

                  <S.ItemDados>
                    <strong>{item.produto.nome}</strong>
                    <small>
                      {item.produto.sku} · {formatCurrency(item.valorUnitario)}{' '}
                      cada
                    </small>
                  </S.ItemDados>

                  {/* RF0032/RN0031: quantidade limitada ao saldo em estoque. */}
                  <QuantidadeInput
                    value={item.quantidade}
                    max={item.produto.quantidadeEstoque}
                    disabled={isPending}
                    onChange={quantidade =>
                      alterarQuantidade({
                        produtoId: item.produto.id,
                        quantidade,
                      })
                    }
                  />

                  <S.Subtotal>{formatCurrency(item.subtotal)}</S.Subtotal>

                  <S.BotaoIcone
                    type="button"
                    $danger
                    aria-label={`Remover ${item.produto.nome}`}
                    disabled={isPending}
                    onClick={() =>
                      pedirConfirmacao({
                        variante: 'perigo',
                        titulo: 'Remover do carrinho',
                        mensagem: `${item.produto.nome} sai do carrinho e a reserva das unidades é liberada para outros clientes.`,
                        rotuloConfirmar: 'Remover',
                        aoConfirmar: () => removerItem(item.produto.id),
                      })
                    }
                  >
                    <FiTrash2 size={17} />
                  </S.BotaoIcone>
                </S.Item>
              ))}
            </S.Lista>

            {/* RNF0042: itens retirados por expiração continuam visíveis. */}
            {itensRemovidos.length > 0 && (
              <S.Removidos>
                <S.TituloSecao>Itens removidos por expiração</S.TituloSecao>

                <S.Lista>
                  {itensRemovidos.map(item => (
                    <S.Item key={item.produto.id} $expirado>
                      <S.Miniatura>
                        <ImagemProduto
                          nome={item.produto.nome}
                          especie={item.produto.especie}
                          imagem={item.produto.imagem}
                          variante="miniatura"
                        />
                      </S.Miniatura>

                      <S.ItemDados>
                        <strong>{item.produto.nome}</strong>
                        <small>{item.quantidade}× · reserva expirada</small>
                      </S.ItemDados>

                      <S.Subtotal>{formatCurrency(item.subtotal)}</S.Subtotal>

                      <SecondaryButton
                        label="Adicionar de novo"
                        icon={<FiRotateCcw size={15} />}
                        onClick={() => restaurarItem(item.produto.id)}
                      />
                    </S.Item>
                  ))}
                </S.Lista>
              </S.Removidos>
            )}
          </div>

          <ResumoCard
            subtotal={subtotal}
            total={total}
            acoes={
              <>
                <PrimaryButton
                  label="Finalizar compra"
                  full
                  disabled={compraBloqueada || itens.length === 0}
                  onClick={() => router.push('/checkout')}
                />
                <SecondaryButton
                  label="Continuar comprando"
                  full
                  onClick={() => router.push('/produtos')}
                />
              </>
            }
          />
        </S.DuasColunas>
      )}

      <ModalConfirmacao {...propsDoModal} />
    </S.Container>
  );
};

export default Carrinho;
