/**
 * [MODEL] Service de autenticação
 *
 * O QUE FAZ: resolve o login e o logout.
 *
 * COMO FARÁ: `login(payload)` faz POST /auth/login e devolve
 * `LoginResponse` com o token e o `Usuario` já com o perfil CLIENTE ou
 * ADMIN. A API responde 401 com "E-mail ou senha inválidos" quando o
 * e-mail não existe, e o `api()` converte isso no Error que o handleToast
 * exibe. `logout()` apenas resolve, pois não há sessão no servidor para
 * invalidar — o token é um JWT e vale até expirar.
 *
 * A senha continua não sendo verificada: a premissa do DRS vale também no
 * back-end, que aceita qualquer senha para um e-mail cadastrado. O que
 * mudou em relação ao mock é que o token agora é assinado de verdade, e é
 * ele que abre as rotas protegidas da API.
 *
 * ATENDE: premissas do projeto (login mockado, dois usuários)
 */

import { api } from '@/service/api/request';
import { LoginPayload, LoginResponse } from '@/types/auth/types';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  async logout(): Promise<void> {
    // Não há sessão no servidor para invalidar: o JWT expira sozinho.
  },
};
