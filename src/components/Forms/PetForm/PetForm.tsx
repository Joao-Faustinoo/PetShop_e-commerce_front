/**
 * [VIEW] PetForm
 *
 * O QUE FAZ: formulário de cadastro e alteração de pet.
 *
 * COMO FARÁ: react-hook-form com o PetSchema. Campos de nome, espécie (cão, gato ou
 * outro), raça e porte/peso, todos obrigatórios, sempre vinculados ao
 * cliente da sessão.
 *
 * ATENDE: RF0028, RF0029, RN0029
 */

'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { Pet } from '@/types/pets/types';
import { IPetForm, PetSchema } from '@/validations/PetSchema';

import * as S from './styles';

interface PetFormProps {
  /** Quando presente, o formulário entra em modo de alteração (RF0029). */
  pet?: Pet;
  onSubmit: (dados: IPetForm) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

const PetForm = ({ pet, onSubmit, onCancelar, isPending }: PetFormProps) => {
  const { especies, portes } = useDominiosController();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IPetForm>({
    resolver: yupResolver(PetSchema),
    defaultValues: {
      nome: pet?.nome ?? '',
      especie: pet?.especie ?? 'CAO',
      raca: pet?.raca ?? '',
      porte: pet?.porte ?? 'M',
      peso: pet?.peso ?? undefined,
    },
  });

  return (
    <S.Form id="pet-form" onSubmit={handleSubmit(onSubmit)}>
      <S.Grid>
        <S.Campo $span={2}>
          <S.Label htmlFor="nome">Nome do pet</S.Label>
          <S.Input
            id="nome"
            placeholder="Ex.: Thor"
            $erro={!!errors.nome}
            {...register('nome')}
          />
          {errors.nome && <S.Erro>{errors.nome.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="especie">Espécie</S.Label>
          <S.Select
            id="especie"
            $erro={!!errors.especie}
            {...register('especie')}
          >
            {especies.map(especie => (
              <option key={especie.value} value={especie.value}>
                {especie.label}
              </option>
            ))}
          </S.Select>
          {errors.especie && <S.Erro>{errors.especie.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="raca">Raça</S.Label>
          <S.Input
            id="raca"
            placeholder="Ex.: Golden Retriever"
            $erro={!!errors.raca}
            {...register('raca')}
          />
          {errors.raca && <S.Erro>{errors.raca.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="porte">Porte</S.Label>
          <S.Select id="porte" $erro={!!errors.porte} {...register('porte')}>
            {portes.map(porte => (
              <option key={porte.id} value={porte.sigla}>
                {porte.nome}
              </option>
            ))}
          </S.Select>
          {errors.porte && <S.Erro>{errors.porte.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="peso">Peso (kg)</S.Label>
          <S.Input
            id="peso"
            type="number"
            step="0.1"
            placeholder="Ex.: 12.5"
            $erro={!!errors.peso}
            {...register('peso')}
          />
          {errors.peso && <S.Erro>{errors.peso.message}</S.Erro>}
        </S.Campo>
      </S.Grid>

      {/* O porte informado aqui é o que o assistente usa para sugerir tamanho. */}
      <S.Aviso>
        Esses dados alimentam a recomendação de tamanho do assistente da loja.
      </S.Aviso>

      <S.Acoes>
        <SecondaryButton label="Cancelar" onClick={onCancelar} />
        <PrimaryButton
          type="submit"
          label={pet ? 'Salvar alterações' : 'Cadastrar pet'}
          loading={isPending}
        />
      </S.Acoes>
    </S.Form>
  );
};

export default PetForm;
