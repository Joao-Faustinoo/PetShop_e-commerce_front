/**
 * [VIEW] EnderecoForm
 *
 * O QUE FAZ: formulário de endereço de entrega ou cobrança.
 *
 * COMO FARÁ: react-hook-form com o EnderecoSchema. Campos de apelido, tipo (entrega ou
 * cobrança), tipo de residência, tipo de logradouro, logradouro, número,
 * bairro, CEP, cidade, estado, país e observações opcionais. Usado tanto no
 * perfil quanto dentro do checkout, onde ganha a caixa de salvar no perfil.
 *
 * ATENDE: RF0026, RF0035, RN0023
 */

'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { Endereco, TipoEndereco } from '@/types/enderecos/types';
import { maskCEP } from '@/utils/masks';
import { EnderecoSchema, IEnderecoForm } from '@/validations/EnderecoSchema';

import * as S from './styles';

interface EnderecoFormProps {
  endereco?: Endereco;
  /** Fixa o tipo quando o contexto já o determina (ex.: checkout). */
  tipoFixo?: TipoEndereco;
  onSubmit: (dados: IEnderecoForm, salvarNoPerfil: boolean) => void;
  onCancelar: () => void;
  isPending?: boolean;
  /** RF0035: no checkout, oferece incorporar o endereço ao perfil. */
  ofereceSalvarNoPerfil?: boolean;
}

const EnderecoForm = ({
  endereco,
  tipoFixo,
  onSubmit,
  onCancelar,
  isPending,
  ofereceSalvarNoPerfil = false,
}: EnderecoFormProps) => {
  const { tiposResidencia, tiposLogradouro } = useDominiosController();
  const [salvarNoPerfil, setSalvarNoPerfil] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IEnderecoForm>({
    resolver: yupResolver(EnderecoSchema),
    defaultValues: {
      apelido: endereco?.apelido ?? '',
      tipo: endereco?.tipo ?? tipoFixo ?? 'ENTREGA',
      tipoResidenciaId: endereco?.tipoResidenciaId ?? 1,
      tipoLogradouroId: endereco?.tipoLogradouroId ?? 1,
      logradouro: endereco?.logradouro ?? '',
      numero: endereco?.numero ?? '',
      bairro: endereco?.bairro ?? '',
      cep: endereco?.cep ?? '',
      cidade: endereco?.cidade ?? '',
      estado: endereco?.estado ?? '',
      pais: endereco?.pais ?? 'Brasil',
      observacoes: endereco?.observacoes ?? '',
    },
  });

  return (
    <S.Form
      id="endereco-form"
      onSubmit={handleSubmit(dados => onSubmit(dados, salvarNoPerfil))}
    >
      <S.Grid>
        {/* RF0026: o apelido é a frase curta que identifica o endereço. */}
        <S.Campo>
          <S.Label htmlFor="apelido">Nome do endereço</S.Label>
          <S.Input
            id="apelido"
            placeholder="Ex.: Casa, Trabalho"
            $erro={!!errors.apelido}
            {...register('apelido')}
          />
          {errors.apelido && <S.Erro>{errors.apelido.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="tipo">Finalidade</S.Label>
          <S.Select
            id="tipo"
            disabled={!!tipoFixo}
            $erro={!!errors.tipo}
            {...register('tipo')}
          >
            <option value="ENTREGA">Entrega</option>
            <option value="COBRANCA">Cobrança</option>
          </S.Select>
          {errors.tipo && <S.Erro>{errors.tipo.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="tipoResidenciaId">Tipo de residência</S.Label>
          <S.Select
            id="tipoResidenciaId"
            $erro={!!errors.tipoResidenciaId}
            {...register('tipoResidenciaId')}
          >
            {tiposResidencia.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </S.Select>
          {errors.tipoResidenciaId && (
            <S.Erro>{errors.tipoResidenciaId.message}</S.Erro>
          )}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="tipoLogradouroId">Tipo de logradouro</S.Label>
          <S.Select
            id="tipoLogradouroId"
            $erro={!!errors.tipoLogradouroId}
            {...register('tipoLogradouroId')}
          >
            {tiposLogradouro.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </S.Select>
          {errors.tipoLogradouroId && (
            <S.Erro>{errors.tipoLogradouroId.message}</S.Erro>
          )}
        </S.Campo>

        <S.Campo $span={2}>
          <S.Label htmlFor="logradouro">Logradouro</S.Label>
          <S.Input
            id="logradouro"
            placeholder="Ex.: das Acácias"
            $erro={!!errors.logradouro}
            {...register('logradouro')}
          />
          {errors.logradouro && <S.Erro>{errors.logradouro.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="numero">Número / complemento</S.Label>
          <S.Input
            id="numero"
            placeholder="Ex.: 210, apto 74"
            $erro={!!errors.numero}
            {...register('numero')}
          />
          {errors.numero && <S.Erro>{errors.numero.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="bairro">Bairro</S.Label>
          <S.Input
            id="bairro"
            $erro={!!errors.bairro}
            {...register('bairro')}
          />
          {errors.bairro && <S.Erro>{errors.bairro.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="cep">CEP</S.Label>
          <Controller
            name="cep"
            control={control}
            render={({ field }) => (
              <S.Input
                id="cep"
                inputMode="numeric"
                placeholder="00000-000"
                $erro={!!errors.cep}
                value={field.value ?? ''}
                onChange={evento =>
                  field.onChange(maskCEP(evento.target.value))
                }
              />
            )}
          />
          {errors.cep && <S.Erro>{errors.cep.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="cidade">Cidade</S.Label>
          <S.Input
            id="cidade"
            $erro={!!errors.cidade}
            {...register('cidade')}
          />
          {errors.cidade && <S.Erro>{errors.cidade.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="estado">Estado (UF)</S.Label>
          <S.Input
            id="estado"
            maxLength={2}
            placeholder="SP"
            $erro={!!errors.estado}
            {...register('estado')}
          />
          {errors.estado && <S.Erro>{errors.estado.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="pais">País</S.Label>
          <S.Input id="pais" $erro={!!errors.pais} {...register('pais')} />
          {errors.pais && <S.Erro>{errors.pais.message}</S.Erro>}
        </S.Campo>

        {/* RN0023: o único campo opcional do endereço. */}
        <S.Campo $span={2}>
          <S.Label htmlFor="observacoes">Observações (opcional)</S.Label>
          <S.Textarea
            id="observacoes"
            placeholder="Ex.: Portaria 24 horas."
            $erro={!!errors.observacoes}
            {...register('observacoes')}
          />
          {errors.observacoes && <S.Erro>{errors.observacoes.message}</S.Erro>}
        </S.Campo>
      </S.Grid>

      {/* RF0035: incorporar ao perfil o endereço criado no checkout. */}
      {ofereceSalvarNoPerfil && (
        <S.Checkbox>
          <input
            type="checkbox"
            checked={salvarNoPerfil}
            onChange={evento => setSalvarNoPerfil(evento.target.checked)}
          />
          Salvar este endereço no meu perfil
        </S.Checkbox>
      )}

      <S.Acoes>
        <SecondaryButton label="Cancelar" onClick={onCancelar} />
        <PrimaryButton
          type="submit"
          label={endereco ? 'Salvar alterações' : 'Adicionar endereço'}
          loading={isPending}
        />
      </S.Acoes>
    </S.Form>
  );
};

export default EnderecoForm;
