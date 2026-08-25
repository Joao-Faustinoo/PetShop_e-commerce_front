/**
 * [VIEW] CartaoForm
 *
 * O QUE FAZ: formulário de cartão de crédito.
 *
 * COMO FARÁ: react-hook-form com o CartaoSchema. Campos de número (mascarado), nome
 * impresso, bandeira (select vindo das tabelas de domínio) e código de
 * segurança, mais a marcação de preferencial. Usado no perfil e no
 * checkout, onde ganha a caixa de salvar no perfil.
 *
 * ATENDE: RF0027, RF0036, RN0024, RN0025
 */

'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { Cartao } from '@/types/cartoes/types';
import { maskCartao, maskCVV } from '@/utils/masks';
import { CartaoSchema, ICartaoForm } from '@/validations/CartaoSchema';

import * as S from './styles';

interface CartaoFormProps {
  cartao?: Cartao;
  onSubmit: (dados: ICartaoForm, salvarNoPerfil: boolean) => void;
  onCancelar: () => void;
  isPending?: boolean;
  /** RF0036: no checkout, oferece incorporar o cartão ao perfil. */
  ofereceSalvarNoPerfil?: boolean;
}

const CartaoForm = ({
  cartao,
  onSubmit,
  onCancelar,
  isPending,
  ofereceSalvarNoPerfil = false,
}: CartaoFormProps) => {
  const { bandeiras } = useDominiosController();
  const [salvarNoPerfil, setSalvarNoPerfil] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ICartaoForm>({
    resolver: yupResolver(CartaoSchema),
    defaultValues: {
      numero: cartao?.numero ?? '',
      nomeImpresso: cartao?.nomeImpresso ?? '',
      bandeiraId: cartao?.bandeiraId ?? bandeiras[0]?.id ?? 1,
      codigoSeguranca: cartao?.codigoSeguranca ?? '',
      preferencial: cartao?.preferencial ?? false,
    },
  });

  return (
    <S.Form
      id="cartao-form"
      onSubmit={handleSubmit(dados => onSubmit(dados, salvarNoPerfil))}
    >
      <S.Grid>
        {/* RN0024: número, nome impresso, bandeira e código de segurança. */}
        <S.Campo $span={2}>
          <S.Label htmlFor="numero">Número do cartão</S.Label>
          <Controller
            name="numero"
            control={control}
            render={({ field }) => (
              <S.Input
                id="numero"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                $erro={!!errors.numero}
                value={maskCartao(field.value ?? '')}
                onChange={evento => field.onChange(evento.target.value)}
              />
            )}
          />
          {errors.numero && <S.Erro>{errors.numero.message}</S.Erro>}
        </S.Campo>

        <S.Campo $span={2}>
          <S.Label htmlFor="nomeImpresso">Nome impresso no cartão</S.Label>
          <S.Input
            id="nomeImpresso"
            placeholder="Como está gravado no cartão"
            $erro={!!errors.nomeImpresso}
            {...register('nomeImpresso')}
          />
          {errors.nomeImpresso && (
            <S.Erro>{errors.nomeImpresso.message}</S.Erro>
          )}
        </S.Campo>

        {/* RN0025: só bandeiras registradas nas tabelas de domínio. */}
        <S.Campo>
          <S.Label htmlFor="bandeiraId">Bandeira</S.Label>
          <S.Select
            id="bandeiraId"
            $erro={!!errors.bandeiraId}
            {...register('bandeiraId')}
          >
            {bandeiras.map(bandeira => (
              <option key={bandeira.id} value={bandeira.id}>
                {bandeira.nome}
              </option>
            ))}
          </S.Select>
          {errors.bandeiraId && <S.Erro>{errors.bandeiraId.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="codigoSeguranca">Código de segurança</S.Label>
          <Controller
            name="codigoSeguranca"
            control={control}
            render={({ field }) => (
              <S.Input
                id="codigoSeguranca"
                inputMode="numeric"
                placeholder="123"
                $erro={!!errors.codigoSeguranca}
                value={field.value ?? ''}
                onChange={evento =>
                  field.onChange(maskCVV(evento.target.value))
                }
              />
            )}
          />
          {errors.codigoSeguranca && (
            <S.Erro>{errors.codigoSeguranca.message}</S.Erro>
          )}
        </S.Campo>
      </S.Grid>

      {/* RF0027: exatamente um cartão do cliente fica como preferencial. */}
      <S.Checkbox>
        <input type="checkbox" {...register('preferencial')} />
        Definir como cartão preferencial
      </S.Checkbox>

      {ofereceSalvarNoPerfil && (
        <S.Checkbox>
          <input
            type="checkbox"
            checked={salvarNoPerfil}
            onChange={evento => setSalvarNoPerfil(evento.target.checked)}
          />
          Salvar este cartão no meu perfil
        </S.Checkbox>
      )}

      <S.Acoes>
        <SecondaryButton label="Cancelar" onClick={onCancelar} />
        <PrimaryButton
          type="submit"
          label={cartao ? 'Salvar alterações' : 'Adicionar cartão'}
          loading={isPending}
        />
      </S.Acoes>
    </S.Form>
  );
};

export default CartaoForm;
