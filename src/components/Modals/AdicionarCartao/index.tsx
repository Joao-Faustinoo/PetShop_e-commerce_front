/**
 * [VIEW] AdicionarCartao
 *
 * O QUE FAZ: modal de cadastro e edição de cartão de crédito.
 *
 * COMO FARÁ: monta o CartaoForm dentro da casca de modal. Quando aberto a partir do
 * checkout, exibe a caixa de incorporar o cartão ao perfil, como pede a
 * RF0036.
 *
 * ATENDE: RF0027, RF0036, RN0024, RN0025
 */

'use client';

import Modal from '@/components/Modals';
import CartaoForm from '@/components/Forms/CartaoForm/CartaoForm';
import { Cartao } from '@/types/cartoes/types';
import { ICartaoForm } from '@/validations/CartaoSchema';

interface AdicionarCartaoProps {
  aberto: boolean;
  onClose: () => void;
  /** Quando presente, o modal edita em vez de criar. */
  cartao?: Cartao;
  onSubmit: (dados: ICartaoForm, salvarNoPerfil: boolean) => void;
  isPending?: boolean;
  /** RF0036: acionado a partir do checkout. */
  ofereceSalvarNoPerfil?: boolean;
}

const AdicionarCartao = ({
  aberto,
  onClose,
  cartao,
  onSubmit,
  isPending,
  ofereceSalvarNoPerfil,
}: AdicionarCartaoProps) => {
  return (
    <Modal
      aberto={aberto}
      titulo={cartao ? 'Editar cartão' : 'Novo cartão de crédito'}
      onClose={onClose}
    >
      <CartaoForm
        cartao={cartao}
        isPending={isPending}
        ofereceSalvarNoPerfil={ofereceSalvarNoPerfil}
        onCancelar={onClose}
        onSubmit={(dados, salvarNoPerfil) => onSubmit(dados, salvarNoPerfil)}
      />
    </Modal>
  );
};

export default AdicionarCartao;
