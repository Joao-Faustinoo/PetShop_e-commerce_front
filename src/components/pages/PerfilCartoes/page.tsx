/**
 * [VIEW] Tela: Meus cartões
 *
 * O QUE FAZ: lista, adiciona, edita e remove cartões, e define o preferencial.
 *
 * COMO FARÁ: consome o useCartoesController. Mostra os números mascarados e a bandeira,
 * com uma marcação clara no cartão preferencial e a ação de trocá-lo. O
 * cadastro abre o modal AdicionarCartao.
 *
 * ATENDE: RF0027, RN0024, RN0025
 */

'use client';

import { useState } from 'react';
import { FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import AdicionarCartao from '@/components/Modals/AdicionarCartao';
import { useCartoesController } from '@/controllers/cartoes/useCartoesController';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { useAuth } from '@/hooks/useAuth';
import { mascararCartao } from '@/utils/masks';

import * as S from './styles';

const PerfilCartoes = () => {
  const { user } = useAuth();
  const { bandeiras } = useDominiosController();
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();
  const { cartoes, criar, remover, definirPreferencial, isPending, isLoading } =
    useCartoesController(user?.clienteId);

  const [modalAberto, setModalAberto] = useState(false);

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Meus cartões</h1>
          <p>Cartões salvos para agilizar o checkout</p>
        </S.Titulo>

        <PrimaryButton
          label="Novo cartão"
          icon={<FiPlus size={16} />}
          onClick={() => setModalAberto(true)}
        />
      </S.Cabecalho>

      {isLoading ? (
        <S.Vazio>
          <strong>Carregando cartões...</strong>
        </S.Vazio>
      ) : cartoes.length === 0 ? (
        <S.Vazio>
          <strong>Nenhum cartão cadastrado</strong>
          <p>
            Salve um cartão para não precisar digitar os dados a cada compra.
          </p>
        </S.Vazio>
      ) : (
        <S.Grade $minimo="20rem">
          {cartoes.map(cartao => (
            <S.Cartao key={cartao.id} $preferencial={cartao.preferencial}>
              <S.Topo>
                <strong>{mascararCartao(cartao.numero)}</strong>

                {/* RF0027: exatamente um preferencial por cliente. */}
                {cartao.preferencial && <S.Selo>Preferencial</S.Selo>}

                <div>
                  {!cartao.preferencial && (
                    <S.BotaoIcone
                      type="button"
                      aria-label="Definir como preferencial"
                      disabled={isPending}
                      onClick={() => definirPreferencial(cartao.id)}
                    >
                      <FiStar size={16} />
                    </S.BotaoIcone>
                  )}

                  <S.BotaoIcone
                    type="button"
                    $danger
                    aria-label="Remover cartão"
                    disabled={isPending}
                    onClick={() =>
                      pedirConfirmacao({
                        variante: 'perigo',
                        titulo: 'Remover cartão',
                        mensagem: `O cartão final ${cartao.numero.slice(
                          -4,
                        )} será apagado da sua conta. Compras já feitas com ele não são afetadas.`,
                        rotuloConfirmar: 'Remover',
                        aoConfirmar: () => remover(cartao.id),
                      })
                    }
                  >
                    <FiTrash2 size={16} />
                  </S.BotaoIcone>
                </div>
              </S.Topo>

              <S.CartaoDados>
                {cartao.nomeImpresso}
                <br />
                {nomeDoDominio(bandeiras, cartao.bandeiraId)}
              </S.CartaoDados>
            </S.Cartao>
          ))}
        </S.Grade>
      )}

      <AdicionarCartao
        aberto={modalAberto}
        isPending={isPending}
        onClose={() => setModalAberto(false)}
        onSubmit={dados =>
          criar(dados, { onSuccess: () => setModalAberto(false) })
        }
      />

      <ModalConfirmacao {...propsDoModal} />
    </S.Container>
  );
};

export default PerfilCartoes;
