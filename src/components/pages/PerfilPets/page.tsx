/**
 * [VIEW] Tela: Meus pets
 *
 * O QUE FAZ: lista, cadastra, edita e remove os pets do cliente.
 *
 * COMO FARÁ: consome o usePetsController e renderiza a grade de PetCard com nome,
 * espécie, raça e porte. O formulário abre em modal com o PetForm. Os
 * dados daqui alimentam a recomendação de tamanho do assistente.
 *
 * ATENDE: RF0028, RF0029, RN0029, RNF0047
 */

'use client';

import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import PetCard from '@/components/Cards/PetCard';
import PetForm from '@/components/Forms/PetForm/PetForm';
import Modal from '@/components/Modals';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import { usePetsController } from '@/controllers/pets/usePetsController';
import { useAuth } from '@/hooks/useAuth';
import { Especie, PorteSigla } from '@/types/dominios/types';
import { Pet } from '@/types/pets/types';

import * as S from './styles';

const PerfilPets = () => {
  const { user } = useAuth();
  const { pets, criar, alterar, remover, isPending, isLoading } =
    usePetsController(user?.clienteId);

  const { propsDoModal, pedirConfirmacao } = useConfirmacao();
  const [modalAberto, setModalAberto] = useState(false);
  const [petEmEdicao, setPetEmEdicao] = useState<Pet>();

  const fechar = () => {
    setModalAberto(false);
    setPetEmEdicao(undefined);
  };

  const abrirEdicao = (pet: Pet) => {
    setPetEmEdicao(pet);
    setModalAberto(true);
  };

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Meus pets</h1>
          <p>Cadastre seus pets para receber sugestões de tamanho certeiras</p>
        </S.Titulo>

        <PrimaryButton
          label="Cadastrar pet"
          icon={<FiPlus size={16} />}
          onClick={() => setModalAberto(true)}
        />
      </S.Cabecalho>

      {isLoading ? (
        <S.Vazio>
          <strong>Carregando pets...</strong>
        </S.Vazio>
      ) : pets.length === 0 ? (
        <S.Vazio>
          <strong>Nenhum pet cadastrado</strong>
          <p>
            Com os dados do seu pet — espécie, raça e porte — o assistente
            consegue indicar o tamanho adequado de cada peça.
          </p>
        </S.Vazio>
      ) : (
        <S.Grade $minimo="19rem">
          {pets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEditar={abrirEdicao}
              onRemover={alvo =>
                pedirConfirmacao({
                  variante: 'perigo',
                  titulo: 'Remover pet',
                  mensagem: `${alvo.nome} será apagado do seu cadastro. O assistente deixa de usar o porte e a espécie dele nas recomendações.`,
                  rotuloConfirmar: 'Remover',
                  aoConfirmar: () => remover(alvo.id),
                })
              }
            />
          ))}
        </S.Grade>
      )}

      <Modal
        aberto={modalAberto}
        titulo={petEmEdicao ? `Editar ${petEmEdicao.nome}` : 'Novo pet'}
        onClose={fechar}
      >
        <PetForm
          pet={petEmEdicao}
          isPending={isPending}
          onCancelar={fechar}
          onSubmit={dados => {
            const payload = {
              nome: dados.nome,
              especie: dados.especie as Especie,
              raca: dados.raca,
              porte: dados.porte as PorteSigla,
              peso: dados.peso,
            };

            if (petEmEdicao) {
              alterar(
                {
                  ...payload,
                  id: petEmEdicao.id,
                  clienteId: petEmEdicao.clienteId,
                },
                { onSuccess: fechar },
              );
            } else {
              criar(payload, { onSuccess: fechar });
            }
          }}
        />
      </Modal>

      <ModalConfirmacao {...propsDoModal} />
    </S.Container>
  );
};

export default PerfilPets;
