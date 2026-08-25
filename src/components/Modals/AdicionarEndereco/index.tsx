/**
 * [VIEW] AdicionarEndereco
 *
 * O QUE FAZ: modal de cadastro e edição de endereço.
 *
 * COMO FARÁ: monta o EnderecoForm dentro da casca de modal. Quando aberto a partir do
 * checkout, exibe também a caixa de incorporar o endereço ao perfil do
 * cliente, como pede a RF0035.
 *
 * ATENDE: RF0026, RF0035, RN0023
 */

'use client';

import Modal from '@/components/Modals';
import EnderecoForm from '@/components/Forms/EnderecoForm/EnderecoForm';
import { Endereco, TipoEndereco } from '@/types/enderecos/types';
import { IEnderecoForm } from '@/validations/EnderecoSchema';

interface AdicionarEnderecoProps {
  aberto: boolean;
  onClose: () => void;
  /** Quando presente, o modal edita em vez de criar. */
  endereco?: Endereco;
  tipoFixo?: TipoEndereco;
  onSubmit: (dados: IEnderecoForm, salvarNoPerfil: boolean) => void;
  isPending?: boolean;
  /** RF0035: acionado a partir do checkout. */
  ofereceSalvarNoPerfil?: boolean;
}

const AdicionarEndereco = ({
  aberto,
  onClose,
  endereco,
  tipoFixo,
  onSubmit,
  isPending,
  ofereceSalvarNoPerfil,
}: AdicionarEnderecoProps) => {
  return (
    <Modal
      aberto={aberto}
      titulo={endereco ? 'Editar endereço' : 'Novo endereço'}
      onClose={onClose}
      largura="grande"
    >
      <EnderecoForm
        endereco={endereco}
        tipoFixo={tipoFixo}
        isPending={isPending}
        ofereceSalvarNoPerfil={ofereceSalvarNoPerfil}
        onCancelar={onClose}
        onSubmit={(dados, salvarNoPerfil) => onSubmit(dados, salvarNoPerfil)}
      />
    </Modal>
  );
};

export default AdicionarEndereco;
