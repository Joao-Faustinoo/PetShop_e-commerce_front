/**
 * [VIEW] PetCard
 *
 * O QUE FAZ: cartão de pet exibido no perfil do cliente.
 *
 * COMO FARÁ: recebe um Pet por prop e exibe nome, espécie, raça e porte, com as ações
 * de editar e remover.
 *
 * ATENDE: RF0028, RF0029
 */

'use client';

import { FiEdit2, FiTrash2 } from 'react-icons/fi';

import { Especie } from '@/types/dominios/types';
import { Pet } from '@/types/pets/types';

import * as S from './styles';

interface PetCardProps {
  pet: Pet;
  onEditar: (pet: Pet) => void;
  onRemover: (pet: Pet) => void;
}

const emojiDaEspecie: Record<Especie, string> = {
  CAO: '🐶',
  GATO: '🐱',
  OUTRO: '🐾',
};

const rotuloDaEspecie: Record<Especie, string> = {
  CAO: 'Cão',
  GATO: 'Gato',
  OUTRO: 'Outro',
};

const PetCard = ({ pet, onEditar, onRemover }: PetCardProps) => {
  return (
    <S.Card>
      <S.Avatar aria-hidden>{emojiDaEspecie[pet.especie]}</S.Avatar>

      <S.Dados>
        <strong>{pet.nome}</strong>
        <small>
          {rotuloDaEspecie[pet.especie]} · {pet.raca}
        </small>
        <small>
          Porte {pet.porte} · {pet.peso} kg
        </small>
      </S.Dados>

      <S.Acoes>
        <S.Acao
          type="button"
          aria-label={`Editar ${pet.nome}`}
          onClick={() => onEditar(pet)}
        >
          <FiEdit2 size={17} />
        </S.Acao>

        <S.Acao
          type="button"
          $danger
          aria-label={`Remover ${pet.nome}`}
          onClick={() => onRemover(pet)}
        >
          <FiTrash2 size={17} />
        </S.Acao>
      </S.Acoes>
    </S.Card>
  );
};

export default PetCard;
