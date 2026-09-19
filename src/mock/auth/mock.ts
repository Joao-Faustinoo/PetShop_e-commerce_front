/**
 * [MODEL] Mock de credenciais
 *
 * O QUE FAZ: guarda o par e-mail/senha dos dois usuários pré-cadastrados
 * que as premissas do DRS exigem — um com perfil CLIENTE e um com perfil
 * ADMIN — para que a tela de login os ofereça como atalho.
 *
 * COMO FARÁ: exporta `mockCredenciais`, que o LoginForm percorre para
 * montar os botões de preenchimento rápido. A senha não passa por
 * verificação nenhuma, nem aqui nem na API, conforme a premissa.
 *
 * ESTADO: `mockUsuarios` saiu daqui quando o authService passou a chamar
 * POST /auth/login. Quem devolve o `Usuario` da sessão agora é a API, que
 * lê o cadastro real no banco — ver `api/src/services/authService.ts`.
 *
 * ATENDE: premissas do projeto (login mockado com dois perfis)
 */

/**
 * Credenciais exibidas na tela de login como atalho. O e-mail precisa
 * existir no banco (o `user.cliente@email.com` vem do seed; o
 * `user.admin@email.com` é o administrador pré-cadastrado na API); a senha
 * está aqui apenas para o formulário ter o que preencher.
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
