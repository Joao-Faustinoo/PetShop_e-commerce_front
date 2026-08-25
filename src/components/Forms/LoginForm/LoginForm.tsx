/**
 * [VIEW] LoginForm
 *
 * O QUE FAZ: formulário de entrada no sistema, com os dois perfis
 * mockados.
 *
 * COMO FARÁ: react-hook-form com yupResolver sobre o LoginSchema e submit
 * delegado ao useLoginController, que resolve o login contra os usuários
 * pré-cadastrados e redireciona conforme o perfil. Traz atalhos visíveis
 * para preencher as credenciais do cliente e do administrador, já que a
 * autenticação é mockada por premissa e a banca precisa alternar entre os
 * dois perfis. Sem recuperação de senha nem confirmação — fora do escopo.
 *
 * ATENDE: premissas do projeto (login mockado, dois usuários)
 */

'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import PrimaryButton from '@/components/Buttons/Primary/button';
import { useLoginController } from '@/controllers/auth/useLoginController';
import { mockCredenciais } from '@/mock/auth/mock';
import { ILoginForm, LoginSchema } from '@/validations/LoginSchema';

import * as S from './styles';

const LoginForm = () => {
  const { login, isPending } = useLoginController();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ILoginForm>({
    resolver: yupResolver(LoginSchema),
    defaultValues: { email: '', senha: '' },
  });

  /** Preenche as credenciais de um dos perfis pré-cadastrados. */
  const usarCredencial = (email: string, senha: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('senha', senha, { shouldValidate: true });
  };

  return (
    <S.Card>
      <S.Titulo>
        <S.Marca src="/marca/logo.svg" alt="" aria-hidden />
        <h1>PetShop</h1>
        <p>Roupas e acessórios para o seu pet</p>
      </S.Titulo>

      <S.Form onSubmit={handleSubmit(dados => login(dados))}>
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

        <S.Campo>
          <S.Label htmlFor="senha">Senha</S.Label>
          <S.Input
            id="senha"
            type="password"
            placeholder="••••••••"
            $erro={!!errors.senha}
            {...register('senha')}
          />
          {errors.senha && <S.Erro>{errors.senha.message}</S.Erro>}
        </S.Campo>

        <PrimaryButton type="submit" label="Entrar" full loading={isPending} />
      </S.Form>

      {/* A autenticação é mockada: os dois perfis ficam à mão para a banca. */}
      <S.Atalhos>
        <small>Acesso de demonstração</small>

        {mockCredenciais.map(credencial => (
          <S.Atalho
            key={credencial.perfil}
            type="button"
            onClick={() => usarCredencial(credencial.email, credencial.senha)}
          >
            {credencial.rotulo}
          </S.Atalho>
        ))}
      </S.Atalhos>

      <S.Cadastro>
        Ainda não tem conta? <Link href="/cadastro">Cadastre-se</Link>
      </S.Cadastro>
    </S.Card>
  );
};

export default LoginForm;
