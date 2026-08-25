/**
 * [MODEL] Mock de usuários
 *
 * O QUE FAZ: guarda os dois usuários pré-cadastrados que as premissas do
 * DRS exigem — um com perfil CLIENTE e um com perfil ADMIN — para que o
 * login mockado consiga simular as duas sessões.
 *
 * COMO FARÁ: exporta `mockUsuarios` com um cliente (vinculado ao cliente
 * de id 1 do mockClientes) e um administrador, e `mockCredenciais` com o
 * par e-mail/senha aceito de cada um. O authService compara o e-mail
 * recebido contra esta lista; a senha é aceita sem nenhuma verificação
 * criptográfica, conforme a premissa.
 *
 * ATENDE: premissas do projeto (login mockado com dois perfis)
 */

import { Usuario } from '@/types/auth/types';

export const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nome: 'João Faustino',
    email: 'user.cliente@email.com',
    perfil: 'CLIENTE',
    clienteId: 1,
  },
  {
    id: 2,
    nome: 'João Faustino',
    email: 'user.admin@email.com',
    perfil: 'ADMIN',
  },
];

/**
 * Credenciais exibidas na tela de login como atalho. A senha não passa por
 * nenhuma verificação — está aqui apenas para o formulário ter o que
 * preencher, conforme a premissa de login mockado.
 */
export const mockCredenciais = [
  {
    perfil: 'CLIENTE' as const,
    rotulo: 'Entrar como cliente',
    email: 'user.cliente@email.com',
    senha: '123@Pass',
  },
  {
    perfil: 'ADMIN' as const,
    rotulo: 'Entrar como administrador',
    email: 'user.admin@email.com',
    senha: '123@Pass',
  },
];
