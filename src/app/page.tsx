/**
 * [VIEW] Rota: / - login
 *
 * O QUE FAZ: expõe a tela de login, única rota pública além do cadastro.
 *
 * COMO FARÁ: monta o LoginForm centralizado. Quem já está autenticado é
 * redirecionado pelo AuthProvider para a área do seu perfil.
 */

'use client';

import LoginForm from '@/components/Forms/LoginForm/LoginForm';

import { Main } from './styles';

const Login = () => {
  return (
    <Main>
      <LoginForm />
    </Main>
  );
};

export default Login;
