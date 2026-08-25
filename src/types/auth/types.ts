/**
 * [MODEL] Tipos de autenticação
 *
 * O QUE FAZ: descreve o usuário logado e o payload/resposta do login, que
 * neste projeto é permanentemente mockado (premissa do DRS).
 *
 * COMO FARÁ: exporta `Perfil = CLIENTE | ADMIN`, `Usuario` (id, nome,
 * email, perfil e clienteId quando for CLIENTE), `LoginPayload`
 * (email + senha) e `LoginResponse` (token fake + usuario). Não há tipo
 * para recuperação de senha nem confirmação — removidos do escopo pelas
 * premissas do documento.
 *
 * ATENDE: premissas do projeto (login mockado, dois usuários pré-cadastrados)
 */

export type Perfil = 'CLIENTE' | 'ADMIN';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  /** Preenchido apenas quando o perfil é CLIENTE. */
  clienteId?: number;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  /** Token fake: não há autenticação real por premissa do DRS. */
  token: string;
  usuario: Usuario;
}
