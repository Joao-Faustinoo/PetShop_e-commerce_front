/**
 * [VIEW] ClienteForm
 *
 * O QUE FAZ: formulário de dados cadastrais do cliente, usado no autocadastro e na
 * alteração.
 *
 * COMO FARÁ: react-hook-form com yupResolver sobre o ClienteSchema. Campos de gênero,
 * nome, data de nascimento, CPF, telefone (tipo, DDD e número) e e-mail,
 * com as máscaras de utils/masks. Não tem campo de senha — fora do escopo
 * pelas premissas do login mockado.
 *
 * ATENDE: RF0021, RF0022, RN0026
 */

'use client';

import { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { Cliente } from '@/types/clientes/types';
import { maskCPF, maskDDD, maskTelefone } from '@/utils/masks';
import { ClienteSchema, IClienteForm } from '@/validations/ClienteSchema';

import * as S from './styles';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (dados: IClienteForm) => void;
  onCancelar?: () => void;
  isPending?: boolean;
  /** O autocadastro injeta aqui os dois endereços obrigatórios da RN0021/RN0022. */
  camposExtras?: ReactNode;
  rotuloSubmit?: string;
}

const generos = [
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'OUTRO', label: 'Outro' },
];

const ClienteForm = ({
  cliente,
  onSubmit,
  onCancelar,
  isPending,
  camposExtras,
  rotuloSubmit,
}: ClienteFormProps) => {
  const { tiposTelefone } = useDominiosController();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IClienteForm>({
    resolver: yupResolver(ClienteSchema),
    defaultValues: {
      nome: cliente?.nome ?? '',
      genero: cliente?.genero ?? 'FEMININO',
      dataNascimento: cliente?.dataNascimento ?? '',
      cpf: cliente?.cpf ?? '',
      email: cliente?.email ?? '',
      telefoneTipoId: cliente?.telefone.tipoId ?? 1,
      telefoneDDD: cliente?.telefone.ddd ?? '',
      telefoneNumero: cliente?.telefone.numero ?? '',
    },
  });

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <S.Secao>
        <legend>Dados pessoais</legend>

        <S.Grid>
          <S.Campo $span={2}>
            <S.Label htmlFor="nome">Nome completo</S.Label>
            <S.Input
              id="nome"
              placeholder="Nome e sobrenome"
              $erro={!!errors.nome}
              {...register('nome')}
            />
            {errors.nome && <S.Erro>{errors.nome.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="genero">Gênero</S.Label>
            <S.Select
              id="genero"
              $erro={!!errors.genero}
              {...register('genero')}
            >
              {generos.map(genero => (
                <option key={genero.value} value={genero.value}>
                  {genero.label}
                </option>
              ))}
            </S.Select>
            {errors.genero && <S.Erro>{errors.genero.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="dataNascimento">Data de nascimento</S.Label>
            <S.Input
              id="dataNascimento"
              type="date"
              $erro={!!errors.dataNascimento}
              {...register('dataNascimento')}
            />
            {errors.dataNascimento && (
              <S.Erro>{errors.dataNascimento.message}</S.Erro>
            )}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="cpf">CPF</S.Label>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <S.Input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  $erro={!!errors.cpf}
                  value={field.value ?? ''}
                  onChange={evento =>
                    field.onChange(maskCPF(evento.target.value))
                  }
                />
              )}
            />
            {errors.cpf && <S.Erro>{errors.cpf.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="email">E-mail</S.Label>
            <S.Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              $erro={!!errors.email}
              {...register('email')}
            />
            {errors.email && <S.Erro>{errors.email.message}</S.Erro>}
          </S.Campo>
        </S.Grid>
      </S.Secao>

      {/* RN0026: o telefone é composto por tipo, DDD e número. */}
      <S.Secao>
        <legend>Telefone</legend>

        <S.Grid $colunas={3}>
          <S.Campo>
            <S.Label htmlFor="telefoneTipoId">Tipo</S.Label>
            <S.Select
              id="telefoneTipoId"
              $erro={!!errors.telefoneTipoId}
              {...register('telefoneTipoId')}
            >
              {tiposTelefone.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </S.Select>
            {errors.telefoneTipoId && (
              <S.Erro>{errors.telefoneTipoId.message}</S.Erro>
            )}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="telefoneDDD">DDD</S.Label>
            <Controller
              name="telefoneDDD"
              control={control}
              render={({ field }) => (
                <S.Input
                  id="telefoneDDD"
                  inputMode="numeric"
                  placeholder="11"
                  $erro={!!errors.telefoneDDD}
                  value={field.value ?? ''}
                  onChange={evento =>
                    field.onChange(maskDDD(evento.target.value))
                  }
                />
              )}
            />
            {errors.telefoneDDD && (
              <S.Erro>{errors.telefoneDDD.message}</S.Erro>
            )}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="telefoneNumero">Número</S.Label>
            <Controller
              name="telefoneNumero"
              control={control}
              render={({ field }) => (
                <S.Input
                  id="telefoneNumero"
                  inputMode="numeric"
                  placeholder="98877-1234"
                  $erro={!!errors.telefoneNumero}
                  value={field.value ?? ''}
                  onChange={evento =>
                    field.onChange(maskTelefone(evento.target.value))
                  }
                />
              )}
            />
            {errors.telefoneNumero && (
              <S.Erro>{errors.telefoneNumero.message}</S.Erro>
            )}
          </S.Campo>
        </S.Grid>
      </S.Secao>

      {camposExtras}

      <S.Acoes>
        {onCancelar && (
          <SecondaryButton label="Cancelar" onClick={onCancelar} />
        )}
        <PrimaryButton
          type="submit"
          label={rotuloSubmit ?? (cliente ? 'Salvar alterações' : 'Cadastrar')}
          loading={isPending}
        />
      </S.Acoes>
    </S.Form>
  );
};

export default ClienteForm;
