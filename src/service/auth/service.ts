/**
 * [MODEL] Service de autenticação
 *
 * O QUE FAZ: resolve o login e o logout. Permanece mockado mesmo depois
 * da integração com o back-end, conforme as premissas do DRS.
 *
 * COMO FARÁ: `login(payload)` procura o e-mail em `mockCredenciais`,
 * ignora a senha (sem hash, sem verificação — premissa explícita), e
 * devolve `LoginResponse` com um token fake e o `Usuario` correspondente,
 * já contendo o perfil CLIENTE ou ADMIN. Se o e-mail não existir, rejeita
 * com "E-mail ou senha inválidos". `logout()` apenas resolve, pois não há
 * sessão no servidor para invalidar.
 *
 * ATENDE: premissas do projeto (login mockado, dois usuários)
 */

import { mockUsuarios } from '@/mock/auth/mock';
import { delay, delayErro } from '@/service/api/delay';
import { LoginPayload, LoginResponse } from '@/types/auth/types';

export const authService = {
  async login({ email }: LoginPayload): Promise<LoginResponse> {
    const usuario = mockUsuarios.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase(),
    );

    // A senha não é verificada: o login é mockado por premissa do DRS.
    if (!usuario) {
      return delayErro('E-mail ou senha inválidos');
    }

    return delay({
      token: `mock-token-${usuario.perfil.toLowerCase()}-${usuario.id}`,
      usuario,
    });
  },

  /** Não há sessão no servidor para invalidar. */
  async logout(): Promise<void> {
    return delay(undefined, 100);
  },
};
